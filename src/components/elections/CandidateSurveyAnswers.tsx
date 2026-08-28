"use client";

import { ChevronDown } from "lucide-react";

import {
  MUTED,
  OptionBar,
  TOKENS,
  TrilemmaDial,
  layoutDial,
  palette,
  type AxisConfig,
  type Triple,
} from "@/components/charts/trilemma";
import { AnswerOptionList } from "./AnswerOptionList";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type {
  CandidateAnswer,
  CandidateAnswers,
} from "@/lib/elections/candidate-answers";

/* What one candidate told the questionnaire, on their roster card.
 *
 * FORM
 *   Most of the questionnaire is a three-way choice between competing
 *   alternatives, and those get a dial: a circle in equal thirds, one wedge
 *   per option, reaching out as far as the number of candidates who picked it.
 *   The wedge this candidate chose carries its colour and the rest go neutral,
 *   so the answer reads as a silhouette — where they landed, and whether the
 *   field landed with them.
 *
 *   The five direct questions are not that shape. "Yes / Yes, with conditions
 *   / No" is ordered, and a dial would put those three at 120° from each other
 *   as though they were rival options rather than points on a scale. They get
 *   a segmented bar, which keeps the order and shows the split. So do the two
 *   four-option questions, which cannot be a trilemma at all.
 *
 *   Every chart on the card shares one value scale (`fieldSize`), so a wedge
 *   that reaches the rim always means the same thing. Per-question scales
 *   would make every answer look unanimous.
 *
 *   The chart is the answer, so it is the biggest thing in the row and it
 *   carries its own key: the question sits above it as the row's heading, and
 *   each wedge is direct-labelled with the option's name and the number of
 *   candidates who picked it. A shape with the meaning parked in a column
 *   beside it is a decoration; a shape that names its own thirds is the answer.
 *
 *   Beside each chart the options are listed as they were offered, in full
 *   wording with their expansions, each with a glyph of its own wedge so the
 *   list reads straight onto the dial. Counts are left to the chart, which
 *   prints them at the rim — the list carries what the chart cannot fit.
 *
 *   Expanded by default. The answers are the reason to look a candidate up;
 *   hiding them behind a click made the card a promise rather than an answer.
 *   Still collapsible, because a ward with a dozen candidates is a long page.
 *
 * COLOUR
 *   The chart palette's own corner hues, which is what makes the option
 *   position legible: the first option is the same colour on all 32 questions,
 *   so "they picked the first one again" is visible without reading. Safe here
 *   in a way it is not in the survey's alignment view, which spends pine and
 *   copper on agree/differ and so has to stay two-tone.
 */

