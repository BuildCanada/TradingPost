import { TENETS } from "@/app/bills/prompt/summary-and-vote-prompt";

/**
 * The exact shape `summarizeBillText` expects back from the model.
 *
 * This is sent as an OpenAI Structured Output (`strict: true`), which makes the
 * shape a guarantee rather than a request: the enums cannot come back
 * mis-cased, `tenet_evaluations` cannot come back short, and the response
 * cannot come back fenced in markdown. That replaces the hand-written "Output
 * format" block the prompt used to carry — which showed the model invalid JSON
 * (unescaped nested quotes, a trailing comma) and cost a `JSON.parse` failure
 * and a permanent `abstain` whenever the model imitated it too closely.
 *
 * `strict: true` requires every property to appear in `required` and every
 * object to set `additionalProperties: false`. Optionality is expressed by
 * allowing `null`, not by omitting from `required`.
 *
 * Strict mode also rejects a number of JSON Schema keywords outright, array
 * length among them (`minItems` / `maxItems`). A schema carrying one is a 400
 * on every request, which `summarizeBillText` would turn into a fallback
 * `abstain` for every bill — so array counts are stated in `description` and
 * asserted afterwards by the eval checks, never in the schema.
 */

const TENET_IDS = Object.keys(TENETS).map(Number);

export const BILL_ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "summary",
    "short_title",
    "tenet_evaluations",
    "final_judgment",
    "rationale",
    "steel_man",
    "needs_more_info",
    "missing_details",
    "question_period_questions",
    "is_social_issue",
  ],
  properties: {
    summary: {
      type: "string",
      description:
        "3-5 sentences in plain language followed by markdown bullet points covering the highlights. No other text.",
    },
    short_title: {
      type: "string",
      description: "A 1-2 word title for the bill.",
    },
    tenet_evaluations: {
      type: "array",
      description: `Exactly ${TENET_IDS.length} entries, one per tenet, in ascending id order (${TENET_IDS.join(", ")}). Do not repeat or omit an id.`,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "alignment", "explanation"],
        properties: {
          id: { type: "integer", enum: TENET_IDS },
          alignment: { type: "string", enum: ["aligns", "conflicts", "neutral"] },
          explanation: {
            type: "string",
            description:
              "A short explanation of how this bill relates to this tenet. Do not quote the tenet back.",
          },
        },
      },
    },
    final_judgment: {
      type: "string",
      enum: ["yes", "no", "abstain"],
    },
    rationale: {
      type: "string",
      description:
        "2 sentences explaining the overall judgment, then markdown bullet points giving the reasoning and what might be changed.",
    },
    steel_man: {
      type: "string",
      description:
        "The strongest good-faith case for the side the judgment did NOT take, in 2-4 sentences. If the judgment is 'yes', argue why a builder might still oppose it; if 'no', argue why a builder might still support it; if 'abstain', give the strongest case that this bill does carry economic weight. Address the bill's actual provisions, not generalities. Never concede the judgment.",
    },
    needs_more_info: {
      type: "boolean",
      description:
        "True when the bill text is too thin or too technical to judge confidently.",
    },
    missing_details: {
      type: "array",
      items: { type: "string" },
      description:
        "What would be needed to judge confidently. Empty when needs_more_info is false.",
    },
    question_period_questions: {
      type: "array",
      description: "Exactly 3 questions.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question"],
        properties: {
          question: {
            type: "string",
            description:
              "A critical question about this bill only, phrased as a Member of Parliament would actually ask it in Question Period. Omit any 'Mr. Speaker' / 'Madam Speaker' prefix.",
          },
        },
      },
    },
    is_social_issue: {
      type: "boolean",
      description:
        "True when the bill is primarily a social issue per the criteria above.",
    },
  },
} as const;

/** The model's reply, before tenet titles are filled in from TENETS. */
export type RawBillAnalysis = {
  summary: string;
  short_title: string;
  tenet_evaluations: Array<{
    id: number;
    alignment: "aligns" | "conflicts" | "neutral";
    explanation: string;
  }>;
  final_judgment: "yes" | "no" | "abstain";
  rationale: string;
  steel_man: string;
  needs_more_info: boolean;
  missing_details: string[];
  question_period_questions: Array<{ question: string }>;
  is_social_issue: boolean;
};
