import { randomUUID } from "node:crypto";
import { connectToDatabase } from "@/app/bills/lib/mongoose";
import { Bill } from "@/app/bills/models/Bill";
import { acquireLock, releaseLock } from "@/app/bills/models/JobLock";
import { getApiBills } from "@/app/bills/server/get-api-bills";
import {
  fetchBillMarkdown,
  getBillFromCivicsProjectApi,
  saveBillAnalysis,
  summarizeBillText,
  updateBillFacts,
  type ApiBillDetail,
} from "@/app/bills/services/billApi";
import { notifyNewBillAnalysis } from "@/app/bills/services/slack-notifier";
import { env } from "@/app/bills/env";
import {
  analysisReason,
  type StoredState,
} from "@/app/bills/services/refresh-decision";

export { analysisReason } from "@/app/bills/services/refresh-decision";

export const REFRESH_LOCK = "bills-refresh";

/** How long a sweep may hold the lease before another process may take over. */
const LOCK_TTL_MS = 30 * 60 * 1000;

/** OpenAI calls one sweep is allowed to make. */
const DEFAULT_ANALYSIS_BUDGET = 10;

export type RefreshResult = {
  scanned: number;
  factsWritten: number;
  analyzed: number;
  /** Bills that needed analysis but did not fit in this sweep's budget. */
  deferred: number;
  errors: number;
  skippedReason?: "locked" | "no-database" | "no-api-bills";
};

function hasValidMongoUri(): boolean {
  const uri = env.MONGO_URI || "";
  return uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://");
}

function sourceOf(bill: ApiBillDetail): string | undefined {
  return bill.source || (bill.billTexts?.[0] as { url?: string })?.url;
}

/**
 * Bring every bill in the current Parliament up to date.
 *
 * Two passes, deliberately unequal in cost:
 *
 *  1. Facts — status, stages, sponsor, genres — are refreshed for every stored
 *     bill on every sweep. No LLM, so this is cheap, and it is what keeps the
 *     detail page from showing a verdict next to a months-old status.
 *  2. Analysis is re-run only for bills that are new to us or whose text has
 *     actually changed, and only up to `analysisBudget` per sweep.
 *
 * This is the job that used to not exist: analysis ran inside whichever page
 * render first encountered an unseen bill, which meant a bill analyzed at first
 * reading kept that verdict through every amendment.
 */
export async function refreshBills(options?: {
  analysisBudget?: number;
  force?: boolean;
}): Promise<RefreshResult> {
  const analysisBudget = options?.analysisBudget ?? DEFAULT_ANALYSIS_BUDGET;
  const force = options?.force ?? false;
  const empty: RefreshResult = {
    scanned: 0,
    factsWritten: 0,
    analyzed: 0,
    deferred: 0,
    errors: 0,
  };

  if (!hasValidMongoUri()) {
    console.warn("[bills-refresh] No valid MONGO_URI — skipping sweep");
    return { ...empty, skippedReason: "no-database" };
  }

  await connectToDatabase();

  const holder = randomUUID();
  if (!(await acquireLock(REFRESH_LOCK, LOCK_TTL_MS, holder))) {
    console.log("[bills-refresh] Another sweep holds the lock — skipping");
    return { ...empty, skippedReason: "locked" };
  }

  const startedAt = Date.now();
  try {
    const apiBills = await getApiBills();
    if (apiBills.length === 0) {
      console.warn("[bills-refresh] API returned no bills — skipping sweep");
      return { ...empty, skippedReason: "no-api-bills" };
    }

    const stored = (await Bill.find({})
      .select("billId source billTextsCount summary analysisGeneratedAt")
      .lean()
      .exec()) as unknown as Array<{
      billId: string;
      source?: string;
      billTextsCount?: number;
      summary?: string;
      analysisGeneratedAt?: Date;
    }>;

    const storedById = new Map<string, StoredState>(
      stored.map((b) => [
        b.billId,
        {
          source: b.source,
          billTextsCount: b.billTextsCount,
          hasAnalysis: Boolean(b.summary?.trim()),
          analysedAt: b.analysisGeneratedAt,
        },
      ]),
    );

    const result: RefreshResult = { ...empty, scanned: apiBills.length };

    for (const listBill of apiBills) {
      // The list endpoint omits `billTexts` and `source`, so the per-bill
      // record is what the decision is actually made on.
      let detail: ApiBillDetail | null = null;
      try {
        detail = await getBillFromCivicsProjectApi(listBill.billID);
      } catch (error) {
        console.error(
          `[bills-refresh] Failed to fetch ${listBill.billID}:`,
          error,
        );
        result.errors += 1;
        continue;
      }
      if (!detail) continue;

      const source = sourceOf(detail);
      const billTextsCount = Array.isArray(detail.billTexts)
        ? detail.billTexts.length
        : 0;
      const state = storedById.get(detail.billID);

      const reason = analysisReason(state, source, billTextsCount, force);

      if (!reason) {
        // Known bill, unchanged text: refresh the facts and move on.
        if (await updateBillFacts(detail, source)) result.factsWritten += 1;
        continue;
      }

      if (result.analyzed >= analysisBudget) {
        // Out of budget. Still take the facts — the next sweep picks up the
        // analysis, and in the meantime the page shows a current status.
        if (state && (await updateBillFacts(detail, source))) {
          result.factsWritten += 1;
        }
        result.deferred += 1;
        continue;
      }

      if (!source) {
        console.warn(
          `[bills-refresh] ${detail.billID} has no bill text source — facts only`,
        );
        if (state && (await updateBillFacts(detail, source))) {
          result.factsWritten += 1;
        }
        continue;
      }

      try {
        const markdown = await fetchBillMarkdown(source);
        if (!markdown) {
          console.warn(
            `[bills-refresh] ${detail.billID}: could not read bill text at ${source}`,
          );
          result.errors += 1;
          continue;
        }

        console.log(`[bills-refresh] Analyzing ${detail.billID} (${reason})`);
        // The sweep is the deliberate, budgeted caller — the organic-traffic
        // cap exists to bound accidental loops, not this.
        const analysis = await summarizeBillText(markdown, { bypassCap: true });
        if (analysis.isFallback) {
          // Leave the stored analysis alone and try again next sweep.
          console.warn(
            `[bills-refresh] ${detail.billID}: degraded analysis, not persisted`,
          );
          result.errors += 1;
          continue;
        }

        await saveBillAnalysis({ bill: detail, analysis, source });
        result.analyzed += 1;

        // Announce genuinely new analyses only, not every re-read.
        if (reason === "new" || reason === "no-analysis") {
          await notifyNewBillAnalysis({
            billId: detail.billID,
            title: detail.title,
            shortTitle: detail.shortTitle,
            analysis,
          });
        }
      } catch (error) {
        console.error(`[bills-refresh] ${detail.billID} failed:`, error);
        result.errors += 1;
      }
    }

    console.log(
      `[bills-refresh] done in ${Math.round((Date.now() - startedAt) / 1000)}s —`,
      `scanned=${result.scanned} factsWritten=${result.factsWritten}`,
      `analyzed=${result.analyzed} deferred=${result.deferred} errors=${result.errors}`,
    );
    return result;
  } finally {
    await releaseLock(REFRESH_LOCK, holder);
  }
}
