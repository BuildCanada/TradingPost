"use client";

import { Check, CircleHelp, Minus, X } from "lucide-react";

import type {
  Alignment,
  CandidateScore,
  QuestionRow,
  Verdict,
} from "@/lib/elections/alignment";

/* Alignment between one resident's answers and their ward's candidates.
 *
 * FORM
 *   Two encodings, because the data has two jobs. "How close is this candidate
 *   to me" is a magnitude, so it gets a ranked meter — one hue, direct-labelled
 *   with both the share and the count it is out of, since a bare 80% hides
 *   whether it came from 4 of 5 or 4 of 31. "Where do we differ" is a polarity
 *   per question, so it gets a status mark rather than a second chart.
 *
 * COLOUR
 *   pine-600 for agreement, copper-500 for difference, validated as a pair
 *   rather than eyeballed: ΔE 17.4 under tritanopia but only 6.0 under
 *   protanopia, which is inside the band that is legal ONLY while a secondary
 *   encoding carries the same meaning. That secondary encoding is the icon and
 *   the word in every single cell. If you ever strip the labels to tighten the
 *   layout, the colour stops being sufficient and a red-green colourblind
 *   reader loses the distinction entirely — re-step the pair first.
 *
 *   Note both hues come from ramps that .theme-election leaves alone. The
 *   auburn ramp is overridden to Toronto blue in this theme, so the "obvious"
 *   red for disagreement is blue here.
 *
 *   The meter is one hue for every candidate on purpose. It encodes magnitude,
 *   not identity, so a candidate's bar must not change colour with their rank.
 *
 * TEXT
 *   Values and names wear text tokens; only the icon and the bar carry colour.
 */

const VERDICT: Record<
  Verdict,
  { label: string; icon: typeof Check; tone: string }
> = {
  agree: { label: "Agrees", icon: Check, tone: "text-pine-600" },
  differ: { label: "Differs", icon: X, tone: "text-copper-500" },
  unclear: { label: "Unclear", icon: CircleHelp, tone: "text-charcoal-500" },
  unanswered: { label: "No answer", icon: Minus, tone: "text-text-muted" },
};

