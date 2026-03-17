import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBgVfHS-PgbGbaeiZ3-OysJQNjRcWPy8bdGlqk9KOUsfbSOzXWmu3ShPJRYYFo8ctfWxZrc9OY_Zu9/pub?gid=0&single=true&output=csv";

/** Detect feed type from a post URL */
function detectType(url: string): string | null {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (lower.includes("x.com") || lower.includes("twitter.com")) return "X";
  if (lower.includes("instagram.com")) return "IG";
  if (lower.includes("tiktok.com")) return "TIKTOK";
  if (lower.includes("substack.com")) return "SUBSTACK";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "YOUTUBE";
  return null;
}

/** Parse full CSV text into rows, correctly handling quoted fields with newlines */
function parseCSV(text: string): Record<string, string>[] {
  // Normalize line endings
  const input = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Parse all records (fields can contain newlines when quoted)
  const records: string[][] = [];
  let fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch; // includes newlines inside quotes
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current);
        current = "";
      } else if (ch === "\n") {
        fields.push(current);
        current = "";
        records.push(fields);
        fields = [];
      } else {
        current += ch;
      }
    }
  }
  // Push last field/record
  fields.push(current);
  if (fields.some((f) => f.trim())) {
    records.push(fields);
  }

  if (records.length < 2) return [];

  const headers = records[0];
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < records.length; i++) {
    const values = records[i];
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] || "").trim();
    });
    // Skip empty rows (no URL)
    if (row["URL"]) {
      rows.push(row);
    }
  }

  return rows;
}

export async function POST() {
  try {
    // Fetch the published CSV
    const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch sheet: ${res.status}` },
        { status: 502 }
      );
    }

    const csvText = await res.text();
    const rows = parseCSV(csvText);

    if (rows.length === 0) {
      return NextResponse.json({ imported: 0, skipped: 0, message: "No rows found in sheet" });
    }

    // Get all existing URLs for dedup (use url field which is always present)
    const existing = await prisma.feedItem.findMany({
      select: { url: true },
    });
    const existingUrls = new Set(
      existing.map((e) => e.url).filter(Boolean)
    );

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      const postUrl = row["URL"] || "";
      if (!postUrl) {
        skipped++;
        continue;
      }

      // Skip if we already have this URL
      if (existingUrls.has(postUrl)) {
        skipped++;
        continue;
      }

      const type = detectType(postUrl);
      if (!type) {
        skipped++;
        continue;
      }

      const caption = row["Caption"] && row["Caption"] !== "-" ? row["Caption"] : "";
      const thumbnail = row["Thumbnail"] && row["Thumbnail"] !== "-" ? row["Thumbnail"] : "";
      const embedCode = row["Embed Code"] && row["Embed Code"] !== "-" ? row["Embed Code"] : "";
      const createdAt = row["Created At"] ? new Date(row["Created At"]) : new Date();

      // Use caption as title (truncated) and body
      const title = caption.length > 120 ? caption.slice(0, 120) + "…" : caption || null;

      await prisma.feedItem.create({
        data: {
          type,
          title,
          body: caption || null,
          image: thumbnail || null,
          url: postUrl,
          sourceUrl: postUrl,
          embedCode: embedCode || null,
          author: "@build_canada",
          createdAt: isNaN(createdAt.getTime()) ? new Date() : createdAt,
        },
      });

      existingUrls.add(postUrl);
      imported++;
    }

    return NextResponse.json({ imported, skipped, total: rows.length });
  } catch (err) {
    console.error("Feed sync error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
