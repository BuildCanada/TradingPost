export const EDITORIAL_TIME_ZONE = "America/Toronto";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseEditorialDate(value: string | Date): Date {
  if (value instanceof Date) return value;

  // A date-only string is a calendar label, not a UTC instant. Noon UTC stays
  // on the same calendar day in Toronto, including across DST transitions.
  return new Date(DATE_ONLY_PATTERN.test(value) ? `${value}T12:00:00Z` : value);
}

const editorialDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: EDITORIAL_TIME_ZONE,
  year: "numeric",
  month: "short",
  day: "numeric",
});

const editorialLongDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: EDITORIAL_TIME_ZONE,
  year: "numeric",
  month: "long",
  day: "numeric",
});

const editorialMonthFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: EDITORIAL_TIME_ZONE,
  month: "short",
  year: "numeric",
});

/**
 * Format editorial timestamps identically during SSR and browser hydration.
 *
 * Without an explicit time zone, the server and browser can render different
 * calendar days for the same timestamp, which causes a React text hydration
 * mismatch.
 */
export function formatEditorialDate(
  value: string | Date | null | undefined,
): string {
  if (!value) return "";

  const date = parseEditorialDate(value);
  if (Number.isNaN(date.getTime())) return "";

  return editorialDateFormatter.format(date);
}

export function formatEditorialLongDate(
  value: string | Date | null | undefined,
): string {
  if (!value) return "";

  const date = parseEditorialDate(value);
  if (Number.isNaN(date.getTime())) return "";

  return editorialLongDateFormatter.format(date);
}

export function formatEditorialMonth(
  value: string | Date | null | undefined,
): string {
  if (!value) return "";

  const date = parseEditorialDate(value);
  if (Number.isNaN(date.getTime())) return "";

  return editorialMonthFormatter.format(date);
}
