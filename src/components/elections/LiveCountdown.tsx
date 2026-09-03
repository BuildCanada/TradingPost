"use client";

import { Fragment, useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";
import {
  breakdown,
  msUntil,
  periodTiming,
  type Breakdown,
  type PeriodState,
} from "@/lib/elections/dates";

/**
 * A days : hours : minutes : seconds countdown to an absolute instant, with the
 * digits animated by NumberFlow so each tick rolls over rather than snapping.
 *
 * Hydration: the server computes the whole breakdown and passes it in, and the
 * first client render uses those same props — no `Date.now()` in the render
 * path, so React sees a matching tree. The effect then takes over on a
 * one-second interval. Because the page is ISR-cached hourly, that first tick
 * can be a visible correction rather than a millisecond one; NumberFlow turns
 * that into the timer perceptibly syncing, which is the one case where the
 * animation is doing real work rather than decoration.
 *
 * `initialState` is likewise the server's reading. Each tick recomputes it, so
 * a period flipping from open to closed in a tab someone left open updates in
 * place rather than going stale.
 *
 * Sits alongside CountdownDays, which stays the right tool for a plain
 * whole-day counter (the election landing page's key-dates band).
 */
export default function LiveCountdown({
  opensAt,
  closesAt,
  initialParts,
  initialState,
  labels,
  size = "md",
}: {
  /** absolute instant the period opens; omitted means a pure deadline, which
   *  counts as open until it passes */
  opensAt?: string;
  /** absolute instant the period closes */
  closesAt: string;
  /** the breakdown to the relevant instant, computed on the server */
  initialParts: Breakdown;
  /** the server's reading of which state the period is in */
  initialState: PeriodState;
  /** what to say beside the number in each state */
  labels: { upcoming: string; open: string; closed: string };
  size?: "md" | "lg";
}) {
  const [state, setState] = useState<PeriodState>(initialState);
  const [parts, setParts] = useState<Breakdown>(initialParts);

  useEffect(() => {
    const tick = () => {
      const timing = periodTiming({ opensAt, closesAt });
      setState(timing.state);
      setParts(
        timing.targetInstant
          ? breakdown(msUntil(timing.targetInstant))
          : { days: 0, hours: 0, minutes: 0, seconds: 0 },
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [opensAt, closesAt]);

  if (state === "closed") {
    return (
      <p className="type-label !tracking-[0.12em] text-text-secondary">
        {labels.closed}
      </p>
    );
  }

  // Deliberately lighter than the display type elsewhere on the page. A timer
  // reads as a group of four small numbers, so semibold at leading-[0.8] fused
  // them into one slab; medium weight and near-normal leading keep the digits
  // legible as digits.
  const numberClass =
    size === "lg"
      ? "font-sans font-medium leading-[0.95] tracking-[-0.02em] text-[clamp(2rem,4.5vw,3.25rem)] tabular-nums"
      : "font-sans font-medium leading-[0.95] tracking-[-0.015em] text-[clamp(1.4rem,2.4vw,1.75rem)] tabular-nums";
  // The colons do the dividing, so the gap only has to keep glyphs apart.
  const gapClass = size === "lg" ? "gap-2 sm:gap-2.5" : "gap-1.5 lg:gap-2";
  // Sized to match the digits, but NOT metric-matched to them: NumberFlow's
  // shadow CSS forces line-height:1 on its own host and insets the digits with
  // vertical padding for its mask, so any leading we set here would align to
  // the wrong thing. The row uses items-baseline instead and lets the browser
  // line up the real text baselines. leading-none keeps this box tight so it
  // contributes no asymmetry of its own.
  const separatorClass = `${
    size === "lg"
      ? "font-sans font-medium text-[clamp(2rem,4.5vw,3.25rem)]"
      : "font-sans font-medium text-[clamp(1.4rem,2.4vw,1.75rem)]"
  } leading-none text-text-secondary/50 select-none`;
  const unitClass =
    size === "lg"
      ? "type-label-sm !tracking-[0.14em] text-text-secondary mt-1.5"
      : "type-label-sm !tracking-[0.12em] text-text-secondary mt-1";

  const slots: { value: number; unit: string; pad: boolean }[] = [
    { value: parts.days, unit: "days", pad: false },
    { value: parts.hours, unit: "hrs", pad: true },
    { value: parts.minutes, unit: "min", pad: true },
    { value: parts.seconds, unit: "sec", pad: true },
  ];

  return (
    <div>
      <div className={`flex items-baseline ${gapClass}`}>
        {slots.map((slot, i) => (
          <Fragment key={slot.unit}>
            {/* aria-hidden so a screen reader hears "52 days 7 hrs", not
                "52 colon days colon 7". */}
            {i > 0 && (
              <div className={separatorClass} aria-hidden="true">
                :
              </div>
            )}
            <div className="text-center">
              <NumberFlow
                value={slot.value}
                // Hours, minutes and seconds are two-digit slots so the row
                // doesn't reflow as they cross 10; days is left unpadded
                // because it is the headline number, not a clock field.
                format={slot.pad ? { minimumIntegerDigits: 2 } : undefined}
                // A countdown falls, so the digits should roll downward.
                trend={-1}
                className={numberClass}
                willChange
                respectMotionPreference
              />
              <div className={unitClass}>{slot.unit}</div>
            </div>
          </Fragment>
        ))}
      </div>
      <p className="mt-4 type-label !tracking-[0.12em] leading-[1.5] text-dark">
        {state === "upcoming" ? labels.upcoming : labels.open}
      </p>
    </div>
  );
}
