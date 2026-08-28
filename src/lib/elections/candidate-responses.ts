// Published candidate questionnaire answers, from York Factory.
//
// These replace candidate-responses.fixture.ts, which stood in while the read
// endpoint did not exist. The source of truth is
// warehouse.election_candidate_survey_responses, entered in the CMS from
// replies staff transcribe by hand.
//
// TWO PUBLISH GATES, AND WHY AN EMPTY LIST IS NORMAL
//   The API serves a response only when both its survey and the response
//   itself are published. A candidate's answers are attributed public
//   statements about what they will do in office, so releasing them is an
//   editorial decision made in the CMS after review — not something a page
//   gets to bypass. For most of the campaign most wards will have nothing, so
//   every caller must handle the empty case rather than treat it as a fault.
//
//   An admin's own token widens both gates to include drafts, which is how
//   staff preview. That is York Factory's `preview_mode?`, applied here for
//   free: apiFetch attaches whatever access token the request carries.

import { apiFetch } from "@/lib/api/client";
import type { CandidateSurveyResponse } from "./alignment";

/** The Toronto candidate questionnaire — the candidate-audience counterpart of
 *  CITY_PRIORITIES_SLUG, sharing all but a handful of its question ids. */
export const CANDIDATE_QUESTIONNAIRE_SLUG = "candidate-questionnaire";

type ApiCandidateResponse = {
  /** "First Last", already matching how the tracker renders a roster name */
  candidate_name: string | null;
  full_name: string | null;
  /** council district number, or null for a city-wide race */
  ward: number | null;
  survey_slug: string;
  survey_version: string | null;
  answers: Record<string, string> | null;
  explanations: Record<string, string> | null;
  source: CandidateSurveyResponse["source"];
  published_at: string | null;
};

/**
 * Published responses for one election, optionally narrowed to a ward.
 *
 * Returns [] when York Factory is unreachable. A ward page's job is its
 * roster; losing the questionnaire should cost the answers, not the page.
 */
export async function fetchCandidateResponses(
  electionSlug: string,
  options: { ward?: string; surveySlug?: string } = {},
): Promise<CandidateSurveyResponse[]> {
  const { ward, surveySlug = CANDIDATE_QUESTIONNAIRE_SLUG } = options;

  try {
    const { data } = await apiFetch<{ data: ApiCandidateResponse[] }>(
      `/elections/${electionSlug}/candidate_responses`,
      {
        params: {
          survey_slug: surveySlug,
          // The API takes a number; the tracker keys wards as "04".
          ...(ward ? { ward: String(parseInt(ward, 10)) } : {}),
        },
        revalidate: 300,
        tags: [`candidate-responses:${electionSlug}`],
      },
    );

    return data.flatMap((row) => toResponse(row));
  } catch {
    return [];
  }
}

/** Drops a row we cannot attribute — a response with no candidate name has
 *  nobody to show it against, and guessing is not an option here. */
function toResponse(row: ApiCandidateResponse): CandidateSurveyResponse[] {
  const candidateName = row.candidate_name?.trim();
  if (!candidateName) return [];

  return [
    {
      candidateName,
      ward: row.ward === null ? "" : String(row.ward).padStart(2, "0"),
      surveySlug: row.survey_slug,
      surveyVersion: row.survey_version ?? "",
      answers: row.answers ?? {},
      explanations: row.explanations ?? undefined,
      source: row.source,
    },
  ];
}
