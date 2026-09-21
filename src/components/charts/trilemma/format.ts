/**
 * Value labels as a share of the field rather than a raw count.
 *
 * "12" only means something to a reader who knows how many candidates there
 * are; "34%" carries its own denominator. The total handed in is the same one
 * the chart is scaled against — the dial's domain maximum — so the number a
 * wedge prints and the distance it reaches say the same thing. Formatting
 * against some other total would quietly put the label and the geometry into
 * disagreement.
 *
 * Whole percents: these are fields of a few dozen candidates, where a decimal
 * place would be precision the sample does not have.
 */
export const percentOf = (total: number) => (n: number) =>
  `${Math.round((n / Math.max(1, total)) * 100)}%`
