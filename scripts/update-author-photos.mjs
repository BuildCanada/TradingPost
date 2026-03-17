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

async function main() {
  const csvPath = path.join(__dirname, "..", "authors.csv");
  const records = [];

  const parser = createReadStream(csvPath).pipe(
    parse({ columns: true, skip_empty_lines: true, relax_quotes: true, relax_column_count: true })
  );

  for await (const row of parser) {
    records.push(row);
  }

  console.log(`Parsed ${records.length} authors from CSV`);

  // Build lookup maps: by name and by slug
  const byName = new Map();
  const bySlug = new Map();
  for (const row of records) {
    const name = (row["Name"] || "").trim();
    const slug = (row["Slug"] || "").trim();
    const photo = (row["Profile Photo"] || "").trim();
    if (name && photo) byName.set(name.toLowerCase(), photo);
    if (slug && photo) bySlug.set(slug, photo);
  }

  // Get all memos
  const memos = await prisma.memo.findMany();
  console.log(`Found ${memos.length} memos to update`);

  let updated = 0;
  let missed = 0;

  for (const memo of memos) {
    // Try matching by name (case insensitive)
    let photo = byName.get(memo.author.toLowerCase());

    // Try matching by converting author name to slug
    if (!photo) {
      const authorSlug = memo.author.toLowerCase().replace(/\s+/g, "-");
      photo = bySlug.get(authorSlug);
    }

    if (photo) {
      await prisma.memo.update({
        where: { slug: memo.slug },
        data: { authorImage: photo },
      });
      console.log(`  OK: ${memo.slug} — ${memo.author} → ${photo.slice(0, 80)}...`);
      updated++;
    } else {
      console.log(`  MISS: ${memo.slug} — "${memo.author}" not found in authors CSV`);
      missed++;
    }
  }

  console.log(`\nDone. Updated: ${updated}, Missed: ${missed}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
