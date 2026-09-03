"use client";

import { palette } from "@/components/charts/trilemma";

/* Where a ward's candidates landed on one question, and where you did.
 *
 * FORM
 *   A dot per candidate, filed on the option they picked, with your own answer
 *   marked in the same column. Not the trilemma dial the ward pages use, and
 *   for a reason: a dial encodes shares, and a ward has two to six candidates
 *   who answered. "40%" of five people is a statistic with nothing behind it,
 *   the ring at half the field marks a line no one can be on, and — worse —
 *   the dial can only pick out one position, so with several candidates the
 *   people being compared never appeared in the chart at all. They were names
 *   in a list beside it.
 *
 *   Dots do not have that problem. Two candidates read as two dots, six read
 *   as six, and every one of them is on the page as an object rather than as a
 *   contribution to a percentage. The count beside each row says "2 of 5",
 *   which is the honest form of the same number at this size.
 *
 *   Rows stay in the order the options were offered, including the ones nobody
 *   picked: an empty row is the finding that a position went unclaimed, and
 *   dropping it would hide that.
 *
 * COLOUR
 *   The chart palette's corner hues, by option position — the same colours the
 *   ward pages give the same options, so a reader moving between the two pages
 *   reads one system.
 *
 *   On a three-way question the rule down the left of each row takes that
 *   option's hue as well, which is what ties these rows to the dial a reader
 *   just saw on a ward page: first option, same colour, both places. The
 *   ordered questions keep a neutral rule — their options are points on a
 *   scale, and coning them in three unrelated hues would say they are rivals.
 *
 *   Your own row is marked by the badge and by the weight of its type. Not by
 *   the rule: the rules are one thickness down the list, so they read as a set
 *   of option colours rather than as one row shouting.
 */

/** One candidate on one option: who, and whatever they said about it. */
export type DotPlotCandidate = {
  /** as it should print — the surname, on both surfaces that use this */
  name: string;
  /** the note they left on this question, where they left one */
  note?: string | null;
  /** their own wording, where their answer matched no option */
  answer?: string | null;
};

export type DotPlotRow = {
  option: string;
  detail?: string | null;
  /** the candidates who picked this option, in the order they should print */
  candidates: DotPlotCandidate[];
};

export function CandidateDotPlot({
  rows,
  yourChoice,
  fieldSize,
  unplaced,
  colorRules = false,
}: {
  rows: DotPlotRow[];
  /** index of your own pick, or null if you skipped it */
  yourChoice: number | null;
  /** the ward's candidates — the denominator, printed rather than divided */
  fieldSize: number;
  /** candidates in none of the rows: their own words, or no answer at all */
  unplaced: DotPlotCandidate[];
  /**
   * Give each row's rule its option's chart hue. On for the three-way
   * questions, whose dial on the ward pages colours the same options the same
   * way; off for the ordered ones, which are a scale rather than three rivals.
   */
  colorRules?: boolean;
}) {
  const colors = palette(rows.length);

  return (
    <div className="grid gap-2.5">
      <ul className="grid list-none gap-2.5 m-0 p-0">
        {rows.map((row, i) => {
          const yours = i === yourChoice;
          return (
            <li
              key={row.option}
              className={`grid gap-1.5 border-l-2 pl-3 ${
                colorRules
                  ? ""
                  : yours
                    ? "border-dark"
                    : "border-border-light"
              }`}
              style={colorRules ? { borderColor: colors[i] } : undefined}
            >
              <div className="flex items-baseline gap-3">
                <span
                  className={`flex-1 font-serif text-[1rem] leading-[1.35] text-pretty ${
                    yours ? "text-dark" : "text-text-secondary"
                  }`}
                >
                  {row.option}
                  {row.detail && (
                    <span className="text-text-secondary">: {row.detail}</span>
                  )}
                  {yours && (
                    <span className="type-label-sm !text-[10px] !tracking-[0.12em] ml-2 whitespace-nowrap border border-dark px-1.5 py-0.5 align-[2px] text-dark">
                      Your answer
                    </span>
                  )}
                </span>
                <span className="type-caption flex-none tabular-nums text-text-secondary">
                  {row.candidates.length} of {fieldSize}
                </span>
              </div>

              {/* The candidates themselves: a dot each, then their names. The
                  dots carry the magnitude at a glance and the names say who,
                  which is the question a reader actually came with. */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="flex flex-none items-center gap-1">
                  {row.candidates.map((candidate) => (
                    <span
                      key={candidate.name}
                      className="size-2.5 rounded-full"
                      style={{ background: colors[i] }}
                      aria-hidden="true"
                    />
                  ))}
                </span>
                {row.candidates.length > 0 ? (
                  <span className="type-caption text-text-secondary">
                    {row.candidates.map((c) => c.name).join(", ")}
                  </span>
                ) : (
                  <span className="type-caption text-text-muted">
                    No candidate picked this
                  </span>
                )}
              </div>

              {/* What they wrote about it, under the option they picked and in
                  the open. A candidate who took the trouble to explain their
                  answer has left the most useful thing on the page, and a note
                  filed behind a disclosure is a note nobody reads. Kept to the
                  caption size so a row with three of them is still a row. */}
              {row.candidates.some((candidate) => candidate.note) && (
                <ul className="grid list-none gap-1 m-0 p-0">
                  {row.candidates
                    .filter((candidate) => candidate.note)
                    .map((candidate) => (
                      <li key={candidate.name}>
                        <CandidateNote candidate={candidate} />
                      </li>
                    ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      {/* On no option, so on no row — but most of them did answer, and what
          they wrote is the whole of what they said on this question. */}
      {unplaced.length > 0 && (
        <div className="grid gap-1.5 border-t border-border-light pt-2.5">
          <p className="type-caption text-text-muted text-pretty">
            Answered in their own words or not at all:{" "}
            {unplaced.map((candidate) => candidate.name).join(", ")}.
          </p>
          {unplaced
            .filter((candidate) => candidate.answer || candidate.note)
            .map((candidate) => (
              <CandidateNote key={candidate.name} candidate={candidate} />
            ))}
        </div>
      )}
    </div>
  );
}

/* One candidate's own words: the answer they wrote where none of the options
 * fit, and the note they left. The name leads it, so a reader scanning a
 * column of notes finds the candidate they care about without counting dots
 * back to the list above. */
function CandidateNote({ candidate }: { candidate: DotPlotCandidate }) {
  return (
    <p className="type-caption text-text-secondary text-pretty">
      <span className="font-sans font-medium text-dark">{candidate.name}</span>
      {candidate.answer && (
        <span className="font-serif italic">
          {" "}
          &ldquo;{candidate.answer}&rdquo;
        </span>
      )}
      {candidate.note && (
        <span className="font-serif italic"> {candidate.note}</span>
      )}
    </p>
  );
}
