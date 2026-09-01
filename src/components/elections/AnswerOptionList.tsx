import { WedgeGlyph } from "@/components/charts/trilemma";

/* The options a question offered, as a list beside its chart.
 *
 * Shared by the ward pages and the survey's alignment view so the two cannot
 * drift: an answer only means something read against the alternatives, and
 * both places have to put them in the same order, with the same counts, and
 * with the same glyph tying each row to its slice of the chart.
 *
 * The glyph is the chart's own wedge for that option, which is what lets the
 * list be read straight onto the dial or bar without a legend.
 */

export type OptionMark = {
  /** which option this marks */
  index: number;
  /** e.g. "Their answer", "Your answer" */
  label: string;
};

export function AnswerOptionList({
  options,
  details,
  counts,
  colors,
  marks = [],
  markColor,
  names,
  showCounts = true,
  valueFormat = String,
}: {
  options: string[];
  /** parallel to `options`; a null entry simply has no expansion */
  details?: (string | null)[];
  counts: number[];
  /** parallel to `options` — the chart's fill for each, muted where unchosen */
  colors: string[];
  /** badges pinned to particular options */
  marks?: OptionMark[];
  /**
   * Who picked each option, parallel to `options` — the comparison view lists
   * the ward's candidates under the option they chose, which is the whole
   * point of that page and the one thing a chart of shares cannot say.
   */
  names?: string[][];
  /** badge and count colour; defaults to each option's own chart colour */
  markColor?: string;
  /**
   * The count column. Off where the chart beside the list already direct-labels
   * every option with its count, which would otherwise print each number twice
   * a centimetre apart.
   */
  showCounts?: boolean;
  /**
   * How a count reads. Defaults to the number itself; pass `percentOf(total)`
   * to match a chart beside the list that prints shares — the same quantity
   * printed two ways a centimetre apart is worse than either.
   */
  valueFormat?: (n: number) => string;
}) {
  const marked = new Set(marks.map((mark) => mark.index));

  return (
    <ul className="grid gap-1.5 list-none m-0 p-0">
      {options.map((option, i) => {
        const tone = markColor ?? colors[i];
        const own = marks.filter((mark) => mark.index === i);

        return (
          /* An option nobody's badge is on still has to be readable: knowing
             what a candidate turned down is half of knowing what they picked.
             The distinction is carried by the type colour alone — charcoal
             against the chosen option's near-black — rather than by a colour
             AND a blanket opacity on top of it, which compounded into text
             around a third of the contrast of the line above it. */
          <li key={option} className="flex items-start gap-2.5">
            {/* The chart's own wedge for this option, muted where unchosen —
                which is where the fade now lives, on the swatch rather than on
                the words. */}
            <span className="mt-1 flex-none">
              <WedgeGlyph index={i} count={options.length} color={colors[i]} />
            </span>

            <span
              className={`flex-1 font-serif text-[1rem] leading-[1.35] text-pretty ${
                marked.has(i) ? "text-dark" : "text-text-secondary"
              }`}
            >
              {option}
              {details?.[i] && (
                <span className="text-text-secondary">: {details[i]}</span>
              )}
              {own.map((mark) => (
                <span
                  key={mark.label}
                  className="type-label-sm !text-[10px] !tracking-[0.12em] ml-2 whitespace-nowrap border px-1.5 py-0.5 align-[2px]"
                  style={{ color: tone, borderColor: tone }}
                >
                  {mark.label}
                </span>
              ))}
              {names?.[i]?.length ? (
                <span className="type-caption mt-0.5 block text-text-secondary">
                  {names[i].join(", ")}
                </span>
              ) : null}
            </span>

            {showCounts && (
              <span
                className="flex-none font-sans text-[1rem] font-medium tabular-nums"
                style={marked.has(i) ? { color: tone } : undefined}
              >
                {/* Charcoal rather than the faintest token: an unchosen
                    option's share is the comparison, not a footnote to it. */}
                <span className={marked.has(i) ? "" : "text-text-secondary"}>
                  {valueFormat(counts[i])}
                </span>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
