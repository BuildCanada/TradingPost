import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { google } from "googleapis";

function parseCsv(csv: string): Record<string, string>[] {
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
  if (current || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = r[i] ?? "";
    });
    return obj;
  });
}

// Convert string back to appropriate types for each model
function parseBool(v: string): boolean {
  return v === "true" || v === "1";
}
function parseDate(v: string): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
function parseOptionalDate(v: string): Date | undefined {
  const d = parseDate(v);
  return d ?? undefined;
}
function parseRequiredDate(v: string): Date {
  return parseDate(v) ?? new Date();
}
function parseOptionalInt(v: string): number {
  const n = parseInt(v);
  return isNaN(n) ? 0 : n;
}
function strOrNull(v: string): string | null {
  return v || null;
}

async function importFeedItems(rows: Record<string, string>[], mode: string) {
  if (mode === "replace") {
    await prisma.feedItem.deleteMany();
  }
  let imported = 0;
  for (const row of rows) {
    if (!row.id) continue;
    await prisma.feedItem.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        type: row.type || "BLOG",
        title: strOrNull(row.title),
        subtitle: strOrNull(row.subtitle),
        author: strOrNull(row.author),
        authorPhoto: strOrNull(row.authorPhoto),
        image: strOrNull(row.image),
        body: strOrNull(row.body),
        url: strOrNull(row.url),
        embedCode: strOrNull(row.embedCode),
        sourceUrl: strOrNull(row.sourceUrl),
        tags: strOrNull(row.tags),
        featured: parseBool(row.featured),
        createdAt: parseRequiredDate(row.createdAt),
        updatedAt: parseRequiredDate(row.updatedAt),
      },
      update: {
        type: row.type || "BLOG",
        title: strOrNull(row.title),
        subtitle: strOrNull(row.subtitle),
        author: strOrNull(row.author),
        authorPhoto: strOrNull(row.authorPhoto),
        image: strOrNull(row.image),
        body: strOrNull(row.body),
        url: strOrNull(row.url),
        embedCode: strOrNull(row.embedCode),
        sourceUrl: strOrNull(row.sourceUrl),
        tags: strOrNull(row.tags),
        featured: parseBool(row.featured),
        updatedAt: parseRequiredDate(row.updatedAt),
      },
    });
    imported++;
  }
  return imported;
}

async function importMemos(rows: Record<string, string>[], mode: string) {
  if (mode === "replace") {
    await prisma.memo.deleteMany();
  }
  let imported = 0;
  for (const row of rows) {
    if (!row.id || !row.slug) continue;
    await prisma.memo.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        title: row.title || "Untitled",
        slug: row.slug,
        author: row.author || "Unknown",
        authorImage: strOrNull(row.authorImage),
        keyMessage1: row.keyMessage1 || "",
        keyMessage2: strOrNull(row.keyMessage2),
        keyMessage3: strOrNull(row.keyMessage3),
        body: row.body || "",
        supporters: strOrNull(row.supporters),
        splashImage: strOrNull(row.splashImage),
        seoImage: strOrNull(row.seoImage),
        category: strOrNull(row.category),
        publishedAt: parseOptionalDate(row.publishedAt),
        twitterEmbed: strOrNull(row.twitterEmbed),
        featured: parseBool(row.featured),
        createdAt: parseRequiredDate(row.createdAt),
        updatedAt: parseRequiredDate(row.updatedAt),
      },
      update: {
        title: row.title || "Untitled",
        slug: row.slug,
        author: row.author || "Unknown",
        authorImage: strOrNull(row.authorImage),
        keyMessage1: row.keyMessage1 || "",
        keyMessage2: strOrNull(row.keyMessage2),
        keyMessage3: strOrNull(row.keyMessage3),
        body: row.body || "",
        supporters: strOrNull(row.supporters),
        splashImage: strOrNull(row.splashImage),
        seoImage: strOrNull(row.seoImage),
        category: strOrNull(row.category),
        publishedAt: parseOptionalDate(row.publishedAt),
        twitterEmbed: strOrNull(row.twitterEmbed),
        featured: parseBool(row.featured),
        updatedAt: parseRequiredDate(row.updatedAt),
      },
    });
    imported++;
  }
  return imported;
}

