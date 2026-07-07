import type { BillAnalysis } from "@/app/bills/services/billApi";
import { TENETS } from "@/app/bills/prompt/summary-and-vote-prompt";

export type CheckResult = {
  name: string;
  /** true = pass. `severity: "warn"` results never fail the run. */
  pass: boolean;
  severity: "error" | "warn";
  message: string;
};

const ALIGNMENTS = new Set(["aligns", "conflicts", "neutral"]);
const JUDGMENTS = new Set(["yes", "no", "abstain"]);
const SPEAKER_PREFIX = /\b(mr\.?|madam)\s+speaker\b/i;
// Self-reference the prompt explicitly forbids ("use 'Builders' instead").
const SELF_REF = /\bbuild canada\b|\bwe\b|\bwe're\b|\bwe've\b|\bour\b|\bours\b/i;

function ok(name: string, message = "ok"): CheckResult {
  return { name, pass: true, severity: "error", message };
}
function fail(name: string, message: string): CheckResult {
  return { name, pass: false, severity: "error", message };
}
function warn(name: string, pass: boolean, message: string): CheckResult {
  return { name, pass, severity: "warn", message };
}

/**
 * Deterministic assertions derived from SUMMARY_AND_VOTE_PROMPT. No LLM calls —
 * these grade the structure of a (possibly cached) BillAnalysis object.
 */
export function checkAnalysis(a: BillAnalysis): CheckResult[] {
  const results: CheckResult[] = [];

  // summary non-empty. NOTE: steel_man is intentionally NOT checked here — it
  // is a human-editable editorial field (admin edit page), not produced by
  // SUMMARY_AND_VOTE_PROMPT, so summarizeBillText correctly leaves it "".
  results.push(
    typeof a.summary === "string" && a.summary.trim().length > 0
      ? ok("summary-present")
      : fail("summary-present", "summary is empty or not a string"),
  );

  // tenet evaluations: exactly 8, ids 1-8, valid alignments
  const tenets = Array.isArray(a.tenet_evaluations) ? a.tenet_evaluations : [];
  if (tenets.length !== 8) {
    results.push(
      fail("tenets-count", `expected 8 tenet_evaluations, got ${tenets.length}`),
    );
  } else {
    const ids = new Set(tenets.map((t) => t.id));
    const missing = [1, 2, 3, 4, 5, 6, 7, 8].filter((id) => !ids.has(id));
    results.push(
      missing.length === 0
        ? ok("tenets-ids")
        : fail("tenets-ids", `missing tenet ids: ${missing.join(", ")}`),
    );
    const badAlign = tenets.filter((t) => !ALIGNMENTS.has(t.alignment));
    results.push(
      badAlign.length === 0
        ? ok("tenets-alignment")
        : fail(
            "tenets-alignment",
            `invalid alignment values: ${badAlign
              .map((t) => `#${t.id}=${JSON.stringify(t.alignment)}`)
              .join(", ")}`,
          ),
    );
    results.push(
      tenets.every((t) => typeof t.explanation === "string" && t.explanation.trim())
        ? ok("tenets-explanations")
        : fail("tenets-explanations", "one or more tenet explanations are empty"),
    );
  }

  // final judgment enum
  results.push(
    JUDGMENTS.has(a.final_judgment)
      ? ok("final-judgment-enum")
      : fail(
          "final-judgment-enum",
          `final_judgment=${JSON.stringify(a.final_judgment)} not in yes|no|abstain`,
        ),
  );

  // question period questions: exactly 3, non-empty, no speaker prefix
  const qs = Array.isArray(a.question_period_questions)
    ? a.question_period_questions
    : [];
  results.push(
    qs.length === 3
      ? ok("qp-count")
      : fail("qp-count", `expected 3 question_period_questions, got ${qs.length}`),
  );
  const emptyQ = qs.filter((q) => !q?.question || !q.question.trim());
  results.push(
    emptyQ.length === 0
      ? ok("qp-nonempty")
      : fail("qp-nonempty", `${emptyQ.length} question(s) are empty`),
  );
  const speakerQ = qs.filter((q) => SPEAKER_PREFIX.test(q?.question || ""));
  results.push(
    speakerQ.length === 0
      ? ok("qp-no-speaker-prefix")
      : fail(
          "qp-no-speaker-prefix",
          `${speakerQ.length} question(s) contain a 'Mr./Madam Speaker' reference`,
        ),
  );

  // no self-reference across summary / questions / rationale
  const proseFields: Array<[string, string]> = [
    ["summary", a.summary || ""],
    ["rationale", a.rationale || ""],
    ...qs.map((q, i) => [`question[${i}]`, q?.question || ""] as [string, string]),
  ];
  const selfRefHits = proseFields.filter(([, v]) => SELF_REF.test(v));
  results.push(
    selfRefHits.length === 0
      ? ok("no-self-reference")
      : fail(
          "no-self-reference",
          `forbidden self-reference (Build Canada / we / our) in: ${selfRefHits
            .map(([f]) => f)
            .join(", ")}`,
        ),
  );

  // soft: tenet titles should not be quoted verbatim in the summary
  const summaryLower = (a.summary || "").toLowerCase();
  const leakedTenets = Object.values(TENETS).filter((title) => {
    // compare on a trimmed core to avoid trailing-punctuation misses
    const core = title.replace(/[.().,]/g, "").toLowerCase().trim();
    return core.length > 12 && summaryLower.includes(core);
  });
  results.push(
    warn(
      "summary-no-tenet-verbatim",
      leakedTenets.length === 0,
      leakedTenets.length === 0
        ? "ok"
        : `summary appears to quote tenet text verbatim (${leakedTenets.length} match)`,
    ),
  );

  return results;
}
