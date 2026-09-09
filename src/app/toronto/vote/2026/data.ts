// Toronto 2026 municipal election — this region's binding of the shared
// election data layer (@/lib/elections/election-data).
//
// Two things are Toronto's alone and live here:
//   · the hand-maintained enrichment in ./candidates — photos, bios,
//     Incumbent/Challenger tags and verified campaign sites, matched to the
//     API roster by name;
//   · a local fallback roster, so the page still lists a field when York
//     Factory is unreachable. No other region has one.
//
// Ward names and the zero-padded route tokens ("01".."25") come from the
// official ward geometry in ./wardGeo, which also draws the locator map.

import { WARD_SHAPES } from "./wardGeo";
import {
  getCandidateProfiles,
  getElectionView,
  getNominationCloseLabel,
  getWardDetail,
  initialsFor,
  nameKey,
  type CandidateProfile,
  type CandidateView,
  type ElectionDataOptions,
  type ElectionView,
  type WardDetail,
  type WardRosterEntry,
} from "@/lib/elections/election-data";
import { candidateSlug } from "@/lib/elections/candidate-profile";
import { getElection } from "@/lib/elections/registry";
import {
  MAYORAL_CANDIDATES,
  WARD_CANDIDATES,
  type MayoralCandidate,
  type CouncillorCandidate,
} from "./candidates";

export type { MayoralCandidate, CouncillorCandidate };
export { initialsFor, nameKey, candidateSlug };
export type { CandidateProfile };

export const ELECTION = getElection("toronto-2026");

/** The York Factory slug, for the shared routes that special-case this region. */
export const TORONTO_2026_SLUG = ELECTION.slug;

/** Zero-padded ward numbers ("01".."25") for static route generation. */
export const WARD_NUMBERS: string[] = WARD_SHAPES.map((w) => w.n);

const WARD_ROSTER: WardRosterEntry[] = WARD_SHAPES.map((w) => ({
  n: w.n,
  number: parseInt(w.n, 10),
  name: w.name,
}));

/** The local roster for one ward, keyed as candidates.ts stores it ("01"). */
function localWardCandidates(wardNumber: number): CouncillorCandidate[] {
  return WARD_CANDIDATES[String(wardNumber).padStart(2, "0")] ?? [];
}

const OPTIONS: ElectionDataOptions = {
  wardRoster: WARD_ROSTER,
  mayoralEnrichment: new Map(
    MAYORAL_CANDIDATES.map((c) => [nameKey(c.name), c]),
  ),
  councillorEnrichment: (wardNumber) =>
    new Map(localWardCandidates(wardNumber).map((c) => [nameKey(c.name), c])),
};

// ── Fallback ───────────────────────────────────────────────────────────────

/** Shape a hand-maintained entry like an API-derived candidate. */
function toView(
  candidate: MayoralCandidate | CouncillorCandidate,
): CandidateView {
  return {
    key: nameKey(candidate.name),
    name: candidate.name,
    initials: candidate.initials ?? initialsFor(candidate.name),
    tag: candidate.tag,
    bio: candidate.bio,
    image: candidate.image,
    website: candidate.website,
    withdrawn: false,
    socialLinks: [],
  };
}

function byLastName<T extends { name: string }>(list: T[]): T[] {
  const key = (name: string) =>
    (name.trim().split(/\s+/).pop() ?? "").toLowerCase();
  return [...list].sort((a, b) => key(a.name).localeCompare(key(b.name)));
}

/** The page as rendered from the local roster alone, for when York Factory is
 *  unreachable. Counts and dates come from the same hand-maintained data. */
function fallbackView(): ElectionView {
  return {
    slug: ELECTION.slug,
    name: "Toronto 2026 General Municipal Election",
    electionDateIso: ELECTION.electionDateIso,
    electionDateLabel: "Mon, Oct 26, 2026",
    nominationCloseLabel: getNominationCloseLabel(ELECTION.slug, null),
    daysUntil: 0,
    mayoral: byLastName(MAYORAL_CANDIDATES).map(toView),
    wards: WARD_ROSTER.map((ward) => ({
      ...ward,
      count: localWardCandidates(ward.number).length,
    })),
    atLargeRaces: [],
    raceCount: WARD_ROSTER.length + 1,
    candidateCount:
      MAYORAL_CANDIDATES.length +
      WARD_ROSTER.reduce(
        (total, ward) => total + localWardCandidates(ward.number).length,
        0,
      ),
  };
}

// ── Public API ─────────────────────────────────────────────────────────────

/** The election, falling back to the local roster when the API is down. */
export async function getToronto2026(): Promise<ElectionView> {
  return (await getElectionView(ELECTION.slug, OPTIONS)) ?? fallbackView();
}

/** One ward's races, or null for a ward number outside 1–25. Falls back to
 *  the local roster when the API is unreachable. */
export async function getToronto2026Ward(
  wardToken: string,
): Promise<WardDetail | null> {
  const live = await getWardDetail(ELECTION.slug, wardToken, OPTIONS);
  if (live) return live;

  const number = parseInt(wardToken, 10);
  const view = fallbackView();
  const ward = view.wards.find((w) => w.number === number);
  if (!ward) return null;

  const candidates = byLastName(localWardCandidates(number)).map(toView);
  return {
    ward,
    wards: view.wards,
    councilRaces: [
      {
        id: `councillor||${number}`,
        seat: "Councillor",
        label: `Councillor — ${ward.name}`,
        officeBody: null,
        districtName: ward.name,
        districtNumber: number,
        wardNumbers: [number],
        atLarge: false,
        candidates,
        registeredCount: candidates.length,
      },
    ],
    trusteeRaces: [],
  };
}

// ── Candidate pages ────────────────────────────────────────────────────────

/* Every candidate has a page of their own at ./candidates/[candidate], keyed
   by `candidateSlug(name)`. Two things follow from the roster being rebuilt
   from the Clerk's feed rather than stored: the slug has to be derivable from
   the name, and a candidate who withdraws — or a name the Clerk corrects —
   changes the set of valid URLs. So the routes are generated from whatever the
   roster says today and anything outside it 404s. */

/** Every candidate in the election, mayoral and council alike, each with the
 *  race they are in. Falls back to the local roster when the API is down —
 *  which means the mayoral field only, since the fallback's ward races are
 *  assembled per ward. */
export async function getToronto2026Candidates(): Promise<CandidateProfile[]> {
  const live = await getCandidateProfiles(ELECTION.slug, OPTIONS);
  if (live) return live;

  const view = fallbackView();
  return view.mayoral.map((candidate) => ({
    candidate,
    races: [
      {
        id: "mayor||at-large",
        seat: "Mayor",
        label: "Mayor",
        officeBody: null,
        districtName: null,
        districtNumber: null,
        wardNumbers: [],
        atLarge: true,
        candidates: view.mayoral,
        registeredCount: view.mayoral.length,
      },
    ],
    officeTypes: ["mayor"],
    wards: [],
    withdrawnFrom: [],
  }));
}

/** One candidate by their URL slug, or null for a slug that names nobody on
 *  the current roster. */
export async function getToronto2026Candidate(
  slug: string,
): Promise<CandidateProfile | null> {
  const profiles = await getToronto2026Candidates();
  return (
    profiles.find(
      (profile) => candidateSlug(profile.candidate.name) === slug,
    ) ?? null
  );
}
