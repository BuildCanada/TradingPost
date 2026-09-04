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

/** Milliseconds until an absolute instant (e.g. "2026-09-24T16:30:00-04:00"),
 *  floored at zero. Unlike `daysUntil` this needs no timezone handling — the
 *  instant carries its own offset and `Date.now()` is absolute. */
export function msUntil(instantIso: string, now: Date = new Date()): number {
  return Math.max(0, Date.parse(instantIso) - now.getTime());
}

export type Breakdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/** Split a duration into whole days, hours, minutes and seconds. */
export function breakdown(ms: number): Breakdown {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export type PeriodState = "upcoming" | "open" | "closed";

export type PeriodTiming = {
  state: PeriodState;
  /** the instant being counted toward — the opening while upcoming, the close
   *  while open, and null once closed (nothing left to count) */
  targetInstant: string | null;
};

/**
 * Where a voting period sits relative to `now`. A period with no `opensAt` is
 * a pure deadline and counts as open until it passes.
 */
export function periodTiming(
  period: { opensAt?: string; closesAt: string },
  now: Date = new Date(),
): PeriodTiming {
  const t = now.getTime();
  if (t >= Date.parse(period.closesAt)) {
    return { state: "closed", targetInstant: null };
  }
  if (period.opensAt && t < Date.parse(period.opensAt)) {
    return { state: "upcoming", targetInstant: period.opensAt };
  }
  return { state: "open", targetInstant: period.closesAt };
}
