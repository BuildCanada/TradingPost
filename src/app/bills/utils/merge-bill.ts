import type { BillSummary } from "@/app/bills/types";
import type { UnifiedBill } from "@/app/bills/utils/billConverters";

/**
 * One precedence rule, applied everywhere a bill is rendered.
 *
 *   Facts  (status, stages, sponsor, title, genres) — the Civics Project API wins.
 *   Verdict (summary, tenets, judgment, rationale, steel man) — the database wins.
 *
 * The list page used to apply this and the detail page did not, so a bill could
 * read "Royal Assent" in the list and "Introduced" on its own page: the stored
 * document's `status` and `stages` are frozen at whatever they were when the
 * analysis was written. Both pages now go through here.
 */

function toIsoString(value?: Date | string): string | undefined {
  if (!value) return undefined;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

/** The stored verdict fields, laid over an API bill. */
export function mergeBillSummary(
  apiBill: BillSummary,
  dbBill: UnifiedBill | undefined,
): BillSummary {
  if (!dbBill) return apiBill;

  return {
    ...dbBill,
    ...apiBill,
    shortTitle: dbBill.short_title || apiBill.shortTitle,
    summary: dbBill.summary,
    isSocialIssue: dbBill.isSocialIssue,
    final_judgment: dbBill.final_judgment as BillSummary["final_judgment"],
    rationale: dbBill.rationale,
    needs_more_info: dbBill.needs_more_info,
    missing_details: dbBill.missing_details,
    genres: dbBill.genres,
    parliamentNumber: dbBill.parliamentNumber,
    sessionNumber: dbBill.sessionNumber,
  };
}

/** A bill the API no longer lists (or has not listed yet), shown from storage alone. */
export function dbBillToSummary(dbBill: UnifiedBill): BillSummary {
  return {
    billID: dbBill.billId,
    title: dbBill.title,
    shortTitle: dbBill.short_title,
    stages: dbBill.stages || [],
    description: dbBill.summary || "",
    status: (dbBill.status as BillSummary["status"]) || "Introduced",
    sponsorParty: dbBill.sponsorParty || "Unknown",
    sponsorName: "Unknown",
    chamber:
      (dbBill.chamber as "House of Commons" | "Senate") || "House of Commons",
    introducedOn: toIsoString(dbBill.introducedOn) || new Date().toISOString(),
    lastUpdatedOn: toIsoString(dbBill.lastUpdatedOn) || new Date().toISOString(),
    summary: dbBill.summary,
    isSocialIssue: dbBill.isSocialIssue,
    final_judgment: dbBill.final_judgment as BillSummary["final_judgment"],
    rationale: dbBill.rationale,
    needs_more_info: dbBill.needs_more_info,
    missing_details: dbBill.missing_details,
    genres: dbBill.genres,
    parliamentNumber: dbBill.parliamentNumber,
    sessionNumber: dbBill.sessionNumber,
  };
}

/**
 * Merge the full API list into the stored bills. API order is preserved;
 * bills only present in the database are appended.
 */
export function mergeBillLists(
  apiBills: BillSummary[],
  dbBills: UnifiedBill[],
): BillSummary[] {
  const dbBillsMap = new Map(dbBills.map((bill) => [bill.billId, bill]));

  const merged = apiBills.map((apiBill) =>
    mergeBillSummary(apiBill, dbBillsMap.get(apiBill.billID)),
  );

  const seen = new Set(merged.map((bill) => bill.billID));
  for (const [billId, dbBill] of dbBillsMap) {
    if (!seen.has(billId)) merged.push(dbBillToSummary(dbBill));
  }

  return merged;
}

/**
 * The detail-page counterpart: the stored verdict, with the API's current facts
 * laid over it. `apiBill` is the same unified shape the API converter produces,
 * so only its factual half is read.
 */
export function applyApiFacts(
  stored: UnifiedBill,
  apiBill: UnifiedBill | null,
): UnifiedBill {
  if (!apiBill) return stored;

  return {
    ...stored,
    title: apiBill.title || stored.title,
    short_title: stored.short_title || apiBill.short_title,
    status: apiBill.status || stored.status,
    stages: apiBill.stages?.length ? apiBill.stages : stored.stages,
    sponsorParty: apiBill.sponsorParty ?? stored.sponsorParty,
    chamber: apiBill.chamber ?? stored.chamber,
    supportedRegion: apiBill.supportedRegion ?? stored.supportedRegion,
    genres: apiBill.genres?.length ? apiBill.genres : stored.genres,
    introducedOn: apiBill.introducedOn ?? stored.introducedOn,
    lastUpdatedOn: apiBill.lastUpdatedOn ?? stored.lastUpdatedOn,
    parliamentNumber: apiBill.parliamentNumber ?? stored.parliamentNumber,
    sessionNumber: apiBill.sessionNumber ?? stored.sessionNumber,
  };
}
