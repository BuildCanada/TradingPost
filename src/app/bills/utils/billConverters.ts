import type { BillDocument } from "@/app/bills/models/Bill";
import type { ApiBillDetail } from "@/app/bills/services/billApi";

// Unified bill data structure
export interface UnifiedBill {
  billId: string;
  title: string;
  short_title?: string;
  summary: string;
  status: string;
  sponsorParty?: string;
  chamber?: string;
  supportedRegion?: string;
  introducedOn?: Date;
  lastUpdatedOn?: Date;
  stages: {
    stage: string;
    state: string;
    house: string;
    date: Date;
  }[];
  genres?: string[];
  parliamentNumber?: number;
  sessionNumber?: number;
  votes?: Array<{ motion?: string; result: string }>;
  fullTextMarkdown?: string | null;
  isSocialIssue?: boolean;
  question_period_questions?: Array<{ question: string }>;
  // Analysis data from AI
  tenet_evaluations?: Array<{
    id: number;
    title: string;
    alignment: "aligns" | "conflicts" | "neutral";
    explanation: string;
  }>;
  final_judgment: "yes" | "no" | "abstain";
  rationale?: string;
  needs_more_info?: boolean;
  missing_details?: string[];
  steel_man?: string;
  /** When this verdict was computed, and from which bill text. */
  analysisGeneratedAt?: Date;
  analysisSourceRef?: string;
  /** True when no analysis exists yet — the refresh sweep has not reached it. */
  analysisPending?: boolean;
}

// Convert Build Canada DB bill to unified format
export function fromBuildCanadaDbBill(bill: BillDocument): UnifiedBill {
  return {
    billId: bill.billId,
    title: bill.title,
    short_title: bill.short_title,
    summary: bill.summary,
    status: bill.status,
    sponsorParty: bill.sponsorParty,
    chamber: bill.chamber,
    supportedRegion: bill.supportedRegion,
    introducedOn: bill.introducedOn,
    lastUpdatedOn: bill.lastUpdatedOn,
    stages: bill.stages
      ? bill.stages.map((stage) => ({
          stage: stage.stage,
          state: stage.state,
          house: stage.house,
          date: stage.date,
        }))
      : [],
    genres: bill.genres ? [...bill.genres] : undefined,
    parliamentNumber: bill.parliamentNumber,
    sessionNumber: bill.sessionNumber,
    votes: bill.votes?.map((v) => ({
      motion: v.motion,
      result: v.result,
    })),
    isSocialIssue: bill.isSocialIssue,
    // Properly serialize question_period_questions to remove MongoDB ObjectIds
    question_period_questions: bill.question_period_questions?.map((q) => ({
      question: q.question,
    })),
    // Include analysis data - ensure proper serialization
    tenet_evaluations: bill.tenet_evaluations?.map((te) => ({
      id: te.id,
      title: te.title,
      alignment: te.alignment,
      explanation: te.explanation,
    })),
    final_judgment:
      (bill.final_judgment ?? "").toString().trim().toLowerCase() === "yes" ||
      (bill.final_judgment ?? "").toString().trim().toLowerCase() === "no"
        ? (bill.final_judgment as "yes" | "no")
        : "abstain",
    rationale: bill.rationale,
    needs_more_info: bill.needs_more_info,
    missing_details: bill.missing_details
      ? [...bill.missing_details]
      : undefined,
    steel_man: bill.steel_man,
    analysisGeneratedAt: bill.analysisGeneratedAt,
    analysisSourceRef: bill.analysisSourceRef,
    analysisPending: !bill.analysisGeneratedAt && !bill.summary,
  };
}

// Convert Civics Project API bill to unified format
/**
 * Shape a Civics Project API bill into the unified structure.
 *
 * Pure: no LLM call, no database write, no Slack post. Analysis is owned by the
 * refresh sweep (`services/refresh.ts`), which runs on a schedule rather than
 * inside whichever visitor happened to open an un-analyzed bill first. That
 * visitor used to pay for two `gpt-5` calls at `reasoning.effort: "high"`
 * inside their page render — the cost the "July 14 incident" guard was holding
 * back by a single boolean.
 *
 * A bill the sweep has not reached yet comes back with `analysisPending: true`
 * and no verdict, which the page renders as "Analysis pending" over the bill's
 * real facts.
 */
export function fromCivicsProjectApiBill(bill: ApiBillDetail): UnifiedBill {
  const latestStageDate =
    bill.stages && bill.stages.length > 0
      ? bill.stages[bill.stages.length - 1].date
      : (bill.updatedAt ?? bill.date);
  const house =
    bill.stages && bill.stages.length > 0
      ? bill.stages[bill.stages.length - 1].house
      : undefined;

  return {
    billId: bill.billID,
    title: bill.title,
    short_title: bill.shortTitle,
    summary: bill.header || "",
    status: bill.status,
    stages: bill.stages
      ? bill.stages.map((stage) => ({
          stage: stage.stage,
          state: stage.state,
          house: stage.house,
          date: new Date(stage.date),
        }))
      : [],
    sponsorParty: bill.sponsorParty,
    chamber: house,
    supportedRegion: bill.supportedRegion,
    introducedOn: new Date(bill.date),
    lastUpdatedOn: new Date(latestStageDate),
    genres: bill.genres,
    parliamentNumber: bill.parliamentNumber,
    sessionNumber: bill.sessionNumber,
    fullTextMarkdown: null,
    final_judgment: "abstain",
    analysisPending: true,
  };
}
