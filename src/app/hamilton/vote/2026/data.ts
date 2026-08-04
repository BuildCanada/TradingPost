// Hamilton 2026 municipal election — this region's binding of the shared
// election data layer (@/lib/elections/election-data).
//
// Hamilton is the simplest shape we cover: fifteen wards, one councillor each,
// so the ward roster, names and counts all come straight from the API. There
// is no hand-maintained enrichment and no local fallback roster.

import {
  getElectionView,
  getWardDetail,
  type ElectionView,
  type WardDetail,
} from "@/lib/elections/election-data";
import { getElection } from "@/lib/elections/registry";

export const ELECTION = getElection("hamilton-2026");

/** The election, or null when York Factory is unreachable. */
export function getHamilton2026(): Promise<ElectionView | null> {
  return getElectionView(ELECTION.slug);
}

/** One ward's races, or null for a ward outside 1–15 (or an API outage). */
export function getHamilton2026Ward(
  wardToken: string,
): Promise<WardDetail | null> {
  return getWardDetail(ELECTION.slug, wardToken);
}
