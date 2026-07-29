// Brampton 2026 municipal election — data layer.
//
// One call does it all: GET /elections/brampton-2026 returns every race and
// candidate (~21 races / ~71 candidates today), so this module fetches it
// once and reshapes it for rendering. See york_factory/docs/api/elections.md.
//
// Notable shape differences from Toronto: Brampton's 10 wards are paired into
// 5 districts, each electing BOTH a city councillor and a regional
// councillor — so a race is identified by (office_type, office_body,
// district_number), never by district alone. There is no local fallback
// roster and no photos upstream; both are handled in the UI.

import { differenceInCalendarDays } from "date-fns";
import { fetchElection, type ApiCandidate, type ApiRace } from "@/lib/api/elections";

export const ELECTION_SLUG = "brampton-2026";

/** Brampton's ward numbers, for the ward filter. The API exposes wards only
 *  per-district (`ward_numbers`), so the filter is built from the races
 *  themselves; this is the fallback if none carry ward numbers. */
const FALLBACK_WARDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** Nominations close at 2pm on the API's `nomination_close_date` — the time
 *  isn't in the payload, so it lives here as page copy. */
export const NOMINATION_CLOSE_TIME = "2 p.m.";

export type CandidateView = {
  /** stable within a race — `full_name` is unique there (no candidate IDs) */
  key: string;
  /** display name: "First Last", or the surname alone when mononymous */
  name: string;
  initials: string;
  withdrawn: boolean;
  website: string | null;
  socialLinks: { name: string; url: string }[];
};

export type RaceView = {
  /** (office_type, office_body, district) — the real race identity */
  id: string;
  /** e.g. "City Councillor — Wards 1, 5" */
  label: string;
  /** e.g. "Brampton City Council"; null for mayor */
  officeBody: string | null;
  /** e.g. "Wards 1, 5"; null when at-large */
  districtName: string | null;
  /** wards this race covers; null when at-large (shown for every ward) */
  wardNumbers: number[] | null;
  atLarge: boolean;
  candidates: CandidateView[];
};

export type BramptonElection = {
  name: string;
  electionDateIso: string;
  /** e.g. "Mon, Oct 26, 2026" */
  electionDateLabel: string;
  /** e.g. "Aug 21, 2026"; null when unpublished */
  nominationCloseLabel: string | null;
  daysUntil: number;
  races: RaceView[];
  raceCount: number;
  /** registered (non-withdrawn) candidates across every race */
  candidateCount: number;
  /** ward numbers offered by the ward filter, ascending */
  wards: number[];
};

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

/** Parse "YYYY-MM-DD" as local midnight, so labels and day math don't shift
 *  a day the way `new Date(iso)` does in negative-offset timezones. */
function parseDateOnly(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Display name. `first_name` is null for mononymous candidates, so render the
 * parts we have rather than the published "Last, First" `full_name`.
 */
function displayName(candidate: ApiCandidate): string {
  const parts = [candidate.first_name, candidate.last_name].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  // Last resort: un-invert "Last, First".
  const [last, first] = candidate.full_name.split(",").map((s) => s.trim());
  return first ? `${first} ${last}` : candidate.full_name;
}

/** Initials for the portrait placeholder — every Brampton `photo_url` is null
 *  today, so this is what actually renders. */
function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/**
 * The seat being contested, e.g. "City Councillor". The API hands over the
 * parts, not the sentence: a councillor race is a city or a regional seat
 * depending only on `office_body`, which is the body the page shows above the
 * heading — so it isn't repeated here.
 */
function seatName(race: ApiRace): string {
  if (race.office_type === "mayor") return "Mayor";
  if (race.office_type === "trustee") return "Trustee";
  if (race.office_type === "councillor") {
    return /region/i.test(race.office_body ?? "")
      ? "Regional Councillor"
      : "City Councillor";
  }
  // mp/mpp — future federal/provincial elections.
  return race.office_type.toUpperCase();
}

/** The race heading: the seat plus its district, e.g.
 *  "City Councillor — Wards 1, 5". At-large races carry no district. */
function raceLabel(race: ApiRace): string {
  const seat = seatName(race);
  return race.district_name ? `${seat} — ${race.district_name}` : seat;
}

/** Wards a race covers. `ward_numbers` is authoritative; single-ward races
 *  (Toronto-style) carry the ward in `district_number` instead. */
function wardsFor(race: ApiRace): number[] | null {
  if (race.ward_numbers && race.ward_numbers.length > 0) return race.ward_numbers;
  if (race.district_type !== "at_large" && race.district_number !== null) {
    return [race.district_number];
  }
  return null;
}

function toRaceView(race: ApiRace): RaceView {
  // Withdrawn candidates stay listed (Brampton keeps them) but sort last;
  // the API already orders candidates by last name within each group.
  const candidates = [...race.candidates]
    .sort((a, b) => Number(a.status === "withdrawn") - Number(b.status === "withdrawn"))
    .map((candidate): CandidateView => {
      const name = displayName(candidate);
      return {
        key: candidate.full_name,
        name,
        initials: initialsFor(name),
        withdrawn: candidate.status === "withdrawn",
        website: candidate.website,
        socialLinks: candidate.social_links ?? [],
      };
    });

  return {
    id: [race.office_type, race.office_body ?? "", race.district_number ?? "at-large"].join(
      "|",
    ),
    label: raceLabel(race),
    officeBody: race.office_body,
    districtName: race.district_name,
    wardNumbers: wardsFor(race),
    atLarge: race.district_type === "at_large",
    candidates,
  };
}

/**
 * The Brampton 2026 election, reshaped for the page — or null when the API is
 * unreachable (there is no local fallback roster for Brampton).
 *
 * Races are returned in API order (mayor → councillor → trustee, then by body,
 * then by district), which is the order the page renders.
 */
export async function getBramptonElection(): Promise<BramptonElection | null> {
  const election = await fetchElection(ELECTION_SLUG);
  if (!election) return null;

  const races = election.races.map(toRaceView);
  const wards = [
    ...new Set(races.flatMap((race) => race.wardNumbers ?? [])),
  ].sort((a, b) => a - b);

  return {
    name: election.name,
    electionDateIso: election.election_date,
    electionDateLabel: LONG_DATE.format(parseDateOnly(election.election_date)),
    nominationCloseLabel: election.nomination_close_date
      ? SHORT_DATE.format(parseDateOnly(election.nomination_close_date))
      : null,
    daysUntil: Math.max(
      0,
      differenceInCalendarDays(parseDateOnly(election.election_date), new Date()),
    ),
    races,
    raceCount: races.length,
    candidateCount: races.reduce(
      (total, race) => total + race.candidates.filter((c) => !c.withdrawn).length,
      0,
    ),
    wards: wards.length > 0 ? wards : FALLBACK_WARDS,
  };
}
