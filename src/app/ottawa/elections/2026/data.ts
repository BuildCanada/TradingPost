// Ottawa 2026 municipal election — this region's binding of the shared
// election data layer (@/lib/elections/election-data).
//
// Ottawa is wired ahead of its roster: York Factory has no ottawa-2026 yet, so
// getOttawa2026() returns null today and the page renders its pre-roster state
// (see ./page). The moment the election appears upstream, the full landing and
// ward pages light up with no further changes here.
//
// Ward names and the zero-padded route tokens ("01".."24") come from the City
// of Ottawa's published ward boundaries in ./wardGeo, which also draw the
// locator map — the same arrangement Toronto uses.

import {
  getElectionView,
  getWardDetail,
  type ElectionDataOptions,
  type ElectionView,
  type WardDetail,
  type WardRosterEntry,
  type WardView,
} from "@/lib/elections/election-data";
import { getElection } from "@/lib/elections/registry";
import { WARD_SHAPES } from "./wardGeo";

export const ELECTION = getElection("ottawa-2026");

/** Zero-padded ward numbers ("01".."24") for static route generation. */
export const WARD_NUMBERS: string[] = WARD_SHAPES.map((w) => w.n);

const WARD_ROSTER: WardRosterEntry[] = WARD_SHAPES.map((w) => ({
  n: w.n,
  number: parseInt(w.n, 10),
  name: w.name,
}));

const OPTIONS: ElectionDataOptions = { wardRoster: WARD_ROSTER };

/**
 * The wards as the city draws them, with no candidate counts — what the page
 * shows before the roster is published. `count` is zero here and the pre-roster
 * page suppresses it rather than claiming nobody has registered.
 */
export const WARDS: WardView[] = WARD_ROSTER.map((ward) => ({
  ...ward,
  count: 0,
}));

/** The election, or null until York Factory publishes ottawa-2026. */
export function getOttawa2026(): Promise<ElectionView | null> {
  return getElectionView(ELECTION.slug, OPTIONS);
}

/** One ward's races, or null for a ward outside 1–24 (or before the roster
 *  is published). */
export function getOttawa2026Ward(
  wardToken: string,
): Promise<WardDetail | null> {
  return getWardDetail(ELECTION.slug, wardToken, OPTIONS);
}
