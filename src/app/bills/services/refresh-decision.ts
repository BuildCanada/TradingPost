/**
 * When a bill is worth spending an OpenAI call on.
 *
 * Kept apart from the sweep itself so it carries no server-only imports and can
 * be tested directly — this decision is what stands between the refresh job and
 * an unbounded OpenAI bill, and it is the logic that was previously unreachable
 * (it lived inside a code path only entered for bills we had never stored, so
 * "source-changed" could never be true).
 */

/** What the sweep needs to know about a bill it already stores. */
export type StoredState = {
  source?: string;
  billTextsCount?: number;
  /**
   * Whether a verdict is stored at all, independent of when it was generated.
   * Rows written before `analysisGeneratedAt` existed have an analysis but no
   * timestamp; treating those as unanalyzed would re-pay for every bill in the
   * database on the first sweep.
   */
  hasAnalysis: boolean;
  analysedAt?: Date;
};

export type AnalysisReason =
  | "new"
  | "no-analysis"
  | "source-changed"
  | "count-changed"
  | "forced";

export function analysisReason(
  stored: StoredState | undefined,
  apiSource: string | undefined,
  apiBillTextsCount: number,
  force: boolean,
): AnalysisReason | null {
  if (!stored) return "new";
  if (!stored.hasAnalysis) return "no-analysis";
  if ((stored.source || null) !== (apiSource || null)) return "source-changed";
  if ((stored.billTextsCount ?? 0) !== apiBillTextsCount) return "count-changed";
  if (force) return "forced";
  return null;
}
