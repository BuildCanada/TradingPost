// Toronto 2026 municipal election — data layer.
// The candidate roster comes from the York Factory API (which mirrors the
// City Clerk's registered-candidate feeds daily); the hand-maintained data
// in ./candidates enriches it with photos, bios, tags, and verified campaign
// sites, and doubles as the fallback when the API is unreachable.

import { differenceInCalendarDays } from "date-fns";
import { WARD_SHAPES } from "./wardGeo";
import { fetchToronto2026, type ApiCandidate, type ApiElection } from "./api";

export const ELECTION_DATE_ISO = "2026-10-26";
/** Display strings for the key election-calendar dates. */
export const NOMINATION_CLOSE_LABEL = "Sept 18, 2026";
export const ELECTION_DAY_LABEL = "Mon, Oct 26";

/**
 * Whole calendar days from `now` until election day. Counts calendar days
 * (not remaining 24h periods) so the counter reads the same all day, e.g.
 * "103 days" throughout Jul 15 rather than ticking to 102 by lunchtime.
 */
export function daysUntilElection(now: Date = new Date()): number {
  const [y, m, d] = ELECTION_DATE_ISO.split("-").map(Number);
  const electionDay = new Date(y, m - 1, d);
  return Math.max(0, differenceInCalendarDays(electionDay, now));
}

// Hand-maintained enrichment (photos, bios, tags, verified sites) lives in
// ./candidates — see that file to fill in a candidate's profile.
import {
  MAYORAL_CANDIDATES as RAW_MAYORAL_CANDIDATES,
  WARD_CANDIDATES,
  type MayoralCandidate,
  type MayoralTag,
  type CouncillorCandidate,
  type CouncillorTag,
} from "./candidates";

export type { MayoralCandidate, MayoralTag, CouncillorCandidate, CouncillorTag };

/** Generational suffixes ignored when deriving a last-name sort key, so e.g.
 *  "Kannan S'ree Jr" sorts under "s", not "j". */
const NAME_SUFFIXES = new Set(["jr", "jr.", "sr", "sr.", "ii", "iii", "iv", "v"]);

/** Last-name sort key from a full name, e.g. "Eleanor Voss" → "voss".
 *  Used to order candidate lists alphabetically by last name. Trailing
 *  generational suffixes (Jr, Sr, III, …) are skipped. */
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

/** Initials from a name, e.g. "Eleanor Voss" → "EV" (used when a candidate
 *  has no explicit `initials` and no photo). */
export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// ── API roster + local enrichment ──────────────────────────────────────────

/** Matching key for enrichment lookups: lowercase, diacritics and
 *  punctuation stripped, so the Clerk's "Ala'a Adib" matches a local entry
 *  written "Alaa Adib". Also used as the stable candidate key in analytics
 *  events, since the Clerk's feed has no candidate IDs. */
export function nameKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** "First Last" display name from an API candidate ("Last, First"). */
function displayName(candidate: ApiCandidate): string {
  if (candidate.first_name && candidate.last_name) {
    return `${candidate.first_name} ${candidate.last_name}`;
  }
  const [last, first] = candidate.full_name.split(",").map((s) => s.trim());
  return first ? `${first} ${last}` : candidate.full_name;
}

const MAYORAL_ENRICHMENT = new Map(
  RAW_MAYORAL_CANDIDATES.map((c) => [nameKey(c.name), c]),
);

function councillorEnrichment(wardNumber: number) {
  const key = String(wardNumber).padStart(2, "0");
  return new Map((WARD_CANDIDATES[key] ?? []).map((c) => [nameKey(c.name), c]));
}

function activeCandidates(election: ApiElection, wardNumber?: number): ApiCandidate[] {
  const race = election.races.find((r) =>
    wardNumber === undefined
      ? r.office_type === "mayor"
      : r.office_type === "councillor" && r.district_number === wardNumber,
  );
  return (race?.candidates ?? []).filter((c) => c.status === "active");
}

/** Mayoral candidates — API roster merged with local enrichment, sorted by
 *  last name. Falls back to the local list when the API is unreachable. */
export async function getMayoralCandidates(): Promise<MayoralCandidate[]> {
  const election = await fetchToronto2026();
  if (!election) return byLastName(RAW_MAYORAL_CANDIDATES);

  return byLastName(
    activeCandidates(election).map((api): MayoralCandidate => {
      const name = displayName(api);
      const curated = MAYORAL_ENRICHMENT.get(nameKey(name));
      return {
        name,
        tag: curated?.tag ?? "Declared",
        bio: curated?.bio ?? "",
        image: curated?.image ?? api.photo_url ?? undefined,
        website: curated?.website ?? api.website ?? undefined,
        initials: curated?.initials,
      };
    }),
  );
}

/**
 * Councillor candidates for a ward (0-based index) — API roster merged with
 * local enrichment, sorted by last name. Falls back to the local list when
 * the API is unreachable; empty for wards with no registered candidates yet.
 */
export async function getCouncillorCandidates(
  wardIndex: number,
): Promise<CouncillorCandidate[]> {
  const election = await fetchToronto2026();
  const wardNumber = wardIndex + 1;
  if (!election) {
    return byLastName(WARD_CANDIDATES[String(wardNumber).padStart(2, "0")] ?? []);
  }

  const enrichment = councillorEnrichment(wardNumber);
  return byLastName(
    activeCandidates(election, wardNumber).map((api): CouncillorCandidate => {
      const name = displayName(api);
      const curated = enrichment.get(nameKey(name));
      return {
        name,
        tag: curated?.tag ?? "Registered",
        bio: curated?.bio ?? "",
        image: curated?.image ?? api.photo_url ?? undefined,
        website: curated?.website ?? api.website ?? undefined,
        initials: curated?.initials,
      };
    }),
  );
}

// ── Wards ──────────────────────────────────────────────────────────────────

export type Ward = {
  n: string;
  name: string;
  count: number;
};

/** Zero-padded ward numbers ("01".."25") for static route generation. */
export const WARD_NUMBERS: string[] = WARD_SHAPES.map((w) => w.n);

/**
 * All 25 wards with live candidate counts from the API (local counts when it
 * is unreachable). Ward names/numbers come from the official City of Toronto
 * ward geometry (see wardGeo.ts).
 */
export async function getWards(): Promise<Ward[]> {
  const election = await fetchToronto2026();
  return WARD_SHAPES.map((w, i) => ({
    n: w.n,
    name: w.name,
    count: election
      ? activeCandidates(election, i + 1).length
      : (WARD_CANDIDATES[String(i + 1).padStart(2, "0")] ?? []).length,
  }));
}

/** Look up a ward by its number ("01".."25" or "1".."25"). */
export function findWardIndex(param: string): number {
  const num = parseInt(param, 10);
  if (Number.isNaN(num) || num < 1 || num > WARD_SHAPES.length) return -1;
  return num - 1;
}
