import { before, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { exportPKCS8, generateKeyPair, jwtVerify, type KeyLike } from "jose";

import { upsertSheetRow } from "./google-sheet";

// An in-memory stand-in for the Sheets API and Google's token endpoint, just
// enough of each for upsertSheetRow: read the tab, write the header row,
// append a row, and batch-update cells.

let publicKey: KeyLike;

before(async () => {
  const keys = await generateKeyPair("RS256", { extractable: true });
  publicKey = keys.publicKey;
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "sheets@test.iam.gserviceaccount.com";
  // Stored with literal \n, the way env dashboards often hold it.
  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = (
    await exportPKCS8(keys.privateKey)
  ).replace(/\n/g, "\\n");
  process.env.GOOGLE_SHEET_ID = "sheet123";
});

let grid: string[][];
let tokenRequests: number;

beforeEach(() => {
  grid = [];
  tokenRequests = 0;
});

const cell = (a1: string) => {
  const [, letters, row] = a1.match(/^([A-Z]+)(\d+)$/)!;
  const col = [...letters].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0);
  return { row: Number(row) - 1, col: col - 1 };
};

globalThis.fetch = (async (input: string | URL, init: RequestInit = {}) => {
  const url = new URL(String(input));
  const json = (body: unknown) =>
    new Response(JSON.stringify(body), { status: 200 });

  if (url.host === "oauth2.googleapis.com") {
    tokenRequests++;
    const assertion = new URLSearchParams(String(init.body)).get("assertion")!;
    const { payload } = await jwtVerify(assertion, publicKey, {
      issuer: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      audience: "https://oauth2.googleapis.com/token",
    });
    assert.equal(payload.scope, "https://www.googleapis.com/auth/spreadsheets");
    return json({ access_token: "token", expires_in: 3600 });
  }

  assert.equal(new Headers(init.headers).get("Authorization"), "Bearer token");
  const path = decodeURIComponent(url.pathname).replace(
    "/v4/spreadsheets/sheet123",
    "",
  );
  const body = init.body ? JSON.parse(String(init.body)) : undefined;

  if (path === "/values/'Sign-ups'!A:ZZ") {
    return json(grid.length ? { values: grid } : {});
  }
  if (path === "/values/'Sign-ups'!1:1" && init.method === "PUT") {
    grid[0] = body.values[0];
    return json({});
  }
  if (path === "/values/'Sign-ups'!A:A:append") {
    assert.equal(url.searchParams.get("valueInputOption"), "RAW");
    grid.push(body.values[0]);
    return json({});
  }
  if (path === "/values:batchUpdate") {
    assert.equal(body.valueInputOption, "RAW");
    for (const { range, values } of body.data) {
      const { row, col } = cell(range.replace("'Sign-ups'!", ""));
      grid[row][col] = values[0][0];
    }
    return json({});
  }
  throw new Error(`Unexpected request: ${init.method ?? "GET"} ${path}`);
}) as typeof fetch;

const write = (email: string, values: Record<string, string>) =>
  upsertSheetRow({
    tab: "Sign-ups",
    columns: ["Signed up at", "Email", "Phone", "Availability"],
    email,
    values,
  });

test("writes the header row and the first sign-up to an empty sheet", async () => {
  assert.equal(await write("A@x.com", { "Signed up at": "t1", Phone: "p1" }), true);
  assert.deepEqual(grid, [
    ["Signed up at", "Email", "Phone", "Availability"],
    ["t1", "a@x.com", "p1", ""],
  ]);
});

test("fills in the existing row for the same email, whatever its case", async () => {
  await write("a@x.com", { "Signed up at": "t1", Phone: "p1" });
  await write("b@x.com", { "Signed up at": "t2", Phone: "p2" });
  await write("A@X.com", { Availability: "Morning" });
  assert.deepEqual(grid.slice(1), [
    ["t1", "a@x.com", "p1", "Morning"],
    ["t2", "b@x.com", "p2", ""],
  ]);
});

test("follows the Sheet's own column order and adds missing columns", async () => {
  grid = [["Phone", "Email", "Signed up at"]];
  await write("a@x.com", { "Signed up at": "t1", Phone: "p1", Issues: "Housing" });
  assert.deepEqual(grid, [
    ["Phone", "Email", "Signed up at", "Issues"],
    ["p1", "a@x.com", "t1", "Housing"],
  ]);
});

test("reuses the access token across writes", async () => {
  await write("a@x.com", { Phone: "p1" });
  await write("b@x.com", { Phone: "p2" });
  assert.ok(tokenRequests <= 1);
});

test("skips the Sheet when it isn't configured outside production", async () => {
  const id = process.env.GOOGLE_SHEET_ID;
  delete process.env.GOOGLE_SHEET_ID;
  try {
    assert.equal(await write("a@x.com", { Phone: "p1" }), false);
    assert.deepEqual(grid, []);
  } finally {
    process.env.GOOGLE_SHEET_ID = id;
  }
});
