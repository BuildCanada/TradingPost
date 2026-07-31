// Election date helpers, kept free of any API or server imports so the
// client-side countdown can share them with the server-rendered pages.

import { differenceInCalendarDays } from "date-fns";

/** Parse "YYYY-MM-DD" as local midnight, so day math and labels don't shift a
 *  day the way `new Date(iso)` does in negative-offset timezones. */
export function parseDateOnly(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Whole calendar days from `now` until `targetIso`, floored at zero. Counts
 * calendar days (not remaining 24h periods) so a counter reads the same all
 * day, e.g. "103 days" throughout Jul 15 rather than ticking to 102 by lunch.
 */
export function daysUntil(targetIso: string, now: Date = new Date()): number {
  return Math.max(0, differenceInCalendarDays(parseDateOnly(targetIso), now));
}

/** The calendar year of a "YYYY-MM-DD" date, e.g. "2026". */
export function yearOf(iso: string): string {
  return iso.slice(0, 4);
}
