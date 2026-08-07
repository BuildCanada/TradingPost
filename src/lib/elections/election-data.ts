// Election pages — the shared data layer.
//
// Reshapes one York Factory election (GET /elections/:slug) into what the
// shared landing and ward pages render, for any city we cover. Every region's
// data flows through here; only the copy differs (see each region's
// content.ts).
//
// The three jurisdictions this serves are shaped differently upstream, and the
// differences are load-bearing:
//
//   Toronto   25 wards, one councillor each. Races carry the ward in
//             `district_number` (not `ward_numbers`) and put the neighbourhood
//             name in `district_name`, e.g. "Etobicoke North".
//   Hamilton  15 wards, one councillor each, `district_name` is just "Ward 3".
//   Brampton  10 wards paired into 5 districts, each electing BOTH a city and
//             a regional councillor — so a ward votes in two council races and
//             a race is identified by (office_type, office_body, district).
//
// Photos and bios exist only for Toronto, as hand-maintained enrichment keyed
// by name; everywhere else candidates render as initials.

import { fetchElection, type ApiCandidate, type ApiRace } from "@/lib/api/elections";
import { daysUntil, parseDateOnly } from "./dates";

export { daysUntil, parseDateOnly };

// ── Names ──────────────────────────────────────────────────────────────────

/** Generational suffixes ignored when deriving a last-name sort key, so e.g.
 *  "Kannan S'ree Jr" sorts under "s", not "j". */
const NAME_SUFFIXES = new Set(["jr", "jr.", "sr", "sr.", "ii", "iii", "iv", "v"]);

/** Last-name sort key from a full name, e.g. "Eleanor Voss" → "voss".
 *  Trailing generational suffixes (Jr, Sr, III, …) are skipped. */
export function lastNameKey(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  while (parts.length > 1 && NAME_SUFFIXES.has(parts[parts.length - 1].toLowerCase())) {
    parts.pop();
  }
  return (parts[parts.length - 1] ?? "").toLowerCase();
}

/** Sort candidates alphabetically by last name (stable, non-mutating). */
function byLastName<T extends { name: string }>(candidates: T[]): T[] {
  return [...candidates].sort((a, b) =>
    lastNameKey(a.name).localeCompare(lastNameKey(b.name)),
  );
}

/** Initials from a name, e.g. "Eleanor Voss" → "EV" (shown when a candidate
 *  has no photo, which upstream is everyone outside Toronto). */
export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Matching key for enrichment lookups: lowercase, diacritics and punctuation
 *  stripped, so the Clerk's "Ala'a Adib" matches a local entry written "Alaa
 *  Adib". Also the stable candidate key in analytics events, since the clerks'
 *  feeds carry no candidate IDs. */
export function nameKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * "First Last" display name. `first_name` is null for mononymous candidates,
 * so render the parts we have rather than the published "Last, First".
 */
function displayName(candidate: ApiCandidate): string {
  const parts = [candidate.first_name, candidate.last_name].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  const [last, first] = candidate.full_name.split(",").map((s) => s.trim());
  return first ? `${first} ${last}` : candidate.full_name;
}

// ── Dates ──────────────────────────────────────────────────────────────────

