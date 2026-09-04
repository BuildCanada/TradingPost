import LiveCountdown from "@/components/elections/LiveCountdown";
import { breakdown, msUntil, periodTiming } from "@/lib/elections/dates";
import type { VotingPeriod } from "./key-dates";

/**
 * A live countdown for one VotingPeriod.
 *
 * The server reads the period's state and the remaining milliseconds once, and
 * LiveCountdown ticks forward from there — so crawlers and readers without JS
 * still get a number, and everyone else is corrected to the second on mount.
 *
 * Extracted because the election-day hero, the advance-voting page and the
 * vote-by-mail page all needed this same eight-line dance, and getting the
 * `targetInstant ?? 0` wrong in one of them would have shown a stopped clock.
 */
export function PeriodCountdown({
  period,
  now,
  size = "2xl",
  tone = "light",
}: {
  period: VotingPeriod;
  now: Date;
  size?: "md" | "lg" | "xl" | "2xl";
  tone?: "light" | "dark";
}) {
  const timing = periodTiming(period, now);

  return (
    <LiveCountdown
      opensAt={period.opensAt}
      closesAt={period.closesAt}
      initialParts={breakdown(
        timing.targetInstant ? msUntil(timing.targetInstant, now) : 0,
      )}
      initialState={timing.state}
      labels={{
        upcoming: period.upcomingLabel,
        open: period.openLabel,
        closed: period.closedLabel,
      }}
      size={size}
      tone={tone}
    />
  );
}
