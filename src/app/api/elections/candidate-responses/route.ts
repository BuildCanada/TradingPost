import { NextRequest, NextResponse } from "next/server";

import {
  CANDIDATE_QUESTIONNAIRE_SLUG,
  fetchCandidateResponses,
} from "@/lib/elections/candidate-responses";
import {
  DEFAULT_ELECTION_SLUG,
  isSupportedElection,
} from "@/lib/elections/registry";
import {
  TORONTO_2026_SLUG,
  getToronto2026,
  getToronto2026Ward,
  nameKey,
} from "@/app/toronto/vote/2026/data";

// Published candidate questionnaire answers for one ward.
//
// A read proxy, not a data source: everything it returns is already public
// through York Factory's own endpoint, and it exists because the survey page
// only learns which ward to ask about after the API has placed the respondent
// from their postal code. Fetching it server-side at page load would mean
// shipping every ward's answers to every visitor to use one ward's worth.
//
// The mayoral field rides along too. A voter marks two ballots — one for their
// councillor, one for mayor — so a comparison that answers only half of that is
// answering the smaller half: the mayoral race is the one every voter in the
// city votes in.
//
// The ward's roster rides along with the answers. The comparison names every
// candidate on the ballot, not only the ones who wrote back — a reader wants to
// know that the candidate they are considering said nothing as much as they
// want to know what the others said — and the roster is the only place that
// fact lives. Toronto is the only region with a survey page, so it is the only
// region this looks one up for; everyone else gets an empty roster and a
// comparison of respondents alone.
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

  const toronto = election === TORONTO_2026_SLUG;
  const wardToken = ward.padStart(2, "0");

  const [data, detail, view, everyResponse] = await Promise.all([
    fetchCandidateResponses(election, {
      ward,
      surveySlug: CANDIDATE_QUESTIONNAIRE_SLUG,
    }),
    toronto ? getToronto2026Ward(wardToken).catch(() => null) : null,
    toronto ? getToronto2026().catch(() => null) : null,
    // Unfiltered, because the mayoral field is on no ward: the responses are
    // narrowed to the mayoral roster by name below, the same join every other
    // surface uses.
    toronto
      ? fetchCandidateResponses(election, {
          surveySlug: CANDIDATE_QUESTIONNAIRE_SLUG,
        })
      : [],
  ]);

  const roster = (detail?.councilRaces ?? [])
    .flatMap((race) => race.candidates)
    .map(rosterEntry);

  const mayoralRoster = (view?.mayoral ?? []).map(rosterEntry);
  const mayoralKeys = new Set(mayoralRoster.map((candidate) => candidate.key));
  const mayoralData = everyResponse.filter((response) =>
    mayoralKeys.has(nameKey(response.candidateName)),
  );

  return NextResponse.json({
    data,
    roster,
    mayoral: { data: mayoralData, roster: mayoralRoster },
  });
}

function rosterEntry(candidate: {
  key: string;
  name: string;
  website?: string;
  withdrawn: boolean;
}) {
  return {
    key: candidate.key,
    name: candidate.name,
    website: candidate.website,
    withdrawn: candidate.withdrawn,
  };
}