export function CandidateSurveyAnswers({
  answers,
  candidateName,
}: {
  answers: CandidateAnswers;
  candidateName: string;
}) {
  const radius = sharedRadius(answers);

  return (
    <Collapsible defaultOpen className="mt-5 border-t border-border-light pt-4">
      <CollapsibleTrigger className="group type-label-sm !tracking-[0.1em] flex items-center gap-2 text-text-secondary transition-colors hover:text-accent">
        <ChevronDown
          className="size-3.5 transition-transform group-data-[panel-open]:rotate-180"
          aria-hidden="true"
        />
        Survey answers ({answers.answered})
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="grid gap-11 pt-6 pb-1">
          {answers.groups.map((group) => (
            <section key={group.stepId} className="grid gap-5">
              {/* The questionnaire's own sections, and the only landmarks in a
                  card that runs to thirty-odd answers. They take the house
                  section rule — a heavy line and a real heading — rather than
                  the faint eyebrow they had, which read as a caption on the
                  answer above it rather than as the start of something. */}
              <h4 className="border-t-2 border-dark pt-3 font-sans font-medium leading-[1.15] tracking-[-0.025em] text-[clamp(1.3rem,2vw,1.6rem)] text-dark">
                {group.stepTitle}
              </h4>

              {/* The section rule already opens the block, so the first
                  answer's own hairline would only stack under it. */}
              <div className="grid gap-4 [&>div:first-child]:border-t-0 [&>div:first-child]:pt-0">
                {group.answers.map((answer) => (
                  <Answer
                    key={answer.questionId}
                    answer={answer}
                    candidateName={candidateName}
                    fieldSize={answers.fieldSize}
                    radius={radius}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* Big enough for the option names to sit around the rim at a readable size,
 * and to stay the loudest thing in the row. The bar matches its width so the
 * two chart forms line up down a card of mixed questions. */
const CHART_SIZE = 360;

/**
 * How long an option name can be and still go around the rim.
 *
 * Most of the questionnaire names its options in a word or two — "Permission",
 * "Regulator and enabler" — and those belong on the chart. A handful put a
 * whole sentence in the label instead ("Decrease after inflation, with some
 * responsibilities and funding transferred to civilian services"), and there
 * is no size of dial that reads with three of those around it. Shortening
 * them here is not an option: these are the words the candidate was answering.
 * So those questions keep the older form — counts inside the wedges, wording
 * in the list — and the glyph beside each option is what ties the two.
 */
const RIM_LABEL_MAX = 40;

const isDial = (answer: CandidateAnswer) =>
  answer.options.length === 3 && !answer.ordinal;

const hasRimLabels = (answer: CandidateAnswer) =>
  isDial(answer) &&
  answer.options.every((option) => option.length <= RIM_LABEL_MAX);

const dialAxes = (answer: CandidateAnswer) =>
  answer.options.map((option, i) => ({
    key: String(i),
    label: option,
  })) as unknown as Triple<AxisConfig>;

/**
 * One outer radius for every dial on the card — the smallest any of them can
 * manage with its own option names around the rim.
 *
 * Without this each dial sizes itself to its own labels, so a question with
 * short options draws a bigger circle, and the shared value scale the whole
 * card rests on quietly stops being true: the same count would reach further
 * on one question than on another. The dials that cannot carry rim labels are
 * held to the same radius, so their circles still measure the same.
 */
function sharedRadius(answers: CandidateAnswers): number | undefined {
  const dials = answers.groups
    .flatMap((group) => group.answers)
    .filter(isDial);
  if (dials.length === 0) return undefined;

  // The labelled dials set the radius, being the constrained ones. A card
  // whose every dial is a sentence-labelled question has none, and then the
  // unlabelled fit is the only one there is.
  const rim = dials.filter(hasRimLabels);
  const labelled = rim.length > 0;

  return Math.min(
    ...(labelled ? rim : dials).map(
      (answer) =>
        layoutDial({
          width: CHART_SIZE,
          height: CHART_SIZE,
          padding: 4,
          axes: dialAxes(answer),
          showGoalLabels: labelled,
          showValues: labelled,
          hasLabel: false,
        }).R,
    ),
  );
}

function Answer({
  answer,
  candidateName,
  fieldSize,
  radius,
}: {
  answer: CandidateAnswer;
  candidateName: string;
  fieldSize: number;
  /** the card's shared outer radius, from `sharedRadius` */
  radius?: number;
}) {
  const full = palette(answer.options.length);
  // Their option keeps its colour; the rest recede. A candidate whose answer
  // matched no option highlights nothing, so the whole chart goes neutral —
  // the field's shape still shows, but none of it is claimed as theirs.
  const colors = answer.options.map((_, i) =>
    i === answer.choice ? full[i] : MUTED,
  );
  // Candidates whose answer landed in a bucket — not the whole field, since a
  // transcribed answer is in none of them.
  const counted = answer.counts.reduce((a, b) => a + b, 0);
  const dial = isDial(answer);
  const rim = hasRimLabels(answer);
  // Every option's count has to be readable, including the ones drawn in the
  // unchosen neutral — which is a fill, far too pale to set type in.
  const valueColors = answer.options.map((_, i) =>
    i === answer.choice ? full[i] : TOKENS.light.inkFaint,
  );

  return (
    <div className="grid gap-5 border-t border-border-light pt-5">
      {/* The question, above the chart rather than beside it: the chart is
          wider now, and a heading in its own column would have made the row a
          pair of narrow strips. */}
      <h5 className="font-sans text-[1.15rem] font-medium leading-[1.3] tracking-[-0.015em] text-dark text-pretty max-w-[54ch]">
        {answer.question}
      </h5>

      <div className="grid gap-6 sm:grid-cols-[360px_minmax(0,1fr)] sm:gap-9 sm:items-center">
        {/* The chart's own accessible name would be the dial's generic
            fallback, which names neither the question nor the candidate.
            Naming the group instead makes the svg inside presentational, so it
            is announced once and in the terms a reader needs. */}
        <div
          className="flex justify-center sm:justify-start"
          role="img"
          aria-label={
            counted > 0
              ? `${answer.question} — ${answer.options
                .map((option, i) => `${option} ${answer.counts[i]}`)
                .join(", ")}; ${candidateName} chose ${answer.answer}`
              : undefined
          }
        >
          {counted > 0 &&
            (dial ? (
              <TrilemmaDial
                axes={dialAxes(answer)}
                values={answer.counts as unknown as Triple<number>}
                domain={[0, Math.max(1, fieldSize)]}
                width={CHART_SIZE}
                /* The box closes up around the circle and whatever labels it
                   carries, rather than staying the square the width implies —
                   at a forced radius that square is mostly empty air, and on a
                   phone, where the svg scales to the column, the air scales
                   with it. The circle is the same size either way. */
                height={
                  radius === undefined
                    ? undefined
                    : rim
                      ? 2 * radius + 118
                      : 2 * radius + 40
                }
                radiusOverride={radius}
                padding={4}
                innerRadius={0.14}
                /* The options around the rim and their counts under them: the
                   chart says what each third is and how many went there,
                   without the reader crossing to the list to find out. */
                showGoalLabels={rim}
                valueMode={rim ? "outside" : "inside"}
                /* One quiet ring at half the field, so a wedge's reach can be
                   read as a share rather than only against its neighbours. */
                showRings
                ringStep={0.5}
                cornerColors={colors as Triple<string>}
                valueColors={valueColors as Triple<string>}
                interactive={false}
                paper="var(--color-bg)"
              />
            ) : (
              <OptionBar
                options={answer.options}
                counts={answer.counts}
                colors={colors}
                width={CHART_SIZE}
                height={34}
                showLabels
              />
            ))}
        </div>

        <div>
          {/* The options as they were offered, so the answer is read against
              the alternatives rather than on its own. Counts stay on the
              chart, which direct-labels every one of them. */}
          <AnswerOptionList
            options={answer.options}
            details={answer.details}
            counts={answer.counts}
            colors={colors}
            showCounts={false}
            marks={
              answer.choice === null
                ? []
                : [{ index: answer.choice, label: "Their answer" }]
            }
          />

          {/* An answer that matched no option is quoted, so it reads as the
              candidate's words rather than as a choice they were offered. */}
          {answer.verbatim && (
            <p className="type-body-sm text-dark text-pretty mt-3">
              &ldquo;{answer.answer}&rdquo;
              <span className="type-caption text-text-muted">
                {" "}
                — {candidateName}&rsquo;s wording, not one of the options
              </span>
            </p>
          )}

          {answer.explanation && (
            <div className="border-l-2 border-border-light pl-3 mt-3.5">
              <h6 className="type-label-sm text-text-muted mb-1">
                Candidate&rsquo;s note
              </h6>
              <p className="font-serif italic text-[1rem] leading-[1.45] text-text-secondary text-pretty">
                {answer.explanation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
