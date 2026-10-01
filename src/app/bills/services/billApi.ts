import { xmlToMarkdown } from "@/app/bills/utils/xml-to-md/xml-to-md.util";
import {
  SUMMARY_AND_VOTE_PROMPT,
  TENETS,
} from "@/app/bills/prompt/summary-and-vote-prompt";
import {
  BILL_ANALYSIS_SCHEMA,
  type RawBillAnalysis,
} from "@/app/bills/prompt/analysis-schema";
import OpenAI from "openai";
import {
  BILL_API_REVALIDATE_INTERVAL,
  CANADIAN_PARLIAMENT_NUMBER,
} from "@/app/bills/consts/general";
import { env } from "@/app/bills/env";

export type ApiStage = {
  stage: string;
  state: string;
  house: string;
  date: string;
};

export type ApiBillDetail = {
  _id?: string;
  internalID?: string;
  billID: string;
  title: string;
  shortTitle?: string;
  header: string;
  summary?: string;
  genres?: string[];
  date: string;
  updatedAt?: string;
  status: string;
  stage?: string;
  stages?: ApiStage[];
  sponsorParty?: string;
  sponsorID?: string[];
  sponsorName?: string[];
  parliamentNumber: number;
  sessionNumber: number;
  supportedRegion?: string;
  interestLevel?: number;
  source?: string;
  votes?: unknown[];
  billTexts?: unknown[];
};

/**
 * Tenet titles are owned by TENETS and filled in here by id, rather than being
 * asked of the model. One source of truth instead of three, and the model
 * spends no tokens echoing text we already have.
 */
export function tenetTitle(id: number): string {
  return TENETS[id as keyof typeof TENETS] ?? `Tenet ${id}`;
}

function makeFallbackTenets(
  explanation: string,
): BillAnalysis["tenet_evaluations"] {
  return Object.keys(TENETS)
    .map(Number)
    .map((id) => ({
      id,
      title: tenetTitle(id),
      alignment: "neutral" as const,
      explanation,
    }));
}

/** Types for AI analysis results */
export interface BillAnalysis {
  summary: string;
  short_title?: string;
  tenet_evaluations: Array<{
    id: number;
    title: string;
    alignment: "aligns" | "conflicts" | "neutral";
    explanation: string;
  }>;
  final_judgment: "yes" | "no" | "abstain";
  rationale?: string;
  needs_more_info: boolean;
  missing_details: string[];
  steel_man: string;
  question_period_questions?: Array<{ question: string }>;
  /**
   * Whether the bill is primarily a social issue. Answered by the same call
   * that produces the judgment — a separate grader used to answer it again
   * from the first 8000 characters and disagree.
   */
  isSocialIssue: boolean;
  // Set when this is a degraded placeholder (no OpenAI key, parse failure,
  // API error, rate cap) rather than a real analysis. Callers must not
  // persist or Slack-notify a fallback. Never written to Mongo.
  isFallback?: true;
}

