import posthog from "posthog-js";

import { DEFAULT_ELECTION_SLUG } from "@/lib/elections/registry";
import type { Survey } from "@/lib/elections/survey";
import { hubspotPageContext } from "@/lib/hubspot-context";

import type { SurveyAnswers } from "./SurveyClient";

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
 */
export async function submitSurvey(
  survey: Survey,
  answers: SurveyAnswers,
): Promise<void> {
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

  if (answers.email) {
    posthog.identify(answers.email, { email: answers.email });
  }
  posthog.capture("survey_submitted", {
    survey: survey.slug,
    survey_version: survey.version,
    election: DEFAULT_ELECTION_SLUG,
    ward: answers.ward,
  });
}
