import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

/**
 * Format a bill date as "MMM D, YYYY" in UTC.
 *
 * Bill stage dates are calendar dates stored as UTC midnight (e.g.
 * "2025-06-05T00:00:00.000Z"). Formatting them in the runtime's local
 * timezone makes SSR (UTC on the server) and hydration (the user's local
 * timezone) disagree on the day, which triggers a React hydration mismatch.
 * Formatting in UTC is deterministic across server and client AND preserves
 * the intended calendar day.
 */
export function formatBillDate(
  value?: Date | string | number | null,
): string {
  if (value === undefined || value === null) return "N/A";
  const d = dayjs.utc(value);
  return d.isValid() ? d.format("MMM D, YYYY") : "N/A";
}
