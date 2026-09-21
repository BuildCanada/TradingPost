// /vote — the index of elections Build Canada is tracking.
//
// The roster comes from the York Factory elections list; "active" means the
// vote hasn't happened yet. Each election is linked to its coverage on this
// site when we have a page for it (see ELECTION_ROUTES).

import { differenceInCalendarDays } from "date-fns";
import {
  fetchElection,
  fetchElections,
  type ApiElectionSummary,
} from "@/lib/api/elections";
import { getNominationCloseLabel } from "@/lib/elections/election-data";
import { SUPPORTED_ELECTIONS } from "@/lib/elections/registry";

export type ActiveElection = {
  slug: string;
  name: string;
  /** e.g. "Municipal Election · City of Toronto" */
  eyebrow: string;
  jurisdictionName: string;
  electionDateIso: string;
  /** e.g. "Mon, Oct 26, 2026" */
  electionDateLabel: string;
  /** e.g. "Sept 18, 2026", or null when the date isn't published yet */
  nominationCloseLabel: string | null;
  daysUntil: number;
  /** coverage page on this site, or null when we don't have one yet */
  href: string | null;
  /** races on the ballot, or null when the roster couldn't be loaded */
  raceCount: number | null;
  /** registered (non-withdrawn) candidates, or null as above */
  candidateCount: number | null;
};

/** Parse a "YYYY-MM-DD" date as local midnight, so day math and labels don't
 *  shift a day in negative-offset timezones the way `new Date(iso)` does. */
function parseDateOnly(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Whole calendar days from `now` until `iso`, floored at zero. Counts calendar
 * days (not remaining 24h periods) so a countdown reads the same all day.
 */
export function daysUntil(iso: string, now: Date = new Date()): number {
  return Math.max(0, differenceInCalendarDays(parseDateOnly(iso), now));
}

const LONG_DATE = new Intl.DateTimeFormat("en-CA", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

/** "municipal" → "Municipal Election"; falls back to a generic label. */
function kindLabel(kind: string): string {
  if (!kind) return "Election";
  return `${kind.charAt(0).toUpperCase()}${kind.slice(1)} Election`;
}

async function describe(summary: ApiElectionSummary): Promise<ActiveElection> {
  // The list endpoint carries no roster, so pull the detail for the counts.
  // Hourly ISR means this is one upstream request per election per hour.
  const detail = await fetchElection(summary.slug);
  const races = detail?.races ?? null;

  return {
    slug: summary.slug,
    name: summary.name,
    eyebrow: `${kindLabel(summary.kind)} · ${summary.jurisdiction.name}`,
    jurisdictionName: summary.jurisdiction.name,
    electionDateIso: summary.election_date,
    electionDateLabel: LONG_DATE.format(parseDateOnly(summary.election_date)),
    nominationCloseLabel: getNominationCloseLabel(
      summary.slug,
      summary.nomination_close_date,
    ),
    daysUntil: daysUntil(summary.election_date),
    // The registry is the list of elections we have pages for; anything else
    // York Factory knows about is listed here without a link.
    href: SUPPORTED_ELECTIONS[summary.slug]?.basePath ?? null,
    raceCount: races?.length ?? null,
    candidateCount:
      races?.reduce(
        (total, race) =>
          total + race.candidates.filter((c) => c.status === "active").length,
        0,
      ) ?? null,
  };
}

/** Whether we've switched this election's coverage off — hidden regions are
 *  left off this index entirely, not just unlinked. */
function isHidden(slug: string): boolean {
  return SUPPORTED_ELECTIONS[slug]?.hidden === true;
}

/**
 * Every election whose vote hasn't happened yet, soonest first. Empty when
 * the API is unreachable — the page renders a fallback in that case.
 */
export async function getActiveElections(
  now: Date = new Date(),
): Promise<ActiveElection[]> {
  const summaries = (await fetchElections())
    .filter((e) => !isHidden(e.slug))
    .filter((e) => differenceInCalendarDays(parseDateOnly(e.election_date), now) >= 0)
    .sort((a, b) => a.election_date.localeCompare(b.election_date));

  return Promise.all(summaries.map(describe));
}
