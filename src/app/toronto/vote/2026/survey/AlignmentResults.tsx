"use client";

import { Check, CircleHelp, Minus, X } from "lucide-react";

import {
  MUTED,
  OptionBar,
  TOKENS,
  TrilemmaDial,
  type AxisConfig,
  type Triple,
} from "@/components/charts/trilemma";
import { AnswerOptionList } from "@/components/elections/AnswerOptionList";
import { isYesNoScale } from "@/lib/elections/alignment";
import type {
  Alignment,
  CandidateCell,
  CandidateScore,
  QuestionRow,
  Verdict,
} from "@/lib/elections/alignment";

/* Alignment between one resident's answers and their ward's candidates.
 *
 * FORM
 *   Candidate-first: one card per candidate, ranked, carrying that candidate's
 *   own answers. A reader arrives wanting to know who to vote for, and the
 *   question-first arrangement made them assemble each candidate themselves
 *   from a column of rows.
 *
 *   Three encodings, because the data has three jobs. "How close is this
 *   candidate to me" is a magnitude, so it gets a meter — one hue,
 *   direct-labelled with both the share and the count it is out of, since a
 *   bare 80% hides whether it came from 4 of 5 or 4 of 31. "Where do we
 *   differ" is a polarity per question, so it gets a status mark rather than a
 *   second chart, with both picks badged on the option list beneath it. "Is this candidate with the field or alone on this question"
 *   is a part-to-whole, so it gets a chart of how the ward's candidates split
 *   with this one's share picked out — a dial where three options compete on
 *   equal terms, a segmented bar where they do not: a yes/no scale is ordered,
 *   and a dial would draw it as a three-way contest.
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
 *   The dials and bars are deliberately NOT on the chart palette they ship
 *   with. That palette's second corner is pine-600 exactly, and its warm
 *   corner is close to copper-500 — the two hues that mean "agrees" and
 *   "differs" three lines further down the same card. An option coloured pine
 *   would read as agreement it does not encode. So they stay two-tone: ink for
 *   the option this candidate chose, warm neutral for the rest, and the
 *   verdict hues reserved for the verdict. The ward pages carry no verdict, so
 *   they use the full corner palette instead.
 *
 * TEXT
 *   Values and names wear text tokens; only the icon and the meter carry colour.
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

/** Ink for the chosen segment; every other option recedes to the warm neutral. */
const CHOSEN = TOKENS.light.ink;

type Group = { stepId: string; stepTitle: string; rows: QuestionRow[] };

