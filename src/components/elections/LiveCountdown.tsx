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
  tone = "light",
  align = "start",
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
  size?: "md" | "lg" | "xl" | "2xl";
  /** Surface the timer is sitting on. "dark" swaps the muted greys for linen
   *  so the units and the state label stay legible on a dark panel. */
  tone?: "light" | "dark";
  /** How the digit row and the state label sit in the space they are given.
   *  The digits are a flex row, so this has to drive justify-content — a
   *  `text-right` on the parent moves the labels and leaves the digits put. */
  align?: "start" | "center" | "end";
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

  const isDark = tone === "dark";
  const rowAlign = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
  }[align];
  const textAlign = {
    start: "text-left",
    center: "text-center",
    end: "text-right",
  }[align];
  const separatorTone = isDark
    ? "text-linen-100/40"
    : "text-text-secondary/50";
  const unitTone = isDark ? "text-linen-100/70" : "text-text-secondary";
  const stateTone = isDark ? "text-linen-100" : "text-dark";

  if (state === "closed") {
    return (
      <p className={`type-label !tracking-[0.12em] ${unitTone} ${textAlign}`}>
        {labels.closed}
      </p>
    );
  }

  // Deliberately lighter than the display type elsewhere on the page. A timer
  // reads as a group of four small numbers, so semibold at leading-[0.8] fused
  // them into one slab; medium weight and near-normal leading keep the digits
  // legible as digits.
  // One row per size so the digit size, the colons and the unit labels can't
  // drift out of step with each other. `xl` exists for a panel that gives the
  // timer most of its width — its vw term has to be generous enough to keep
  // growing inside a half-width column, where 4.5vw tops out early. `2xl` is
  // for a full-bleed hero that has the whole page width to itself, and is the
  // only size that can afford a ceiling this high.
  const SIZES = {
    // Note the two-step sizing, and that `lg:` here is the Tailwind breakpoint,
    // not the `lg` entry below. Three of these sit side by side from the md
    // breakpoint up, and at 768px a card's outer gutter leaves only ~157px of
    // content — barely more than the row already needs, so the base clamp has
    // no room to grow. From 1024px up more than half the column goes unused,
    // which is where the larger step goes. Raising the base clamp instead
    // would overflow the 768–1024 band.
    md: {
      digits:
        "font-sans font-medium leading-[0.95] tracking-[-0.015em] text-[clamp(1.4rem,2.4vw,1.75rem)] lg:text-[clamp(1.875rem,3.1vw,3rem)] tabular-nums",
      separator:
        "font-sans font-medium text-[clamp(1.4rem,2.4vw,1.75rem)] lg:text-[clamp(1.875rem,3.1vw,3rem)]",
      gap: "gap-1.5 lg:gap-2.5",
      unit: "type-label-sm !tracking-[0.12em] mt-1 lg:mt-2",
    },
    lg: {
      digits:
        "font-sans font-medium leading-[0.95] tracking-[-0.02em] text-[clamp(2rem,4.5vw,3.25rem)] tabular-nums",
      separator: "font-sans font-medium text-[clamp(2rem,4.5vw,3.25rem)]",
      gap: "gap-2 sm:gap-2.5",
      unit: "type-label-sm !tracking-[0.14em] mt-1.5",
    },
    xl: {
      digits:
        "font-sans font-medium leading-[0.95] tracking-[-0.03em] text-[clamp(2.5rem,7.5vw,5.25rem)] tabular-nums",
      separator: "font-sans font-medium text-[clamp(2.5rem,7.5vw,5.25rem)]",
      gap: "gap-2.5 sm:gap-4",
      unit: "type-label-sm !tracking-[0.14em] mt-2.5",
    },
    // The ceiling here is set by fit, not taste: eight digits and three colons
    // have to stay on one line inside the section's px-14 gutters. At 9rem the
    // row needs roughly 870px of the ~1150px a 1280px viewport leaves, and the
    // 11vw term keeps it inside the gutters all the way down to mobile.
    "2xl": {
      digits:
        "font-sans font-medium leading-[0.95] tracking-[-0.035em] text-[clamp(2.25rem,11vw,9rem)] tabular-nums",
      separator: "font-sans font-medium text-[clamp(2.25rem,11vw,9rem)]",
      gap: "gap-3 sm:gap-6",
      unit: "type-label !tracking-[0.14em] mt-4",
    },
  } as const;
  const scale = SIZES[size];

  const numberClass = scale.digits;
  // The colons do the dividing, so the gap only has to keep glyphs apart.
  const gapClass = scale.gap;
  // Sized to match the digits, but NOT metric-matched to them: NumberFlow's
  // shadow CSS forces line-height:1 on its own host and insets the digits with
  // vertical padding for its mask, so any leading we set here would align to
  // the wrong thing. The row uses items-baseline instead and lets the browser
  // line up the real text baselines. leading-none keeps this box tight so it
  // contributes no asymmetry of its own.
  const separatorClass = `${scale.separator} leading-none ${separatorTone} select-none`;
  const unitClass = `${scale.unit} ${unitTone}`;

  const slots: { value: number; unit: string; pad: boolean }[] = [
    { value: parts.days, unit: "days", pad: false },
    { value: parts.hours, unit: "hrs", pad: true },
    { value: parts.minutes, unit: "min", pad: true },
    { value: parts.seconds, unit: "sec", pad: true },
  ];

  return (
    <div>
      <div className={`flex items-baseline ${gapClass} ${rowAlign}`}>
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
      <p
        className={`mt-4 type-label !tracking-[0.12em] leading-[1.5] ${stateTone} ${textAlign}`}
      >
        {state === "upcoming" ? labels.upcoming : labels.open}
      </p>
    </div>
  );
}
