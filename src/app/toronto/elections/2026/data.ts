// Toronto 2026 municipal election — illustrative placeholder data.
// Candidate lists and photographs are placeholders pending nomination day;
// official lists are certified by the City Clerk. See the disclaimers on the page.

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
  MAYORAL_CANDIDATES,
  WARD_CANDIDATES,
  type MayoralCandidate,
  type CouncillorCandidate,
  type CouncillorTag,
} from "./candidates";

export { MAYORAL_CANDIDATES, WARD_CANDIDATES };
export type { MayoralCandidate, CouncillorCandidate, CouncillorTag };

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

/* ── Councillor placeholders ─────────────────────────────────────────────
 * Wards without hand-entered data in WARD_CANDIDATES fall back to this
 * deterministic illustrative field so the pages stay populated. Delete this
 * block (and the fallback in councillorCandidatesForWard) once every ward is
 * populated in ./candidates.                                               */

const PLACEHOLDER_COUNTS = [5, 4, 7, 6, 4, 5, 3, 6, 8, 9, 7, 6, 8, 7, 4, 5, 4, 6, 5, 4, 5, 6, 3, 4, 5];
const FIRST_NAMES = ["Aisha", "Marco", "Priya", "Daniel", "Grace", "Omar", "Lena", "Theo", "Nadia", "Simon", "Clara", "Raj", "Maeve", "Victor", "Yara", "Hugh"];
const LAST_NAMES = ["Okafor", "Bianchi", "Nguyen", "MacLeod", "Ferreira", "Haddad", "Kowalski", "Osei", "Rossi", "Patel", "Lindqvist", "Tanaka", "Dubois", "Reyes", "Brennan", "Sandhu"];
const BIOS = [
  "Local business owner focused on main-street revitalization.",
  "Community organizer and tenant-rights advocate.",
  "Urban planner specializing in mid-rise housing.",
  "School trustee and youth-sports coach.",
  "Former city hall policy adviser turned neighbourhood volunteer.",
  "Transit operator and union representative.",
  "Family physician and public-health advocate.",
  "Real-estate developer and heritage-preservation volunteer.",
  "Environmental engineer and cycling-infrastructure champion.",
  "Small-business accountant and residents’ association chair.",
];
const COMMITTEES = ["the budget committee", "the planning and housing committee", "the infrastructure committee", "the economic development committee"];

function placeholderCouncillors(wardIndex: number): CouncillorCandidate[] {
  const count = PLACEHOLDER_COUNTS[wardIndex];
  const out: CouncillorCandidate[] = [];
  for (let i = 0; i < count; i++) {
    const first = FIRST_NAMES[(wardIndex * 5 + i * 7) % FIRST_NAMES.length];
    const last = LAST_NAMES[(wardIndex * 3 + i * 11 + 2) % LAST_NAMES.length];
    let tag: CouncillorTag;
    let bio: string;
    if (i === 0) {
      tag = "Incumbent";
      bio = `Incumbent councillor since 2022; chairs ${COMMITTEES[wardIndex % COMMITTEES.length]}.`;
    } else if (i === count - 1 && count > 3) {
      tag = "Registered";
      bio = BIOS[(wardIndex * 2 + i * 3) % BIOS.length];
    } else {
      tag = "Challenger";
      bio = BIOS[(wardIndex * 2 + i * 3) % BIOS.length];
    }
    out.push({ name: `${first} ${last}`, tag, bio });
  }
  return out;
}

/**
 * Councillor field for a ward (0-based index): hand-entered data from
 * ./candidates when present, otherwise the illustrative placeholder field.
 */
export function councillorCandidatesForWard(wardIndex: number): CouncillorCandidate[] {
  const key = String(wardIndex + 1).padStart(2, "0");
  const manual = WARD_CANDIDATES[key];
  return manual && manual.length > 0 ? manual : placeholderCouncillors(wardIndex);
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
