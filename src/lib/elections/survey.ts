// Survey definitions, fetched from York Factory.
//
// These questions used to live in this repo as a hand-written surveyData.ts.
// They moved into York Factory because candidates answer surveys too, and a
// candidate questionnaire is entered in that app's CMS — a question set that
// only exists in the front end can't be rendered as an admin form. So the
// database is now the source of truth and this file only describes what comes
// back over the wire.
//
// The renderer (SurveyClient) is still generic: it derives step count,
// progress, validation and the submitted payload from whatever steps arrive.
// Adding a question or rewording one is a CMS edit with no deploy here.

import { apiFetch } from "@/lib/api/client";

export type SurveyOption = {
  /** stored value — stable; the label can be reworded freely */
  value: string;
  label: string;
  /** optional expansion shown under the label */
  detail?: string;
};

export type SurveyQuestionType =
  | "text"
  | "email"
  | "textarea"
  | "select"
  | "radio"
  | "yesno";

export type SurveyQuestion = {
  /** payload key — answers are stored under this, so it is stable once live */
  id: string;
  type: SurveyQuestionType;
  label: string;
  /** Shown under the label, for context or a caveat. */
  help?: string;
  topic?: string;
  placeholder?: string;
  /** Required questions block advancing past their step. */
  required?: boolean;
  rows?: number;
  /**
   * Choices for select and radio. Also populated for yesno, where the API
   * supplies the implied Yes/No pair — so the renderer never has to carry its
   * own copy of the labels that results are grouped by.
   *
   * Absent for free-text questions.
   */
  options?: SurveyOption[];
};

export type SurveyStep = {
  id: string;
  title: string;
  intro?: string;
  questions: SurveyQuestion[];
};

/** Page furniture — headings and the thank-you copy. Authored in the CMS. */
export type SurveyMeta = {
  eyebrow?: string;
  kicker?: string;
  title?: string;
  intro?: string;
  submitLabel?: string;
  thankYou?: {
    title?: string;
    body?: string;
    restartLabel?: string;
  };
};

export type Survey = {
  slug: string;
  audience: "resident" | "candidate";
  /** Stamped on every response so answers stay interpretable after an edit. */
  version: string;
  meta: SurveyMeta;
  steps: SurveyStep[];
};

/** The resident survey for the Toronto 2026 election. */
export const CITY_PRIORITIES_SLUG = "city-priorities";

/**
 * One survey with its questions, ready to render.
 *
 * Cached for five minutes rather than fetched per request: the question set
 * changes about as often as someone edits it in the CMS, and the ISR cache
 * doubles as the failure story — a blip at York Factory keeps serving the last
 * good copy instead of taking the survey down. Throws when there is no cached
 * copy to fall back on, which the page turns into a notFound().
 */
export async function fetchSurvey(
  electionSlug: string,
  surveySlug: string,
): Promise<Survey> {
  const { data } = await apiFetch<{ data: Survey }>(
    `/elections/${electionSlug}/surveys/${surveySlug}`,
    { revalidate: 300, tags: [`survey:${electionSlug}:${surveySlug}`] },
  );
  return data;
}

/** Every question across every step, in the order a respondent meets them. */
export function surveyQuestions(survey: Survey): SurveyQuestion[] {
  return survey.steps.flatMap((step) => step.questions);
}