export default function AlignmentResults({
  alignment,
  wardLabel,
}: {
  alignment: Alignment;
  /** e.g. "Ward 9 — Davenport"; the ward is a postal-code guess, not a fact */
  wardLabel: string;
}) {
  const { rows, scores } = alignment;
  if (scores.length === 0 || rows.length === 0) return null;

  // Group the detail by the step the questions came from, preserving order.
  const groups: Group[] = [];
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

      {/* ── Legend ─────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-border-light pt-5">
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

      {/* ── One card per candidate, most aligned first ─────────── */}
      <ol className="grid gap-8">
        {scores.map((score) => (
          <li key={score.candidateName}>
            <CandidateAnswerCard score={score} groups={groups} />
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ── One candidate: their share, then their answers ──────────── */

function CandidateAnswerCard({
  score,
  groups,
}: {
  score: CandidateScore;
  groups: Group[];
}) {
  const percent = score.share === null ? null : Math.round(score.share * 100);

  return (
    <article className="border border-border-light bg-bg">
      <header className="grid gap-2 border-b border-border-light px-5 py-5 md:px-7">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="font-sans text-[19px] font-medium tracking-[-0.01em] text-dark">
            {score.candidateName}
          </h3>
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
      </header>

      <div className="grid gap-9 px-5 py-6 md:px-7">
        {groups.map((group) => (
          <div key={group.stepId} className="grid gap-4">
            <h4 className="type-label text-text-muted">{group.stepTitle}</h4>
            {group.rows.map((row) => {
              const cell = row.cells.find(
                (c) => c.candidateName === score.candidateName,
              );
              return cell ? (
                <AnswerRow key={row.questionId} row={row} cell={cell} />
              ) : null;
            })}
          </div>
        ))}
      </div>
    </article>
  );
}

/* ── One question, from this candidate's side ────────────────── */

function AnswerRow({ row, cell }: { row: QuestionRow; cell: CandidateCell }) {
  const { label, icon: Icon, tone } = VERDICT[cell.verdict];

  // Ink for what they chose, neutral for what they did not. A candidate with
  // no usable answer gets an all-neutral chart: the field's split still shows,
  // but nothing on it is claimed as theirs.
  const colors = row.options.map((_, i) =>
    i === cell.choice ? CHOSEN : MUTED,
  );
  // Candidates whose answer landed in a bucket. `unclear` and `unanswered`
  // are in none, so this is not the size of the field.
  const counted = row.counts.reduce((a, b) => a + b, 0);

  // Both picks are badged on the list, so a reader sees where the two of you
  // sat without matching a name against a column.
  const marks = [
    ...(cell.choice !== null
      ? [{ index: cell.choice, label: "Their answer" }]
      : []),
    ...(row.yourChoice !== null
      ? [{ index: row.yourChoice, label: "Your answer" }]
      : []),
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-6 sm:items-center border-t border-border-light pt-5">
      <div
        className="flex justify-center sm:justify-start"
        role="img"
        aria-label={
          counted > 0
            ? `${row.question} — ${row.options
                .map((option, i) => `${option} ${row.counts[i]}`)
                .join(", ")}; ${cell.candidateName} chose ${
                cell.answer ?? "nothing"
              }, you chose ${row.yourAnswer}`
            : undefined
        }
      >
        {counted > 0 &&
          (row.options.length === 3 && !isYesNoScale(row.options) ? (
            <TrilemmaDial
              axes={
                row.options.map((option, i) => ({
                  key: String(i),
                  label: option,
                })) as unknown as Triple<AxisConfig>
              }
              values={row.counts as unknown as Triple<number>}
              domain={[0, Math.max(1, row.cells.length)]}
              width={168}
              padding={4}
              innerRadius={0.14}
              showGoalLabels={false}
              showRings={false}
              valueMode="inside"
              cornerColors={colors as Triple<string>}
              interactive={false}
              paper="var(--color-bg)"
            />
          ) : (
            <OptionBar
              options={row.options}
              counts={row.counts}
              colors={colors}
              width={168}
              height={26}
            />
          ))}
      </div>

      <div>
        <h5 className="font-sans text-[1.15rem] font-medium leading-[1.3] tracking-[-0.015em] text-dark text-pretty mb-2">
          {row.question}
        </h5>

        {/* The word, not just the icon and the colour. */}
        <p className="flex items-center gap-1.5 mb-3">
          <Icon className={`size-4 shrink-0 ${tone}`} aria-hidden="true" />
          <span className="type-caption text-text-secondary">{label}</span>
        </p>

        <AnswerOptionList
          options={row.options}
          details={row.details}
          counts={row.counts}
          colors={colors}
          marks={marks}
          markColor={CHOSEN}
        />

        {/* An answer that matched no option is shown verbatim and quoted, so it
            reads as the candidate's words rather than as a choice they were
            offered. */}
        {cell.verdict === "unclear" && cell.answer && (
          <p className="type-body-sm text-dark text-pretty mt-3">
            &ldquo;{cell.answer}&rdquo;
            <span className="type-caption text-text-muted">
              {" "}
              — {cell.candidateName}&rsquo;s wording, not one of the options
            </span>
          </p>
        )}

        {cell.explanation && (
          <p className="font-serif italic text-[1rem] leading-[1.45] text-text-secondary text-pretty border-l-2 border-border-light pl-3 mt-3.5">
            {cell.explanation}
          </p>
        )}
      </div>
    </div>
  );
}
