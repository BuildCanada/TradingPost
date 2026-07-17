// Toronto 2026 municipal election — data layer.
// Candidate lists come from the City Clerk's registered-candidate list (see
// ./candidates) and are not final until nominations close; photographs and
// profiles are filled in over time. See the disclaimers on the page.

import { differenceInCalendarDays } from "date-fns";
import { WARD_SHAPES } from "./wardGeo";

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

// Hand-maintained candidate data lives in ./candidates — see that file to
// add or edit the mayoral field and per-ward councillor candidates.
import {
  MAYORAL_CANDIDATES as RAW_MAYORAL_CANDIDATES,
  WARD_CANDIDATES,
  type MayoralCandidate,
  type CouncillorCandidate,
  type CouncillorTag,
} from "./candidates";

export { WARD_CANDIDATES };
export type { MayoralCandidate, CouncillorCandidate, CouncillorTag };

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

/** Mayoral candidates, always sorted alphabetically by last name. */
export const MAYORAL_CANDIDATES = byLastName(RAW_MAYORAL_CANDIDATES);

/** Initials from a name, e.g. "Eleanor Voss" → "EV" (used when a candidate
 *  has no explicit `initials` and no photo). */
export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export type Ward = {
  n: string;
  name: string;
  count: number;
};

/**
 * Councillor candidates for a ward (0-based index), from the hand-maintained
 * data in ./candidates, sorted by last name. Returns an empty array for wards
 * with no registered candidates yet.
 */
export function councillorCandidatesForWard(wardIndex: number): CouncillorCandidate[] {
  const key = String(wardIndex + 1).padStart(2, "0");
  return byLastName(WARD_CANDIDATES[key] ?? []);
}

/** Number of candidates shown for a ward — drives the ward-card counts. */
export function wardCandidateCount(wardIndex: number): number {
  return councillorCandidatesForWard(wardIndex).length;
}

// Ward names/numbers come from the official City of Toronto ward geometry
// (see wardGeo.ts); counts reflect the candidate data above.
export const WARDS: Ward[] = WARD_SHAPES.map((w, i) => ({
  n: w.n,
  name: w.name,
  count: wardCandidateCount(i),
}));

/** Look up a ward by its number ("01".."25" or "1".."25"). */
export function findWardIndex(param: string): number {
  const num = parseInt(param, 10);
  if (Number.isNaN(num) || num < 1 || num > WARDS.length) return -1;
  return num - 1;
}
