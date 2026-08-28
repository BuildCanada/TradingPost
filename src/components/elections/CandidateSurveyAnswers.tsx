"use client";

import { ChevronDown } from "lucide-react";

import {
  MUTED,
  OptionBar,
  TrilemmaDial,
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
 *   Beside each chart the options are listed as they were offered, each with
 *   the count of candidates who picked it and a glyph of its own wedge, so the
 *   list reads straight onto the dial. An answer means little alone: the point
 *   is where it sits among the alternatives and how many went there too.
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
        <div className="grid gap-9 pt-6 pb-1">
          {answers.groups.map((group) => (
            <div key={group.stepId} className="grid gap-4">
              <h4 className="type-label text-text-muted">{group.stepTitle}</h4>
              {group.answers.map((answer) => (
                <Answer
                  key={answer.questionId}
                  answer={answer}
                  candidateName={candidateName}
                  fieldSize={answers.fieldSize}
                />
              ))}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

const DIAL_SIZE = 200;

function Answer({
  answer,
  candidateName,
  fieldSize,
}: {
  answer: CandidateAnswer;
  candidateName: string;
  fieldSize: number;
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

  return (
    <div className="grid gap-5 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-7 sm:items-center border-t border-border-light pt-5">
      {/* The chart's own accessible name would be the dial's generic fallback,
          which names neither the question nor the candidate. Naming the group
          instead makes the svg inside presentational, so it is announced once
          and in the terms a reader needs. */}
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
          (answer.options.length === 3 && !answer.ordinal ? (
            <TrilemmaDial
              axes={
                answer.options.map((option, i) => ({
                  key: String(i),
                  label: option,
                })) as unknown as Triple<AxisConfig>
              }
              values={answer.counts as unknown as Triple<number>}
              domain={[0, Math.max(1, fieldSize)]}
              width={DIAL_SIZE}
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
              options={answer.options}
              counts={answer.counts}
              colors={colors}
              width={DIAL_SIZE}
              height={26}
            />
          ))}
      </div>

      <div>
        <h5 className="font-sans text-[1.15rem] font-medium leading-[1.3] tracking-[-0.015em] text-dark text-pretty mb-3">
          {answer.question}
        </h5>

        {/* The options as they were offered, so the answer is read against the
            alternatives rather than on its own. */}
        <AnswerOptionList
          options={answer.options}
          details={answer.details}
          counts={answer.counts}
          colors={colors}
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
          <p className="font-serif italic text-[1rem] leading-[1.45] text-text-secondary text-pretty border-l-2 border-border-light pl-3 mt-3.5">
            {answer.explanation}
          </p>
        )}
      </div>
    </div>
  );
}
