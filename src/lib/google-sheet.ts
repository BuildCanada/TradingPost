// Writes rows to a Google Sheet through the Sheets API, as a service account.
//
// Setup: create a service account in Google Cloud with the Sheets API enabled,
// make it a JSON key, and share the Sheet with the account's email as an
// Editor. Then set:
//   GOOGLE_SERVICE_ACCOUNT_EMAIL        the account's client_email
//   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY  its private_key (\n escapes are fine)
//   GOOGLE_SHEET_ID                     from the Sheet's URL: /d/<id>/edit
//
// Rows are upserted by email: the first write for an email appends a row,
// later ones fill in that row. Values are keyed by header name, so columns can
// be reordered or added in the Sheet freely. Everything is written RAW, so a
// value someone typed is never read as a formula.

import { SignJWT, importPKCS8 } from "jose";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const EMAIL_COLUMN = "Email";

export type SheetRow = Record<string, string | undefined>;

/**
 * Upserts the row for `email` on the `tab` sheet. On an empty sheet, writes
 * `columns` as the header row first; a value whose header is missing gets a
 * new column at the end.
 *
 * Returns false without writing when the Sheet isn't configured outside
 * production (local development). In production a missing configuration
 * throws, since the Sheet is how sign-ups reach CJPAC.
 */
export async function upsertSheetRow({
  tab,
  columns,
  email,
  values,
}: {
  tab: string;
  columns: readonly string[];
  email: string;
  values: SheetRow;
}): Promise<boolean> {
  const config = sheetConfig();
  if (!config) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_EMAIL, _PRIVATE_KEY and GOOGLE_SHEET_ID must be set",
      );
    }
    return false;
  }
  const api = sheetsClient(config);
  const key = email.trim().toLowerCase();
  const range = (a1: string) => encodeURIComponent(`'${tab}'!${a1}`);

  const { values: rows = [] } = (await api(`/values/${range("A:ZZ")}`)) as {
    values?: string[][];
  };

  const headers = rows[0]?.length ? [...rows[0]] : [...columns];
  const written: SheetRow = { ...values, [EMAIL_COLUMN]: key };
  const missing = Object.keys(written).filter((h) => !headers.includes(h));
  headers.push(...missing);
  if (!rows[0]?.length || missing.length) {
    await api(`/values/${range("1:1")}?valueInputOption=RAW`, {
      method: "PUT",
      body: JSON.stringify({ values: [headers] }),
    });
  }

  const emailCol = headers.indexOf(EMAIL_COLUMN);
  const existing = rows.findIndex(
    (row, i) => i > 0 && row[emailCol]?.trim().toLowerCase() === key,
  );

  if (existing === -1) {
    await api(
      `/values/${range("A:A")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        body: JSON.stringify({
          values: [headers.map((h) => written[h] ?? "")],
        }),
      },
    );
  } else {
    // Only the columns this write carries; the rest of the row is left alone.
    const rowNumber = existing + 1;
    await api(`/values:batchUpdate`, {
      method: "POST",
      body: JSON.stringify({
        valueInputOption: "RAW",
        data: Object.entries(values)
          .filter(([, v]) => v !== undefined)
          .map(([h, v]) => ({
            range: `'${tab}'!${columnLetter(headers.indexOf(h))}${rowNumber}`,
            values: [[v]],
          })),
      }),
    });
  }
  return true;
}

/** "2026-10-16 09:20" in Toronto time: readable in the Sheet, and sorts. */
export function sheetTimestamp(date = new Date()): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}

type SheetConfig = { clientEmail: string; privateKey: string; sheetId: string };

function sheetConfig(): SheetConfig | null {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!clientEmail || !privateKey || !sheetId) return null;
  // Env files and dashboards often hold the key's newlines as literal \n.
  return { clientEmail, privateKey: privateKey.replace(/\\n/g, "\n"), sheetId };
}

function sheetsClient(config: SheetConfig) {
  return async (path: string, init: RequestInit = {}) => {
    const res = await fetch(`${SHEETS_API}/${config.sheetId}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${await accessToken(config)}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(
        `Google Sheets ${init.method ?? "GET"} failed: ${res.status} ${(await res.text()).slice(0, 300)}`,
      );
    }
    return res.json();
  };
}

// Tokens last an hour; reused across requests on a warm server.
let cachedToken: { value: string; expiresAt: number } | undefined;

/** Exchanges a signed JWT for an access token (Google's service account
 *  flow), without pulling in Google's client libraries. */
async function accessToken(config: SheetConfig): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }
  const now = Math.floor(Date.now() / 1000);
  const assertion = await new SignJWT({ scope: SCOPE })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(config.clientEmail)
    .setAudience(TOKEN_URL)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(await importPKCS8(config.privateKey, "RS256"));

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(
      `Google token exchange failed: ${res.status} ${(await res.text()).slice(0, 300)}`,
    );
  }
  const { access_token, expires_in } = await res.json();
  cachedToken = { value: access_token, expiresAt: Date.now() + expires_in * 1000 };
  return access_token;
}

/** 0 → "A", 25 → "Z", 26 → "AA". */
function columnLetter(index: number): string {
  let n = index + 1;
  let letters = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    letters = String.fromCharCode(65 + r) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}