export default function AlignmentResults({
  alignment,
  wardLabel,
  isSampleData = false,
}: {
  alignment: Alignment;
  /** e.g. "Ward 9 — Davenport"; the ward is a postal-code guess, not a fact */
  wardLabel: string;
  isSampleData?: boolean;
}) {
  const { rows, scores } = alignment;
  if (scores.length === 0 || rows.length === 0) return null;

  // Group the detail by the step the questions came from, preserving order.
  const groups: { stepId: string; stepTitle: string; rows: QuestionRow[] }[] =
    [];
  for (const row of rows) {
    const last = groups.at(-1);
    if (last?.stepId === row.stepId) last.rows.push(row);
    else
      groups.push({ stepId: row.stepId, stepTitle: row.stepTitle, rows: [row] });
  }

  return (
    <section className="border-t border-border-light px-6 pt-14 pb-16 md:px-10">
      <div className="mb-7 h-0.5 w-10 bg-accent" />
      <h2 className="mb-3 font-sans font-medium leading-[1.05] tracking-[-0.015em] text-[clamp(1.5rem,3.5vw,2rem)] text-balance">
        How your answers compare
      </h2>
      <p className="type-body-sm mb-2 text-text-secondary text-pretty">
        Council candidates in {wardLabel} answered the same questions. Where you
        both picked an option, we compared them.
      </p>
      {/* The ward comes from a postal-code lookup, whose stored point is the
          centroid of a delivery area — a code on a ward line can resolve to the
          neighbour. Said plainly rather than presented as settled. */}
      <p className="type-caption mb-6 text-text-muted text-pretty">
        We placed you in {wardLabel} from your postal code. That is a best
        guess, not a certainty, for codes that straddle a ward boundary.
      </p>

      {isSampleData && (
        <p className="type-caption mb-8 border-l-2 border-copper-500 pl-4 text-text-secondary text-pretty">
          <strong className="font-sans font-medium">Sample data.</strong> These
          three candidates and their answers are invented, for building this
          view. No real candidate&apos;s positions are shown here.
        </p>
      )}

      {/* ── Ranked meters ──────────────────────────────────────── */}
      <ol className="mb-10 grid gap-5">
        {scores.map((score) => (
          <li key={score.candidateName}>
            <Meter score={score} />
          </li>
        ))}
      </ol>

      {/* ── Legend ─────────────────────────────────────────────── */}
      <div className="mb-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-border-light pt-5">
        {(Object.keys(VERDICT) as Verdict[]).map((verdict) => {
          const { label, icon: Icon, tone } = VERDICT[verdict];
          return (
            <span
              key={verdict}
              className="type-caption inline-flex items-center gap-1.5 text-text-secondary"
            >
              <Icon className={`size-4 shrink-0 ${tone}`} aria-hidden="true" />
              {label}
            </span>
          );
        })}
      </div>

      {/* ── Question by question ───────────────────────────────── */}
      <div className="grid gap-10">
        {groups.map((group) => (
          <div key={group.stepId} className="grid gap-6">
            <h3 className="type-label text-text-muted">{group.stepTitle}</h3>
            {group.rows.map((row) => (
              <QuestionBreakdown key={row.questionId} row={row} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── One candidate's headline share ─────────────────────────── */

function Meter({ score }: { score: CandidateScore }) {
  const percent = score.share === null ? null : Math.round(score.share * 100);

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="font-sans text-[19px] font-medium tracking-[-0.01em] text-dark">
          {score.candidateName}
        </span>
        <span className="font-sans text-[19px] font-medium tabular-nums text-dark">
          {percent === null ? "—" : `${percent}%`}
        </span>
      </div>

      {/* Decorative: the share and the count are both direct-labelled, so the
          bar repeats what the text already says. */}
      <div className="h-2 w-full bg-charcoal-200" aria-hidden="true">
        {percent !== null && percent > 0 && (
          <div
            className="h-2 rounded-r-[4px] bg-pine-600"
            style={{ width: `${percent}%` }}
          />
        )}
      </div>

      <p className="type-caption text-text-secondary">
        {score.compared === 0
          ? "No answers we could compare yet"
          : `Agrees on ${score.agreed} of ${score.compared} questions you both answered`}
        {score.unclear > 0 && ` · ${score.unclear} unclear`}
        {score.unanswered > 0 && ` · ${score.unanswered} unanswered`}
      </p>
    </div>
  );
}

/* ── One question, with every candidate's stance ─────────────── */

function QuestionBreakdown({ row }: { row: QuestionRow }) {
  return (
    <div className="grid gap-3">
      <p className="font-sans text-[17px] font-medium leading-[1.35] tracking-[-0.01em] text-dark text-pretty">
        {row.question}
      </p>

      <p className="type-caption text-text-secondary">
        Your answer:{" "}
        <span className="font-sans font-medium text-dark">{row.yourAnswer}</span>
      </p>

      <ul className="grid gap-2.5 border-l-2 border-border-light pl-4">
        {row.cells.map((cell) => {
          const { label, icon: Icon, tone } = VERDICT[cell.verdict];
          return (
            <li key={cell.candidateName} className="grid gap-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <Icon
                  className={`size-4 shrink-0 translate-y-0.5 ${tone}`}
                  aria-hidden="true"
                />
                <span className="type-body-sm text-dark">
                  {cell.candidateName}
                </span>
                {/* The word, not just the icon and the colour. */}
                <span className="type-caption text-text-muted">{label}</span>
                {cell.answer && cell.verdict !== "unclear" && (
                  <span className="type-caption text-text-secondary">
                    — {cell.answer}
                  </span>
                )}
              </div>

              {/* An answer that matched no option is shown verbatim and quoted,
                  so it reads as the candidate's words rather than as a choice
                  they were offered. */}
              {cell.verdict === "unclear" && cell.answer && (
                <p className="type-caption pl-6 text-text-secondary text-pretty">
                  &ldquo;{cell.answer}&rdquo;
                </p>
              )}

              {cell.explanation && (
                <p className="type-caption pl-6 text-text-muted text-pretty">
                  {cell.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
