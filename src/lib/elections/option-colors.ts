/* Option colours for the election surfaces that draw a question's field.
 *
 * Lifted out of FieldSentiment so /issues, the mayoral page and the ward cards
 * cannot drift: an option's colour has to be the same colour wherever a reader
 * meets it, or the second channel stops being readable across pages.
 *
 * The set is the one the palette validator passes on these surfaces — lake,
 * copper and the lighter pine step, which clear the colour-blind separation
 * floor as a trio where the darker pine did not: deep green beside copper is
 * ΔE 3.4 under protanopia, which is to say the same colour. The fourth is the
 * national brand's auburn, and it is written as a literal rather than as
 * `--color-auburn-800` on purpose: these pages run under `.theme-election`,
 * which repaints auburn to Toronto blue, and a fourth option that arrived as
 * blue would land on top of the first one.
 *
 * Everything else is a custom property, so the ramps stay theme-following.
 */
export const CATEGORICAL = [
  "var(--color-lake-700)",
  "var(--color-copper-600)",
  "var(--color-pine-400)",
  "#932f2f",
];

/* The Yes / Yes-with-conditions / No questions are not categories, they are a
 * scale with two poles — so they get the diverging treatment that shape calls
 * for: a hue at each end and a neutral in the middle, never a third hue. It
 * also gives the reader a second thing to scan on. On a page where every
 * question is blue-and-orange, the direct ones read as a different kind of
 * question at a glance, which is what they are. */
export const DIVERGING = [
  "var(--color-lake-700)",
  "var(--color-charcoal-300)",
  "var(--color-copper-600)",
];

/** An option nobody chose, and the hollow cells for candidates who skipped the
 *  question: quiet, and never a further colour a reader might try to read as a
 *  category. */
export const EMPTY = "color-mix(in oklab, var(--color-dark) 12%, transparent)";

/**
 * One colour per option, by position.
 *
 * Never runs short: a question with more options than the ramp has colours
 * takes the ramp's last colour for the overflow rather than `undefined`, so a
 * long option list degrades to a repeated hue instead of an unpainted cell.
 */
export function optionColors(count: number, ordinal: boolean): string[] {
  if (ordinal && count <= DIVERGING.length)
    /* A two-option scale takes the poles and skips the neutral. */
    return count === 2 ? [DIVERGING[0], DIVERGING[2]] : DIVERGING.slice(0, count);

  const ramp = CATEGORICAL;
  return Array.from(
    { length: Math.max(2, count) },
    (_, i) => ramp[Math.min(i, ramp.length - 1)],
  );
}
