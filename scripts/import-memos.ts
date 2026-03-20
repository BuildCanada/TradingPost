import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

function parseDate(val: string): Date | null {
  if (!val || val.trim() === "") return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

async function main() {
  // --- Parse authors CSV ---
  const authorsRaw = fs.readFileSync(
    path.join(process.cwd(), "authors.csv"),
    "utf-8"
  );
  const authorRows: Record<string, string>[] = parse(authorsRaw, {
    columns: true,
    skip_empty_lines: true,
  });

  // Build map: slug → { name, photo }
  const authorMap = new Map<string, { name: string; photo: string }>();
  for (const row of authorRows) {
    const slug = (row["Slug"] || "").trim();
    const name = (row["Name"] || "").trim();
    const photo = (row["Profile Photo"] || "").trim();
    if (slug) authorMap.set(slug, { name, photo });
  }
  console.log(`Loaded ${authorMap.size} authors.`);

  // --- Parse memos CSV ---
  const memosRaw = fs.readFileSync(
    path.join(process.cwd(), "Memoscsv.csv"),
    "utf-8"
  );
  const memoRows: Record<string, string>[] = parse(memosRaw, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  });
  console.log(`Found ${memoRows.length} memo rows.`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of memoRows) {
    const archived = (row["Archived"] || "").toLowerCase() === "true";
    if (archived) {
      skipped++;
      continue;
    }

    const slug = (row["Slug"] || "").trim();
    const title = (row["Memo Title"] || "").trim();
    if (!slug || !title) {
      skipped++;
      continue;
    }

    // Resolve author from Builder slug
    const builderSlug = (row["Builder"] || "").trim();
    const builder2Slug = (row["Builder 2"] || "").trim();
    const authorInfo = builderSlug ? authorMap.get(builderSlug) : undefined;
    const author2Info = builder2Slug ? authorMap.get(builder2Slug) : undefined;

    let authorName = authorInfo?.name || builderSlug || "Build Canada";
    if (author2Info) authorName = `${authorName} & ${author2Info.name}`;
    const authorImage = authorInfo?.photo || null;

    const keyMessage1 = (row["Key Message 1"] || "").trim();
    const keyMessage2 = (row["Key Message 2"] || "").trim() || null;
    const keyMessage3 = (row["Key Message 3"] || "").trim() || null;

    const body = (row["Body"] || "").trim();
    const appendix = (row["Appendix"] || "").trim();
    const fullBody = appendix ? `${body}\n\n${appendix}` : body;

    if (!keyMessage1 || !fullBody) {
      console.warn(`  Skipping "${title}" — missing keyMessage1 or body.`);
      skipped++;
      continue;
    }

    const supporters = (row["Supporters"] || "").trim() || null;
    const category = (row["Category"] || "").trim() || null;
    const seoImage = (row["SEO Image"] || "").trim() || null;
    const twitterEmbed = (row["Twitter Embed"] || "").trim() || null;

    const publishedAt = parseDate(row["Published On"]);
    const createdAt = parseDate(row["Created On"]) ?? new Date();
    const updatedAt = parseDate(row["Updated On"]) ?? new Date();

    try {
      await prisma.memo.upsert({
        where: { slug },
        update: {
          title,
          author: authorName,
          authorImage,
          keyMessage1,
          keyMessage2,
          keyMessage3,
          body: fullBody,
          supporters,
          category,
          seoImage,
          twitterEmbed,
          publishedAt,
          updatedAt,
        },
        create: {
          title,
          slug,
          author: authorName,
          authorImage,
          keyMessage1,
          keyMessage2,
          keyMessage3,
          body: fullBody,
          supporters,
          category,
          seoImage,
          twitterEmbed,
          publishedAt,
          createdAt,
          updatedAt,
        },
      });
      imported++;
      console.log(`  ✓ "${title}" (${builderSlug || "no builder"} → ${authorName})`);
    } catch (err) {
      console.error(`  ✗ Failed "${title}": ${err}`);
      errors++;
    }
  }

  console.log(`\nDone. Imported: ${imported}, Skipped: ${skipped}, Errors: ${errors}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
