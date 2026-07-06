/**
 * Bootstrap a fixture from a real Canadian bill.
 *
 *   pnpm tsx src/app/bills/evals/fixtures/fetch-fixture.ts <billId> [outId]
 *
 * Fetches the bill via the existing Civics Project fetchers, renders its text
 * to markdown with the same deterministic util the app uses, and writes it to
 * `<outId>.md` in this directory. Then hand-label it by adding a record to
 * bills.ts. Requires CIVICS_PROJECT_API_KEY. This is a one-off authoring
 * convenience — it is NOT part of the eval run (the committed .md files are).
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getBillFromCivicsProjectApi,
  fetchBillMarkdown,
} from "@/app/bills/services/billApi";

async function main() {
  const billId = process.argv[2];
  const outId = process.argv[3] || billId?.toLowerCase();
  if (!billId) {
    console.error(
      "Usage: pnpm tsx src/app/bills/evals/fixtures/fetch-fixture.ts <billId> [outId]",
    );
    process.exit(1);
  }
  if (!process.env.CIVICS_PROJECT_API_KEY) {
    console.error("CIVICS_PROJECT_API_KEY is required to fetch a real bill.");
    process.exit(1);
  }

  const bill = await getBillFromCivicsProjectApi(billId);
  if (!bill) {
    console.error(`No bill found for id "${billId}".`);
    process.exit(1);
  }

  const source =
    bill.source || (bill.billTexts?.[0] as { url?: string } | undefined)?.url;
  if (!source) {
    console.error(`Bill "${billId}" has no text source URL to render.`);
    process.exit(1);
  }

  const markdown = await fetchBillMarkdown(source);
  if (!markdown) {
    console.error(`Failed to fetch/convert bill text from ${source}.`);
    process.exit(1);
  }

  const outPath = join(dirname(fileURLToPath(import.meta.url)), `${outId}.md`);
  writeFileSync(outPath, markdown);
  console.log(`Wrote ${outPath} (${markdown.length} chars).`);
  console.log(
    `Now add a labeled record for "${outId}" to fixtures/bills.ts (title: ${bill.title}).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
