import posthog from "posthog-js";

import { DEFAULT_ELECTION_SLUG } from "@/lib/elections/registry";
import type { Survey } from "@/lib/elections/survey";
import { hubspotPageContext } from "@/lib/hubspot-context";

import type { SurveyAnswers } from "./SurveyClient";

/**
 * What the API tells us back about a recorded response.
 *
 * `derivedRegion` is the ward York Factory resolved from the postal code
 * ("ward-9"), and on this survey it is the only ward there is — the question
 * set asks for a postal code and nothing else about where someone lives. It is
 * a best guess: a postal code's stored point is the centroid of its delivery
 * area, so a code on a ward line can resolve to the neighbour. Null whenever
 * the lookup missed, which is not an error — the response is still recorded.
 */
export type SurveySubmission = {
  surveySlug: string;
  /** self-reported ward, for a survey that collects one; null here */
  region: string | null;
  /** ward derived from the postal code, e.g. "ward-9" */
  derivedRegion: string | null;
  submittedAt: string | null;
};

/**
 * Sends a completed survey to /api/elections/survey, which forwards it to York
 * Factory (subscriber upsert + one response per subscriber per survey).
 *
 * The slug and version come from the survey that was rendered, not from
 * constants here — they identify the question set these answers were actually
 * given to. Sending a version the page never rendered is how answers end up
 * filed under the wrong questions, which is exactly what stamping a version is
 * meant to prevent.
 *
 * Throws on failure. The caller keeps the user's answers on screen and shows a
 * retry, so a thrown error is a recoverable state rather than lost work — which
 * is why nothing here swallows it.
 *
 * Returns what was recorded, because the ward in the reply is the one the
 * results view compares against. Deriving it a second time on the client would
 * be a second answer to the same question, free to disagree with the one
 * actually stored on the response.
 */
export async function submitSurvey(
  survey: Survey,
  answers: SurveyAnswers,
): Promise<SurveySubmission> {
  const res = await fetch("/api/elections/survey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      election: DEFAULT_ELECTION_SLUG,
      survey_slug: survey.slug,
      survey_version: survey.version,
      // Promoted out of the answer bag: these three are how a response is
      // identified and cut, and the API stores them as columns. They stay in
      // `answers` too, so the raw submission is preserved as given.
      email: answers.email,
      name: answers.name,
      region: answers.ward,
      postal_code: answers.postal_code,
      answers,
      ...hubspotPageContext(),
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Survey submission failed");
  }

  const data = await res.json().catch(() => ({}));

  if (answers.email) {
    posthog.identify(answers.email, { email: answers.email });
  }
  posthog.capture("survey_submitted", {
    survey: survey.slug,
    survey_version: survey.version,
    election: DEFAULT_ELECTION_SLUG,
    ward: data.derivedRegion ?? data.region ?? null,
  });

  return {
    surveySlug: data.surveySlug ?? survey.slug,
    region: data.region ?? null,
    derivedRegion: data.derivedRegion ?? null,
    submittedAt: data.submittedAt ?? null,
  };
}