async function importTeamMembers(rows: Record<string, string>[], mode: string) {
  if (mode === "replace") {
    await prisma.teamMember.deleteMany();
  }
  let imported = 0;
  for (const row of rows) {
    if (!row.id) continue;
    await prisma.teamMember.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        name: row.name || "Unknown",
        title: row.title || "",
        photo: strOrNull(row.photo),
        xUrl: strOrNull(row.xUrl),
        linkedinUrl: strOrNull(row.linkedinUrl),
        order: parseOptionalInt(row.order),
        createdAt: parseRequiredDate(row.createdAt),
        updatedAt: parseRequiredDate(row.updatedAt),
      },
      update: {
        name: row.name || "Unknown",
        title: row.title || "",
        photo: strOrNull(row.photo),
        xUrl: strOrNull(row.xUrl),
        linkedinUrl: strOrNull(row.linkedinUrl),
        order: parseOptionalInt(row.order),
        updatedAt: parseRequiredDate(row.updatedAt),
      },
    });
    imported++;
  }
  return imported;
}

async function importTestimonials(rows: Record<string, string>[], mode: string) {
  if (mode === "replace") {
    await prisma.testimonial.deleteMany();
  }
  let imported = 0;
  for (const row of rows) {
    if (!row.id) continue;
    await prisma.testimonial.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        name: row.name || "Unknown",
        quote: row.quote || "",
        profilePhoto: strOrNull(row.profilePhoto),
        splashPhoto: strOrNull(row.splashPhoto),
        order: parseOptionalInt(row.order),
        createdAt: parseRequiredDate(row.createdAt),
        updatedAt: parseRequiredDate(row.updatedAt),
      },
      update: {
        name: row.name || "Unknown",
        quote: row.quote || "",
        profilePhoto: strOrNull(row.profilePhoto),
        splashPhoto: strOrNull(row.splashPhoto),
        order: parseOptionalInt(row.order),
        updatedAt: parseRequiredDate(row.updatedAt),
      },
    });
    imported++;
  }
  return imported;
}

// Source: "csv" reads from local backups/, "sheets" pulls from Google Sheets
// Mode: "upsert" (merge) or "replace" (wipe + reimport)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const source: string = body.source || "csv"; // "csv" | "sheets"
    const mode: string = body.mode || "upsert";  // "upsert" | "replace"

    const csvData: Record<string, Record<string, string>[]> = {};

    if (source === "sheets") {
      // Pull from Google Sheets
      const spreadsheetId = process.env.GOOGLE_BACKUP_SPREADSHEET_ID;
      if (!spreadsheetId) {
        return NextResponse.json({ error: "GOOGLE_BACKUP_SPREADSHEET_ID not set" }, { status: 500 });
      }
      const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      if (!credentialsJson) {
        return NextResponse.json({ error: "GOOGLE_SERVICE_ACCOUNT_KEY not set" }, { status: 500 });
      }
      const credentials = JSON.parse(credentialsJson);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      });
      const sheets = google.sheets({ version: "v4", auth });

      for (const name of ["feed_items", "memos", "team_members", "testimonials"]) {
        try {
          const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${name}!A:ZZ`,
          });
          const values = res.data.values;
          if (!values || values.length < 2) continue;
          const headers = values[0] as string[];
          csvData[name] = values.slice(1).map((row) => {
            const obj: Record<string, string> = {};
            headers.forEach((h, i) => { obj[h] = (row[i] as string) ?? ""; });
            return obj;
          });
        } catch {
          // Sheet tab may not exist, skip
        }
      }
    } else {
      // Read from local CSV files
      const backupsDir = path.join(process.cwd(), "backups");
      for (const name of ["feed_items", "memos", "team_members", "testimonials"]) {
        const csvPath = path.join(backupsDir, `${name}_latest.csv`);
        if (!fs.existsSync(csvPath)) continue;
        const content = fs.readFileSync(csvPath, "utf-8");
        csvData[name] = parseCsv(content);
      }
    }

    const results: { model: string; imported: number }[] = [];

    if (csvData.feed_items) {
      results.push({ model: "feed_items", imported: await importFeedItems(csvData.feed_items, mode) });
    }
    if (csvData.memos) {
      results.push({ model: "memos", imported: await importMemos(csvData.memos, mode) });
    }
    if (csvData.team_members) {
      results.push({ model: "team_members", imported: await importTeamMembers(csvData.team_members, mode) });
    }
    if (csvData.testimonials) {
      results.push({ model: "testimonials", imported: await importTestimonials(csvData.testimonials, mode) });
    }

    return NextResponse.json({
      success: true,
      source,
      mode,
      results,
      total: results.reduce((sum, r) => sum + r.imported, 0),
    });
  } catch (error) {
    console.error("Backup import error:", error);
    return NextResponse.json(
      { error: "Import failed", details: String(error) },
      { status: 500 }
    );
  }
}
