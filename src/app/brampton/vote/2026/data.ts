// Brampton 2026 municipal election — this region's binding of the shared
// election data layer (@/lib/elections/election-data).
//
// Brampton has no hand-maintained enrichment and no local fallback roster, so
// this is thin: the ward roster, its names and its counts are all derived from
// the API.
//
// The one shape worth knowing: Brampton's ten wards are paired into five
// districts, and each district elects BOTH a city councillor and a regional
// councillor. So a ward page here lists two council races where Toronto's and
// Hamilton's list one — the shared ward page handles that on its own.

import {
  getElectionView,
  getWardDetail,
  type ElectionView,
  type WardDetail,
} from "@/lib/elections/election-data";
import { getElection } from "@/lib/elections/registry";

export const ELECTION = getElection("brampton-2026");

/** Nominations close at 2pm on the API's `nomination_close_date` — the time
 *  isn't in the payload, so it lives here as page copy. */
export const NOMINATION_CLOSE_TIME = "2 p.m.";

/** The election, or null when York Factory is unreachable — there is no local
 *  fallback roster for Brampton, so the page says so rather than invent one. */
export function getBrampton2026(): Promise<ElectionView | null> {
  return getElectionView(ELECTION.slug);
}

/** One ward's races, or null for a ward outside 1–10 (or an API outage). */
export function getBrampton2026Ward(
  wardToken: string,
): Promise<WardDetail | null> {
  return getWardDetail(ELECTION.slug, wardToken);
}
