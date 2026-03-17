import { createReadStream } from "fs";
import { parse } from "csv-parse";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

function slugToName(slug) {
  if (!slug) return "";
  return slug
    .split("-")
    .map((w) => {
      // Handle single-letter parts like middle initials
      if (w.length <= 2) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

async function main() {
  const csvPath = path.join(__dirname, "..", "Memoscsv.csv");
  const records = [];

  const parser = createReadStream(csvPath).pipe(
    parse({ columns: true, skip_empty_lines: true, relax_quotes: true, relax_column_count: true })
  );

  for await (const row of parser) {
    records.push(row);
  }

  console.log(`Parsed ${records.length} rows from CSV`);

  let created = 0;
  let skipped = 0;

  for (const row of records) {
    const slug = (row["Slug"] || "").trim();
    const title = (row["Memo Title"] || "").trim();

    if (!slug || !title) {
      console.log(`  SKIP: missing slug or title`);
      skipped++;
      continue;
    }

    // Check if already exists
    const existing = await prisma.memo.findUnique({ where: { slug } });
    if (existing) {
      console.log(`  SKIP: ${slug} (already exists)`);
      skipped++;
      continue;
    }

    const author = slugToName(row["Builder"] || "");
    const body = (row["Body"] || "").trim();
    const supporters = (row["Supporters"] || "").trim() || null;
    const keyMessage1 = (row["Key Message 1"] || "").trim();
    const keyMessage2 = (row["Key Message 2"] || "").trim() || null;
    const keyMessage3 = (row["Key Message 3"] || "").trim() || null;
    const category = (row["Category"] || "").trim() || null;
    const twitterEmbed = (row["Twitter Embed"] || "").trim() || null;
    const seoImage = (row["SEO Image"] || "").trim() || null;
    const publishedAt = parseDate(row["Published On"]);
    const createdAt = parseDate(row["Created On"]) || new Date();

    if (!author || !body || !keyMessage1) {
      console.log(`  SKIP: ${slug} (missing required fields)`);
      skipped++;
      continue;
    }

    await prisma.memo.create({
      data: {
        title,
        slug,
        author,
        authorImage: null,
        keyMessage1,
        keyMessage2,
        keyMessage3,
        body,
        supporters,
        seoImage,
        category,
        publishedAt,
        twitterEmbed,
        featured: false,
        createdAt,
      },
    });

    console.log(`  OK: ${slug} — "${title}" by ${author}`);
    created++;
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