const LONG_DATE = new Intl.DateTimeFormat("en-CA", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

const SHORT_DATE = new Intl.DateTimeFormat("en-CA", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

// ── Views ──────────────────────────────────────────────────────────────────

/** Hand-maintained extras for a candidate, matched by `nameKey`. Toronto is
 *  the only region with any; see its candidates.ts. */
export type CandidateEnrichment = {
  tag?: string;
  bio?: string;
  image?: string;
  website?: string;
  initials?: string;
};

/** Enrichment for one race, keyed by `nameKey(name)`. */
export type EnrichmentMap = Map<string, CandidateEnrichment>;

export type CandidateView = {
  /** `nameKey(name)` — stable within a race, and the analytics candidate key */
  key: string;
  name: string;
  initials: string;
  /** e.g. "Incumbent"; the default depends on the race (see `defaultTag`) */
  tag: string;
  /** hand-written; empty for every region but Toronto */
  bio: string;
  image?: string;
  website?: string;
  /** kept listed but struck through — some clerks never drop withdrawals */
  withdrawn: boolean;
  socialLinks: { name: string; url: string }[];
};

export type RaceView = {
  /** (office_type, office_body, district) — the real race identity */
  id: string;
  /** the seat alone, e.g. "City Councillor" */
  seat: string;
  /** the seat plus its district, e.g. "City Councillor — Wards 1, 5" */
  label: string;
  /** e.g. "Brampton City Council"; null for mayor and for Toronto councillors */
  officeBody: string | null;
  /** e.g. "Etobicoke North" or "Wards 1, 5"; null when at-large */
  districtName: string | null;
  /** city wards this race covers; empty when at-large or unmapped */
  wardNumbers: number[];
  atLarge: boolean;
  candidates: CandidateView[];
  /** registered (non-withdrawn) candidates */
  registeredCount: number;
};

export type WardView = {
  /** the route token — zero-padded for Toronto ("01"), plain elsewhere ("7") */
  n: string;
  /** the ward's integer, for matching against the API */
  number: number;
  /** e.g. "Etobicoke North", or "Ward 7" where the city names no districts */
  name: string;
  /** registered candidates across every council race this ward votes in */
  count: number;
};

export type ElectionView = {
  slug: string;
  /** e.g. "Toronto 2026 General Municipal Election" */
  name: string;
  electionDateIso: string;
  /** e.g. "Mon, Oct 26, 2026" */
  electionDateLabel: string;
  /** e.g. "Aug 21, 2026"; null when the city hasn't published it */
  nominationCloseLabel: string | null;
  daysUntil: number;
  /** the mayoral field, sorted by last name */
  mayoral: CandidateView[];
  wards: WardView[];
  /** city-wide races other than mayor (e.g. the French-board trustees) */
  atLargeRaces: RaceView[];
  raceCount: number;
  /** registered candidates across every race */
  candidateCount: number;
};

/** A region's ward roster, when it supplies its own. Toronto does, so its
 *  wards keep the official neighbourhood names and zero-padded route tokens
 *  from its map geometry; other regions are derived from the API. */
export type WardRosterEntry = { n: string; number: number; name: string };

export type ElectionDataOptions = {
  /** override the API-derived ward roster (Toronto passes its map geometry) */
  wardRoster?: WardRosterEntry[];
  /** hand-maintained extras for the mayoral field */
  mayoralEnrichment?: EnrichmentMap;
  /** hand-maintained extras for a ward's council candidates */
  councillorEnrichment?: (wardNumber: number) => EnrichmentMap;
};

// ── Reshaping ──────────────────────────────────────────────────────────────

/**
 * The seat being contested, e.g. "City Councillor". The API hands over the
 * parts, not the sentence: a councillor race is a city or a regional seat
 * depending only on `office_body`. Where a city runs one council (Toronto,
 * Hamilton) that distinction doesn't exist and the seat is just "Councillor".
 */
function seatName(race: ApiRace): string {
  if (race.office_type === "mayor") return "Mayor";
  if (race.office_type === "trustee") return "Trustee";
  if (race.office_type === "councillor") {
    if (/region/i.test(race.office_body ?? "")) return "Regional Councillor";
    return race.office_body ? "City Councillor" : "Councillor";
  }
  // mp/mpp — future federal/provincial elections.
  return race.office_type.toUpperCase();
}

/**
 * The city wards a race covers.
 *
 * `ward_numbers` is authoritative wherever it's set. Councillor races that
 * lack it (Toronto's) carry the ward in `district_number` instead. Trustee
 * races get no such fallback on purpose: a school-board ward is its own
 * numbering, so Toronto's "TDSB ward 5" would otherwise be read as city ward
 * 5 and put the wrong trustees on a ward page.
 */
function wardsFor(race: ApiRace): number[] {
  if (race.ward_numbers && race.ward_numbers.length > 0) return race.ward_numbers;
  if (
    race.office_type === "councillor" &&
    race.district_type !== "at_large" &&
    race.district_number !== null
  ) {
    return [race.district_number];
  }
  return [];
}

/** The default tag for a candidate with no hand-written one. Mirrors what the
 *  Toronto pages have always shown, so its copy is unchanged. */
function defaultTag(race: ApiRace): string {
  return race.office_type === "mayor" ? "Declared" : "Registered";
}

function toCandidateView(
  candidate: ApiCandidate,
  race: ApiRace,
  enrichment?: EnrichmentMap,
): CandidateView {
  const name = displayName(candidate);
  const curated = enrichment?.get(nameKey(name));
  return {
    key: nameKey(name),
    name,
    initials: curated?.initials ?? initialsFor(name),
    tag: curated?.tag ?? defaultTag(race),
    bio: curated?.bio ?? "",
    image: curated?.image ?? candidate.photo_url ?? undefined,
    website: curated?.website ?? candidate.website ?? undefined,
    withdrawn: candidate.status === "withdrawn",
    socialLinks: candidate.social_links ?? [],
  };
}

function toRaceView(race: ApiRace, enrichment?: EnrichmentMap): RaceView {
  // Withdrawn candidates stay listed where a clerk keeps them, but sort last.
  const candidates = byLastName(
    race.candidates.map((c) => toCandidateView(c, race, enrichment)),
  ).sort((a, b) => Number(a.withdrawn) - Number(b.withdrawn));

  const seat = seatName(race);
  return {
    id: [race.office_type, race.office_body ?? "", race.district_number ?? "at-large"].join(
      "|",
    ),
    seat,
    label: race.district_name ? `${seat} — ${race.district_name}` : seat,
    officeBody: race.office_body,
    districtName: race.district_name,
    wardNumbers: wardsFor(race),
    atLarge: race.district_type === "at_large",
    candidates,
    registeredCount: candidates.filter((c) => !c.withdrawn).length,
  };
}

/** The council races a ward votes in — one for Toronto and Hamilton, two for
 *  Brampton (its city and its regional seat). */
function councilRaces(races: ApiRace[], wardNumber: number): ApiRace[] {
  return races.filter(
    (race) =>
      race.office_type === "councillor" && wardsFor(race).includes(wardNumber),
  );
}

/**
 * The ward roster, derived from the council races. Used for every region that
 * doesn't supply its own: the ward's name is its district name only when the
 * district *is* the ward (Hamilton's "Ward 3"), never when the district spans
 * several (Brampton's "Wards 1, 5" is a district, not a ward name).
 */
function deriveWardRoster(races: ApiRace[]): WardRosterEntry[] {
  const numbers = new Set<number>();
  for (const race of races) {
    if (race.office_type !== "councillor") continue;
    for (const n of wardsFor(race)) numbers.add(n);
  }

  return [...numbers]
    .sort((a, b) => a - b)
    .map((number) => {
      const own = races.find(
        (race) =>
          race.office_type === "councillor" &&
          race.district_name !== null &&
          wardsFor(race).length === 1 &&
          wardsFor(race)[0] === number,
      );
      return {
        n: String(number),
        number,
        name: own?.district_name ?? `Ward ${number}`,
      };
    });
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * One election reshaped for its landing page, or null when the API is
 * unreachable — every caller renders a fallback rather than failing the route.
 */
export async function getElectionView(
  slug: string,
  options: ElectionDataOptions = {},
): Promise<ElectionView | null> {
  const election = await fetchElection(slug);
  if (!election) return null;

  const mayorRace = election.races.find((race) => race.office_type === "mayor");
  const mayoral = mayorRace
    ? toRaceView(mayorRace, options.mayoralEnrichment).candidates.filter(
        (c) => !c.withdrawn,
      )
    : [];

  const roster = options.wardRoster ?? deriveWardRoster(election.races);
  const wards: WardView[] = roster.map((ward) => ({
    ...ward,
    count: councilRaces(election.races, ward.number).reduce(
      (total, race) =>
        total + race.candidates.filter((c) => c.status === "active").length,
      0,
    ),
  }));

  // City-wide races beside the mayor's — the French-language school boards in
  // Brampton and Hamilton. Toronto has none, so its page is unaffected.
  const atLargeRaces = election.races
    .filter((race) => race.district_type === "at_large" && race.office_type !== "mayor")
    .map((race) => toRaceView(race));

  return {
    slug,
    name: election.name,
    electionDateIso: election.election_date,
    electionDateLabel: LONG_DATE.format(parseDateOnly(election.election_date)),
    nominationCloseLabel: election.nomination_close_date
      ? SHORT_DATE.format(parseDateOnly(election.nomination_close_date))
      : null,
    daysUntil: daysUntil(election.election_date),
    mayoral,
    wards,
    atLargeRaces,
    raceCount: election.races.length,
    candidateCount: election.races.reduce(
      (total, race) =>
        total + race.candidates.filter((c) => c.status === "active").length,
      0,
    ),
  };
}

export type WardDetail = {
  ward: WardView;
  /** the council seat(s) this ward elects — two in Brampton, one elsewhere */
  councilRaces: RaceView[];
  /** school-board races this ward votes in; empty for Toronto, whose trustee
   *  races carry no city-ward mapping */
  trusteeRaces: RaceView[];
  /** every ward, for the prev/next footer and the ward count */
  wards: WardView[];
};

/**
 * One ward's races, or null when the ward isn't in this election's roster (a
 * bad URL) or the API is unreachable. `wardToken` is the route segment, so
 * "01" and "1" both resolve.
 */
export async function getWardDetail(
  slug: string,
  wardToken: string,
  options: ElectionDataOptions = {},
): Promise<WardDetail | null> {
  const election = await fetchElection(slug);
  if (!election) return null;

  const number = parseInt(wardToken, 10);
  if (Number.isNaN(number)) return null;

  const view = await getElectionView(slug, options);
  const ward = view?.wards.find((w) => w.number === number);
  if (!view || !ward) return null;

  const enrichment = options.councillorEnrichment?.(number);

  return {
    ward,
    wards: view.wards,
    councilRaces: councilRaces(election.races, number).map((race) =>
      toRaceView(race, enrichment),
    ),
    trusteeRaces: election.races
      .filter(
        (race) =>
          race.office_type === "trustee" && wardsFor(race).includes(number),
      )
      .map((race) => toRaceView(race)),
  };
}
