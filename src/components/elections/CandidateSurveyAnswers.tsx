"use client";

import { ChevronDown } from "lucide-react";

import { WedgeGlyph, percentOf } from "@/components/charts/trilemma";
import { AnswerChart, optionColors, sharedRadius } from "./AnswerChart";
import { AnswerOptionList } from "./AnswerOptionList";
import { firstName, lastName, possessive } from "@/lib/elections/names";
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
 *   The answer itself is written out under the question, before the chart:
 *   what they picked, in the words they were offered, with that option's wedge
 *   glyph beside it. The chart is what the field did — reading a single
 *   candidate's answer off it means hunting the coloured third and then its
 *   rim label, which is a step too many between a question and its answer.
 *
 *   The chart stays the biggest thing in the row all the same, and it carries
 *   its own key: the question sits above it as the row's heading, and
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
  const radius = sharedRadius(answers.groups.flatMap((group) => group.answers));

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

              {/* Two answers to a row where there is width for it: stacked
                  chart-over-options, each answer is a tall narrow block, and
                  one per row left a column of white space beside every dial. */}
              <div className="grid gap-4 lg:grid-cols-2">
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
  const { full, colors } = optionColors(answer.options.length, answer.choice);
  // Candidates whose answer landed in a bucket — not the whole field, since a
  // transcribed answer is in none of them.
  const counted = answer.counts.reduce((a, b) => a + b, 0);
  // Shares of the field, not head counts: the reader has no idea whether nine
  // is most of the ward or a corner of it, and every chart on the card is
  // scaled against the same field, so the same denominator is already implied
  // by the geometry.
  const share = percentOf(fieldSize);

  return (
    /* Boxed, and a full-height column rather than a content-height block.
       Two answers share a row, and a hairline above each was enough to
       separate a single column but not a grid: with a neighbour alongside,
       a rule at the top of both reads as one line under the pair, and where
       one answer runs longer than the other there was nothing to say which
       question the leftover text belonged to. A box closes each one.

       Stretched to the row, with the chart pushed to the bottom, every answer
       frames the same way — which is what makes any one of them croppable on
       its own. */
    <div className="flex h-full flex-col gap-5 border border-border-light p-5">
      {/* The question, above the chart rather than beside it: the chart is
          wider now, and a heading in its own column would have made the row a
          pair of narrow strips. */}
      <div className="grid gap-2">
        <h5 className="font-sans text-[1.15rem] font-medium leading-[1.3] tracking-[-0.015em] text-dark text-pretty max-w-[54ch]">
          {answer.question}
        </h5>

        {/* What they said, in words, directly under the question and ahead of
            the chart. The chart shows where the field went and which third is
            theirs, but reading it means finding the coloured wedge and then
            its rim label — a step between the question and its answer. This
            says it outright; the chart then answers "and who else?".

            The glyph is the chart's own wedge for that option, so the eye can
            carry the colour from this line down onto the dial. */}
        <p className="flex items-baseline gap-2.5">
          {answer.choice !== null && (
            <span className="flex-none self-start mt-[5px]">
              <WedgeGlyph
                index={answer.choice}
                count={answer.options.length}
                color={full[answer.choice]}
              />
            </span>
          )}
          <span className="font-sans text-[1.05rem] font-medium leading-[1.35] text-dark text-pretty">
            {answer.verbatim && <>&ldquo;</>}
            {answer.answer}
            {answer.verbatim && (
              <>
                &rdquo;
                <span className="type-caption text-text-muted">
                  {" "}
                  &mdash; {possessive(firstName(candidateName))} wording, not
                  one of the options
                </span>
              </>
            )}
          </span>
        </p>
      </div>

      {/* Options then chart, stacked rather than side by side — at half a
          card's width the two columns were a pair of strips too narrow for
          either. The chart goes last because it is the slowest thing to read:
          the question, the answer in words, and the alternatives it was chosen
          from are the whole story for most readers, and the field's shape is
          what you stay for. Ending the row on it also puts every dial on a
          consistent line above the next question's heading. */}
      <div className="flex flex-1 flex-col gap-3.5">
        <div>
          {/* The options as they were offered, so the answer is read against
              the alternatives rather than on its own. Shares stay on the
              chart below, which direct-labels every one of them. */}
          <AnswerOptionList
            options={answer.options}
            details={answer.details}
            counts={answer.counts}
            colors={colors}
            showCounts={false}
            marks={
              answer.choice === null
                ? []
                : [
                  {
                    index: answer.choice,
                    // Named rather than "their answer": on a page of stacked
                    // candidate cards the pronoun only means something if you
                    // still know whose card you are on.
                    label: `${possessive(candidateName)} response`,
                  },
                ]
            }
          />

          {answer.explanation && (
            <div className="border-l-2 border-border-light pl-3 mt-3.5">
              <h6 className="type-label-sm text-text-muted mb-1">
                {possessive(firstName(candidateName))} note
              </h6>
              <p className="font-serif italic text-[1rem] leading-[1.45] text-text-secondary text-pretty">
                {answer.explanation}
              </p>
            </div>
          )}
        </div>

        <AnswerChart
          shape={answer}
          counts={answer.counts}
          choice={answer.choice}
          fieldSize={fieldSize}
          radius={radius}
          ariaLabel={`${answer.question} — ${answer.options
            .map((option, i) => `${option} ${share(answer.counts[i])}`)
            .join(", ")}; ${candidateName} chose ${answer.answer}`}
        />

        {/* Whose chart this is, said under it. On a card of thirty-odd
            boxed answers — and in a screenshot of any one of them, cropped
            away from the card's header — the dial otherwise arrives with no
            owner: three coloured thirds and no statement of what the coloured
            one belongs to. */}
        {counted > 0 && (
          <p className="font-sans text-[0.95rem] font-medium leading-[1.3] tracking-[-0.005em] text-center text-dark text-pretty">
            {possessive(lastName(candidateName))} responses vs all other
            candidates
          </p>
        )}

      </div>
    </div>
  );
}

/**
 * What every chart on the page is counting, said once at the foot of it.
 *
 * This used to sit under each chart, where it was true but relentless: a ward
 * page carries a dozen candidates at thirty-odd answers each, so the same four
 * lines were set several hundred times, and a note repeated that often stops
 * being read at all. It is a property of the whole questionnaire — the same
 * field, the same denominator, on every chart — so it belongs where a source
 * note belongs, at the bottom, once.
 */
export function SurveyChartNote({ candidateCount }: { candidateCount: number }) {
  return (
    <p className="type-caption text-text-muted text-pretty max-w-[78ch]">
      <span className="text-text-secondary">Reading the charts.</span> Each
      third of a dial is one of the options, reaching further the more of this
      ward&rsquo;s candidates picked it; on the segmented bars each band is one
      option, as wide as the share that picked it. Counts are out of the{" "}
      {candidateCount} candidates in this ward who returned the
      questionnaire, not the whole ballot. A candidate who answered in their
      own words rather than picking an option is counted on no option, and is
      named under the question instead.
    </p>
  );
}
