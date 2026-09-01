"use client";

import { useState, type CSSProperties } from "react";

import { palette } from "@/components/charts/trilemma";
import { lastName } from "@/lib/elections/names";
import type { Alignment, QuestionRow, Verdict } from "@/lib/elections/alignment";

/* One card per candidate, one square per question.
 *
 * Ported from the "Survey Agreement Chart" design and dressed in the election
 * theme: the design's own palette is the house palette by another name — its
 * ink, rule, linen and auburn are `--color-dark`, `--color-border-light`,
 * `--color-bg` and `--color-accent` — so the colours are taken from the tokens
 * rather than pasted as hex, and the same page in another region's theme comes
 * out in that region's colours. Its three typefaces map onto the two the site
 * ships: Inter Tight to the sans, Source Serif to the serif, and the mono
 * labels to the house's tracked uppercase caption, which is what mono was
 * standing in for.
 *
 * FORM
 *   The ranked list this replaces gave a share and a sentence — "agrees on 9
 *   of 14" — which says how much and never says where. A row of squares says
 *   both: the count is the filled ones, and which questions they are is the
 *   pattern. Two candidates on the same percentage look different here, and
 *   that difference is the thing a voter is actually choosing between.
 *
 *   Hovering a square names the question under the card rather than in a
 *   floating tip: a tooltip that covers its neighbours is no use for reading a
 *   row, and the space is reserved so the card does not jump.
 *
 *   The design has two states, same and different. The questionnaire has four
 *   — a candidate can answer in their own words, or not answer at all — and
 *   collapsing those into "different" would report silence as disagreement.
 *
 * COLOUR
 *   The option's own hue, from the same chart palette the trilemma dials and
 *   the grid's wedges use: first option, same colour, every surface. A black
 *   square said only "agreed"; a coloured one says which answer, so a
 *   disagreement is legible as a direction rather than as an absence — two
 *   candidates who both differ from you can differ from each other, and that
 *   is the whole of what a voter is choosing between.
 *
 *   Agreement is carried by weight rather than by hue: where they answered as
 *   you did the square is solid, and where they did not it is the same hue at
 *   a whisper of its strength. The gap between the two has to be enormous —
 *   the first thing the row says, from across the room and before any of the
 *   colours are read, is how much of it is filled in, and a disagreement at a
 *   third strength was still dark enough to count as a mark. Faint enough to
 *   register as an empty square, but not so faint that leaning in cannot tell
 *   which way they went.
 */

/* Their answer at a glance: the option's colour, solid where it is yours too.
   `unclear` and `unanswered` have no option to take a colour from — the first
   is prose that matched nothing, the second is silence — so both stay
   uncoloured, one ruled and one dashed. */
function squareStyle(
  verdict: Verdict,
  choice: number | null,
  optionCount: number,
): { className: string; style?: CSSProperties } {
  if (verdict === "unclear")
    return { className: "border border-border-light bg-border-light/40" };
  if (verdict === "unanswered" || choice === null)
    return { className: "border border-dashed border-border-light" };

  return {
    className: "",
    style: {
      background: palette(optionCount)[choice],
      opacity: verdict === "agree" ? 1 : 0.12,
    },
  };
}

const VERDICT_WORD: Record<Verdict, string> = {
  agree: "Same",
  differ: "Different",
  unclear: "Their own words",
  unanswered: "No answer",
};

type Hover = { candidate: string; index: number } | null;

