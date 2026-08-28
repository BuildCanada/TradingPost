import { NextRequest, NextResponse } from "next/server";

import {
  CANDIDATE_QUESTIONNAIRE_SLUG,
  fetchCandidateResponses,
} from "@/lib/elections/candidate-responses";
import {
  DEFAULT_ELECTION_SLUG,
  isSupportedElection,
} from "@/lib/elections/registry";

// Published candidate questionnaire answers for one ward.
//
// A read proxy, not a data source: everything it returns is already public
// through York Factory's own endpoint, and it exists because the survey page
// only learns which ward to ask about after the API has placed the respondent
// from their postal code. Fetching it server-side at page load would mean
// shipping every ward's answers to every visitor to use one ward's worth.
//
// `election` is checked against the registry so a client cannot aim this at an
// arbitrary slug, matching the submit route.

const WARD_PATTERN = /^\d{1,2}$/;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const election = searchParams.get("election") ?? DEFAULT_ELECTION_SLUG;
  const ward = searchParams.get("ward") ?? "";

  if (!isSupportedElection(election)) {
    return NextResponse.json({ error: "Unknown election" }, { status: 400 });
  }
  if (!WARD_PATTERN.test(ward)) {
    return NextResponse.json({ error: "Invalid ward" }, { status: 400 });
  }

  const data = await fetchCandidateResponses(election, {
    ward,
    surveySlug: CANDIDATE_QUESTIONNAIRE_SLUG,
  });

  return NextResponse.json({ data });
}