export async function getBillFromCivicsProjectApi(
  billId: string,
): Promise<ApiBillDetail | null> {
  const URL = `${env.CIVICS_PROJECT_BASE_URL}/canada/bills/${CANADIAN_PARLIAMENT_NUMBER}/${billId}`;
  const response = await fetch(URL, {
    // Cache individual bills.
    ...(process.env.NODE_ENV === "production"
      ? { next: { revalidate: BILL_API_REVALIDATE_INTERVAL } }
      : { cache: "no-store" }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.CIVICS_PROJECT_API_KEY ?? ""}`,
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "<unable to read body>");
    console.error("Failed to fetch bill details from Civics Project API", {
      billId,
      url: URL,
      status: response.status,
      statusText: response.statusText,
      body: body.slice(0, 1000),
    });
    throw new Error(
      `Failed to fetch bill details for "${billId}": ${response.status} ${response.statusText} (${URL})`,
    );
  }
  const json = await response.json();
  const data = (json?.data?.bill ?? json?.data ?? json) as
    | ApiBillDetail
    | ApiBillDetail[]
    | null;
  if (!data) return null;
  if (Array.isArray(data)) {
    return (
      data.find((b) => b.billID?.toLowerCase() === billId.toLowerCase()) ?? null
    );
  }
  return data;
}

// Soft cap on organic (non-admin) OpenAI calls per process. The primary guard
// lives in fromCivicsProjectApiBill; this backstop bounds the cost of any
// future regression that reopens a rerun loop (July 14 incident).
const SUMMARIZE_CAP_PER_HOUR = 25;
let summarizeWindowStart = 0;
let summarizeCallsInWindow = 0;

function summarizeCapExceeded(): boolean {
  const now = Date.now();
  if (now - summarizeWindowStart > 60 * 60 * 1000) {
    summarizeWindowStart = now;
    summarizeCallsInWindow = 0;
  }
  summarizeCallsInWindow += 1;
  return summarizeCallsInWindow > SUMMARIZE_CAP_PER_HOUR;
}

export async function summarizeBillText(
  input: string,
  options?: { bypassCap?: boolean },
): Promise<BillAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    console.log("No OPENAI API key, using fallback analysis");
    return degradedAnalysis(input, "Unable to analyze without AI", [
      "AI analysis capabilities required",
    ]);
  }

  if (!options?.bypassCap && summarizeCapExceeded()) {
    console.error(
      `[LLM_SUMMARIZE_CAP] exceeded ${SUMMARIZE_CAP_PER_HOUR} calls/hour — refusing OpenAI call`,
    );
    return degradedAnalysis(input, "Analysis rate cap exceeded", [
      "Analysis rate cap exceeded",
    ]);
  }

  try {
    console.warn("[LLM_SUMMARIZE] starting", { inputChars: input.length });
    const OpenAIClient = new OpenAI();

    const prompt = `${SUMMARY_AND_VOTE_PROMPT}\n\nBill Text:\n${input}`;
    const response = await OpenAIClient.responses.create({
      model: "gpt-5",
      input: prompt,
      reasoning: {
        effort: "high",
      },
      // Structured Outputs: the shape below is guaranteed, so there is no
      // markdown fence to strip, no enum to re-case, and no parse fallback.
      text: {
        format: {
          type: "json_schema",
          name: "bill_analysis",
          strict: true,
          schema: BILL_ANALYSIS_SCHEMA as unknown as Record<string, unknown>,
        },
      },
    });

    // A refusal or an incomplete response leaves output_text empty; treat that
    // as a degraded result rather than parsing "" and throwing.
    const responseText = response.output_text;
    if (!responseText) {
      console.error("[LLM_SUMMARIZE] empty response", {
        status: response.status,
        incomplete: response.incomplete_details,
      });
      return degradedAnalysis(input, "Model returned no analysis", [
        "A complete model response",
      ]);
    }

    const parsed = JSON.parse(responseText) as RawBillAnalysis;
    return fromRawAnalysis(parsed);
  } catch (error) {
    console.error("Error analyzing bill:", error);
    return degradedAnalysis(input, "Analysis failed", [
      "Technical issue resolution",
    ]);
  }
}

/**
 * Fill in tenet titles from TENETS and apply the one rule the prompt states but
 * cannot enforce on itself: a bill that is primarily a social issue abstains.
 * Builder MP takes no position on social questions, so a "yes"/"no" alongside
 * is_social_issue would contradict the product. `migrations/1.ts` existed to
 * repair exactly this drift after the fact.
 */
export function fromRawAnalysis(raw: RawBillAnalysis): BillAnalysis {
  const judgment = raw.is_social_issue ? "abstain" : raw.final_judgment;
  if (raw.is_social_issue && raw.final_judgment !== "abstain") {
    console.warn(
      `[LLM_SUMMARIZE] social issue judged "${raw.final_judgment}" — forcing abstain`,
    );
  }

  return {
    summary: raw.summary,
    short_title: raw.short_title || undefined,
    tenet_evaluations: raw.tenet_evaluations.map((t) => ({
      id: t.id,
      title: tenetTitle(t.id),
      alignment: t.alignment,
      explanation: t.explanation,
    })),
    final_judgment: judgment,
    rationale: raw.rationale || undefined,
    needs_more_info: raw.needs_more_info,
    missing_details: raw.missing_details ?? [],
    steel_man: raw.steel_man,
    question_period_questions: raw.question_period_questions ?? [],
    isSocialIssue: raw.is_social_issue,
  };
}

/**
 * A placeholder for every path where no real analysis was produced. Always
 * `isFallback: true`, which is what stops callers persisting it over good data
 * or announcing it in Slack.
 */
function degradedAnalysis(
  input: string,
  reason: string,
  missingDetails: string[],
): BillAnalysis {
  const text = input?.trim() || "";
  return {
    summary:
      (text.length <= 500 ? text : `${text.slice(0, 500)}…`) ||
      "No bill text available for analysis.",
    short_title: undefined,
    tenet_evaluations: makeFallbackTenets(reason),
    final_judgment: "abstain",
    rationale: undefined,
    needs_more_info: true,
    missing_details: missingDetails,
    steel_man: reason,
    question_period_questions: [],
    isSocialIssue: false,
    isFallback: true,
  };
}

export async function fetchBillMarkdown(
  sourceUrl: string,
): Promise<string | null> {
  try {
    const xmlResponse = await fetch(sourceUrl, {
      // Cache bill text for 1 hour in production since it rarely changes
      ...(process.env.NODE_ENV === "production"
        ? { next: { revalidate: 3600 } }
        : { cache: "no-store" }),
    });
    if (xmlResponse.ok) {
      const xml = await xmlResponse.text();
      return xmlToMarkdown(xml);
    }
  } catch (error) {
    console.error("Error fetching bill markdown:", error);
  }
  return null;
}

/** Mongo is reachable and configured. */
async function connectIfConfigured(): Promise<boolean> {
  const uri = env.MONGO_URI || "";
  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    console.warn("[bills] No valid MongoDB URI, skipping write");
    return false;
  }
  // Imported here to avoid a circular dependency through the models.
  const { connectToDatabase } = await import("@/app/bills/lib/mongoose");
  await connectToDatabase();
  return true;
}

/** The fields that come from the Civics Project API rather than the model. */
function factsFromApiBill(bill: ApiBillDetail, source?: string) {
  const latestStageDate =
    bill.stages && bill.stages.length > 0
      ? bill.stages[bill.stages.length - 1].date
      : (bill.updatedAt ?? bill.date);

  return {
    title: bill.title,
    status: bill.status,
    sponsorParty: bill.sponsorParty,
    genres: bill.genres,
    supportedRegion: bill.supportedRegion,
    stages: bill.stages?.map((stage) => ({
      stage: stage.stage,
      state: stage.state,
      house: stage.house,
      date: new Date(stage.date),
    })),
    billTextsCount: Array.isArray(bill.billTexts) ? bill.billTexts.length : 0,
    source: source ?? bill.source,
    lastUpdatedOn: new Date(latestStageDate),
  };
}

/**
 * Bring a stored bill's factual fields up to date with the API — status,
 * stages, sponsor, genres, source. No LLM call, so this is cheap enough to run
 * over every bill on every sweep.
 *
 * Never upserts: a row with no analysis would read as "found" to the detail
 * page. New bills are created by `saveBillAnalysis` once they have one.
 *
 * Returns true when a document was written. The schema sets `timestamps: true`,
 * so `updatedAt` changes on every call and this is "written", not "changed".
 */
export async function updateBillFacts(
  bill: ApiBillDetail,
  source?: string,
): Promise<boolean> {
  if (!(await connectIfConfigured())) return false;
  const { Bill } = await import("@/app/bills/models/Bill");

  try {
    const result = await Bill.updateOne(
      { billId: bill.billID },
      { $set: factsFromApiBill(bill, source) },
      { upsert: false },
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error(`[bills] Failed to update facts for ${bill.billID}:`, error);
    return false;
  }
}

/**
 * Write a freshly generated analysis, creating the bill if it is new.
 *
 * The decision of *whether* to spend an OpenAI call lives in the caller (the
 * refresh sweep, or an admin pressing reprocess); by the time we are here the
 * analysis has been paid for, so it is always written. An earlier version
 * re-derived that decision here and silently dropped writes whose source had
 * not changed.
 */
export async function saveBillAnalysis(params: {
  bill: ApiBillDetail;
  analysis: BillAnalysis;
  source?: string;
}): Promise<void> {
  const { bill, analysis, source } = params;

  if (analysis.isFallback) {
    // A degraded placeholder must never overwrite real stored data, nor create
    // a row that then looks analyzed.
    console.warn(
      `[bills] Refusing to persist fallback analysis for ${bill.billID}`,
    );
    return;
  }

  if (!(await connectIfConfigured())) return;
  const { Bill } = await import("@/app/bills/models/Bill");

  try {
    const facts = factsFromApiBill(bill, source);
    await Bill.updateOne(
      { billId: bill.billID },
      {
        $set: {
          ...facts,
          short_title: bill.shortTitle || analysis.short_title,
          summary: analysis.summary,
          tenet_evaluations: analysis.tenet_evaluations,
          final_judgment: analysis.final_judgment,
          rationale: analysis.rationale,
          needs_more_info: analysis.needs_more_info,
          missing_details: analysis.missing_details,
          steel_man: analysis.steel_man,
          isSocialIssue: analysis.isSocialIssue,
          question_period_questions: analysis.question_period_questions ?? [],
          // Provenance: which text this verdict was computed from, and when.
          // Surfaced to readers on the bill page.
          analysisGeneratedAt: new Date(),
          analysisSourceRef: facts.source,
        },
        $setOnInsert: {
          billId: bill.billID,
          parliamentNumber: bill.parliamentNumber,
          sessionNumber: bill.sessionNumber,
          chamber: bill.billID.startsWith("S") ? "Senate" : "House of Commons",
          introducedOn: new Date(bill.date),
          votes: [],
        },
      },
      { upsert: true },
    );
    console.log(`[bills] Saved analysis for ${bill.billID}`);
  } catch (error) {
    // Never throw — a failed write must not break the caller's sweep.
    console.error(`[bills] Error saving ${bill.billID} to database:`, error);
  }
}
