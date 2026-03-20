import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { google } from "googleapis";

const SHEET_NAMES = ["feed_items", "memos", "team_members", "testimonials"];

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (inQuotes) {
      if (ch === '"' && csv[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(current);
        current = "";
      } else if (ch === "\n" || (ch === "\r" && csv[i + 1] === "\n")) {
        row.push(current);
        current = "";
        rows.push(row);
        row = [];
        if (ch === "\r") i++;
      } else {
        current += ch;
      }
    }
  }
  // Last field/row
  if (current || row.length > 0) {
    row.push(current);
    rows.push(row);
  }
  return rows;
}

async function getAuth() {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentialsJson) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY env var not set");
  }
  const credentials = JSON.parse(credentialsJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return auth;
}

export async function POST() {
  try {
    const spreadsheetId = process.env.GOOGLE_BACKUP_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "GOOGLE_BACKUP_SPREADSHEET_ID env var not set" },
        { status: 500 }
      );
    }

    const auth = await getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    const backupsDir = path.join(process.cwd(), "backups");
    const results: { sheet: string; rows: number }[] = [];

    // Get existing sheet names
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = spreadsheet.data.sheets?.map((s) => s.properties?.title) || [];

    for (const name of SHEET_NAMES) {
      const csvPath = path.join(backupsDir, `${name}_latest.csv`);
      if (!fs.existsSync(csvPath)) continue;

      const csvContent = fs.readFileSync(csvPath, "utf-8");
      const data = parseCsv(csvContent);
      if (data.length === 0) continue;

      // Create sheet tab if it doesn't exist
      if (!existingSheets.includes(name)) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{ addSheet: { properties: { title: name } } }],
          },
        });
      }

      // Clear existing data
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${name}!A:ZZ`,
      });

      // Write new data
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${name}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: data },
      });

      results.push({ sheet: name, rows: data.length - 1 }); // -1 for header
    }

    return NextResponse.json({
      success: true,
      spreadsheetId,
      sheets: results,
    });
  } catch (error) {
    console.error("Push to Sheets error:", error);
    return NextResponse.json(
      { error: "Push failed", details: String(error) },
      { status: 500 }
    );
  }
}