export function AgreementChart({
  alignment,
  yourName = "You",
}: {
  alignment: Alignment;
  /** how the reader is named in the comparison line under a card */
  yourName?: string;
}) {
  const [hover, setHover] = useState<Hover>(null);
  const { rows, scores } = alignment;
  if (rows.length === 0 || scores.length === 0) return null;

  return (
    <div>
      <p className="type-caption mb-3 text-text-secondary text-pretty">
        Each square is one of the {rows.length} questions you both had in front
        of you, coloured by the option they picked — the same colours the
        charts give those options. Solid where they answered as you did, faded
        where they did not.
      </p>

      {/* Rules on the cards themselves rather than a gap over a coloured
          background. The background trick draws the grid's empty cells too:
          five candidates in a row of three left a grey panel sitting where a
          sixth card would have gone, which read as a card that had failed to
          load rather than as the end of the list. Each card carries its own
          right and bottom rule and the container closes the top and left, so
          an unfilled last row simply stops. */}
      <div className="grid border-t border-l border-border-light sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {scores.map((score) => (
          <CandidateCard
            key={score.candidateName}
            name={score.candidateName}
            agreed={score.agreed}
            compared={score.compared}
            share={score.share}
            rows={rows}
            yourName={yourName}
            hover={hover?.candidate === score.candidateName ? hover.index : null}
            onHover={(index) =>
              setHover(
                index === null
                  ? null
                  : { candidate: score.candidateName, index },
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

function CandidateCard({
  name,
  agreed,
  compared,
  share,
  rows,
  yourName,
  hover,
  onHover,
}: {
  name: string;
  agreed: number;
  compared: number;
  share: number | null;
  rows: QuestionRow[];
  yourName: string;
  /** index of the square under the pointer, within `rows` */
  hover: number | null;
  onHover: (index: number | null) => void;
}) {
  const cells = rows.map(
    (row) =>
      row.cells.find((cell) => cell.candidateName === name) ?? {
        candidateName: name,
        verdict: "unanswered" as Verdict,
        answer: undefined,
        choice: null,
      },
  );

  const held = hover === null ? null : { row: rows[hover], cell: cells[hover] };

  return (
    <div
      className="grid content-start border-r border-b border-border-light bg-bg p-4"
      onMouseLeave={() => onHover(null)}
    >
      <h4 className="font-sans font-medium leading-[1.15] tracking-[-0.02em] text-[1.1rem] text-dark text-balance">
        {name}
      </h4>

      {/* The count large, the share small: the count is the honest figure at
          this size — "9 of 14" is a fact about fourteen questions, where a
          percentage of fourteen invites being read as a poll result. */}
      <div className="mt-3 flex items-end gap-2.5">
        <span className="font-sans font-medium leading-[0.8] tracking-[-0.04em] text-[2.1rem] tabular-nums text-dark">
          {agreed}
        </span>
        <span className="font-serif text-[0.9rem] leading-[1.2] pb-0.5 text-text-secondary">
          of {compared} answers
          <br />
          the same
        </span>
      </div>
      <p className="type-label-sm mt-1.5 text-accent">
        {share === null
          ? "Nothing to compare yet"
          : `${Math.round(share * 100)}% agreement`}
      </p>

      {/* One square per question, in the order the questionnaire asked them,
          so the same column is the same question on every card. */}
      <div className="mt-3.5 grid grid-cols-[repeat(17,1fr)] gap-[3px]">
        {cells.map((cell, i) => {
          const square = squareStyle(
            cell.verdict,
            cell.choice,
            rows[i].options.length,
          );
          return (
            <span
              key={rows[i].questionId}
              onMouseEnter={() => onHover(i)}
              title={`${rows[i].question} — ${VERDICT_WORD[cell.verdict]}`}
              style={square.style}
              className={`aspect-square transition-[outline-color] duration-150 hover:outline hover:outline-2 hover:outline-offset-2 hover:outline-accent ${square.className}`}
            />
          );
        })}
      </div>

      {/* Reserved, so a card does not resize as the pointer crosses it. */}
      <div className="mt-3.5 min-h-[4.75rem] border-t border-border-light pt-2.5">
        {held ? (
          <>
            <p className="type-caption text-text-muted">
              Q{(hover ?? 0) + 1} · {held.row.stepTitle} ·{" "}
              {VERDICT_WORD[held.cell.verdict]}
            </p>
            <p className="mt-1 font-serif text-[0.88rem] leading-[1.3] text-dark text-pretty">
              {held.row.question}
            </p>
            <p className="type-caption mt-1.5 text-accent text-pretty">
              {yourName}: {held.row.yourAnswer} / {lastName(name)}:{" "}
              {held.cell.answer ?? "—"}
            </p>
          </>
        ) : (
          <p className="type-caption text-text-muted">
            Hover a square for the question
          </p>
        )}
      </div>
    </div>
  );
}
