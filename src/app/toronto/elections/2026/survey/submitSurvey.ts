import posthog from "posthog-js";

import { DEFAULT_ELECTION_SLUG } from "@/lib/elections/registry";
import { hubspotPageContext } from "@/lib/hubspot-context";

import type { SurveyAnswers } from "./SurveyClient";
import { SURVEY_SLUG, SURVEY_VERSION } from "./surveyData";

/**
 * Sends a completed survey to /api/elections/survey, which forwards it to York
 * Factory (subscriber upsert + one response per subscriber per survey).
 *
 * Throws on failure. The caller keeps the user's answers on screen and shows a
 * retry, so a thrown error is a recoverable state rather than lost work — which
 * is why nothing here swallows it.
 */
export async function submitSurvey(answers: SurveyAnswers): Promise<void> {
  const res = await fetch("/api/elections/survey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      election: DEFAULT_ELECTION_SLUG,
      survey_slug: SURVEY_SLUG,
      survey_version: SURVEY_VERSION,
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
    survey: SURVEY_SLUG,
    election: DEFAULT_ELECTION_SLUG,
    ward: answers.ward,
  });
}
