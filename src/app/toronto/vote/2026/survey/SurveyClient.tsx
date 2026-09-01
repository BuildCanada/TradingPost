"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Select } from "@/components/ui/select";

import {
  alignToCandidates,
  wardKeyFromRegion,
} from "@/lib/elections/alignment";
import type { CandidateSurveyResponse } from "@/lib/elections/alignment";
import { DEFAULT_ELECTION_SLUG } from "@/lib/elections/registry";
import type { Survey, SurveyQuestion } from "@/lib/elections/survey";

import AlignmentResults, {
  type RaceComparison,
  type SurveyRosterCandidate,
} from "./AlignmentResults";
import { submitSurvey, type SurveySubmission } from "./submitSurvey";

export type SurveyAnswers = Record<string, string>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POSTAL_PATTERN = /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/;

const FIELD_CLASS =
  "w-full border border-border-light bg-white px-4 py-3.5 font-serif text-[17px] text-dark outline-none transition-colors focus:border-dark placeholder:text-text-muted";
const CHOICE_CLASS =
  "flex cursor-pointer items-center gap-3 border border-border-light bg-white px-4 py-3.5 text-[17px] transition-colors hover:border-dark has-checked:border-dark";
const RADIO_CLASS = "size-[17px] m-0 accent-accent";

/** Copy the CMS doesn't have to supply. Only the fallbacks live here — the
 *  survey's own meta wins whenever it sets a field. */
/* Used only when York Factory sends none of its own — the live title, intro
   and thank-you are CMS copy, and this is what shows if they are missing. */
const META_FALLBACK = {
  title: "Toronto priorities survey",
  intro:
    "Thirty questions on what the next council should do. Answer them and see which candidates on your ballot agree with you.",
  submitLabel: "Submit survey",
} as const;

/** Entrance delay for the nth element in a step, capped so a long step's last
 *  field doesn't sit blank waiting its turn. */
function stagger(index: number): CSSProperties {
  return { animationDelay: `${Math.min(index, 6) * 45}ms` };
}

/** Per-question error copy, or null when the answer passes. */
function errorFor(question: SurveyQuestion, value: string): string | null {
  const answered = value.trim().length > 0;

  if (question.required && !answered) {
    if (question.type === "radio") return "Choose one";
    if (question.type === "yesno") return "Choose yes or no";
    return "Required";
  }
  if (!answered) return null;

  if (question.type === "email" && !EMAIL_PATTERN.test(value)) {
    return "Enter a valid email";
  }
  if (question.id === "postal_code" && !POSTAL_PATTERN.test(value)) {
    return "Enter a valid postal code (e.g. M5V 2T6)";
  }
  return null;
}

/* ── Developer fill ───────────────────────────────────────────
 *
 * TEMPORARY. Delete this block, the button that calls it, and nothing else
 * when the results pages stop needing to be looked at.
 *
 * Reaching the comparison view by hand means answering thirty-odd questions,
 * and every change to that view has to be checked against a filled-in survey.
 * The button answers the whole questionnaire at random and drops the caller on
 * the last step, so submitting is one more click.
 *
 * Gated on the build, not on a flag: `process.env.NODE_ENV` is inlined at
 * build time, so in a production bundle the condition is `false` and the
 * button and this function are dropped entirely.
 */
const DEV_TOOLS = process.env.NODE_ENV !== "production";

/** A Toronto postal code that resolves to a ward, so the comparison renders. */
const DEV_POSTAL = "M6H 1A1";

function devFill(survey: Survey): SurveyAnswers {
  const filled: SurveyAnswers = {};

  for (const step of survey.steps) {
    for (const question of step.questions) {
      if (question.id === "postal_code") {
        filled[question.id] = DEV_POSTAL;
        continue;
      }
      if (question.options?.length) {
        // Random rather than always the first: a survey answered entirely down
        // the left-hand side agrees with nobody in a way that looks like a bug
        // in the alignment rather than what it is.
        const option =
          question.options[Math.floor(Math.random() * question.options.length)];
        filled[question.id] = option.value;
        continue;
      }
      if (question.type === "email") {
        filled[question.id] = "dev@example.com";
        continue;
      }
      filled[question.id] = "Developer fill";
    }
  }

  return filled;
}

export default function SurveyClient({
  survey,
  wardNames = {},
}: {
  survey: Survey;
  /** {"09": "Davenport"} — passed in from the server so the ward geometry,
   *  which is a large generated file, stays out of this bundle. */
  wardNames?: Record<string, string>;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submission, setSubmission] = useState<SurveySubmission | null>(null);

  // Everything about the shape of the form comes from the fetched survey, so a
  // question added in the CMS shows up here with no change to this component.
  const steps = survey.steps;
  const stepCount = steps.length;
  const meta = survey.meta;

  const isLastStep = step === stepCount - 1;
  const currentStep = steps[step];

  /* The comparison against the ward's candidates. Keyed on the ward the API
     actually recorded rather than one re-derived here, so the results a
     respondent reads are the results filed under their response.

     Null whenever there is nothing honest to show: no ward resolved from the
     postal code, or a ward whose candidates have not answered the
     questionnaire — which is most wards for most of the campaign. */
  const ward = wardKeyFromRegion(
    submission?.derivedRegion ?? submission?.region,
  );

  /* The ward's published candidate answers, fetched once the API has told us
     which ward the response was filed under. Not loaded with the page: the
     ward is not known until then, and pre-loading all 25 would ship every
     ward's answers to every visitor to use one ward's worth. */
  const [responses, setResponses] = useState<CandidateSurveyResponse[] | null>(
    null,
  );
  /* Everyone on the ward's ballot, which arrives with the answers. The
     comparison gives a column to every candidate, not only the ones who wrote
     back: that a candidate said nothing is as much a part of the comparison as
     what the others said. */
  const [roster, setRoster] = useState<SurveyRosterCandidate[]>([]);
  /* The mayoral field, which is on no ward and so arrives beside the ward's:
     a voter marks two ballots, and the comparison answers for both. */
  const [mayoral, setMayoral] = useState<{
    data: CandidateSurveyResponse[];
    roster: SurveyRosterCandidate[];
  }>({ data: [], roster: [] });

  useEffect(() => {
    if (!ward) return;
    let cancelled = false;

    fetch(
      `/api/elections/candidate-responses?election=${encodeURIComponent(
        DEFAULT_ELECTION_SLUG,
      )}&ward=${encodeURIComponent(ward)}`,
    )
      .then((res) => (res.ok ? res.json() : { data: [], roster: [] }))
      .then((body) => {
        if (cancelled) return;
        setResponses(body.data ?? []);
        setRoster(body.roster ?? []);
        setMayoral({
          data: body.mayoral?.data ?? [],
          roster: body.mayoral?.roster ?? [],
        });
      })
      // A comparison we could not load is simply not shown; the respondent
      // still has their own answers and the thank-you.
      .catch(() => {
        if (cancelled) return;
        setResponses([]);
        setRoster([]);
        setMayoral({ data: [], roster: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [ward]);

  /* One comparison per ballot, in the order a voter marks them. A race with
     no published answers is simply left out rather than printed empty. */
  const comparison = useMemo(() => {
    if (!ward || !responses) return null;
    if (responses.length === 0 && mayoral.data.length === 0) return null;

    const name = wardNames[ward];
    const wardLabel = name
      ? `Ward ${parseInt(ward, 10)} — ${name}`
      : `Ward ${parseInt(ward, 10)}`;

    const races: RaceComparison[] = [];
    if (mayoral.data.length > 0) {
      races.push({
        key: "mayor",
        label: "For mayor",
        alignment: alignToCandidates(survey, answers, mayoral.data),
        responses: mayoral.data,
        roster: mayoral.roster,
      });
    }
    if (responses.length > 0) {
      races.push({
        key: "council",
        label: wardLabel,
        alignment: alignToCandidates(survey, answers, responses),
        responses,
        roster,
      });
    }

    return { races, wardLabel };
  }, [ward, responses, roster, mayoral, survey, answers, wardNames]);

  const set = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    // Clear the error as soon as they start fixing it; it comes back on Next.
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const rest = { ...prev };
      delete rest[id];
      return rest;
    });
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  /** Validates the current step, surfacing every failing field at once. */
  const validateStep = (): boolean => {
    const found: Record<string, string> = {};
    for (const question of currentStep.questions) {
      // Optional fields still get format-checked once they're filled in.
      const message = errorFor(question, answers[question.id] ?? "");
      if (message) found[question.id] = message;
    }
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(stepCount - 1, s + 1));
    scrollTop();
  };

  const back = () => {
    setErrors({});
    setSubmitError(null);
    setStep((s) => Math.max(0, s - 1));
    scrollTop();
  };

  const submit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      setSubmission(await submitSurvey(survey, answers));
      setDone(true);
      scrollTop();
    } catch {
      // Answers stay on screen so they can just press submit again.
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /** Answer everything and jump to the end. Development builds only. */
  const fillForDev = () => {
    setAnswers(devFill(survey));
    setErrors({});
    setSubmitError(null);
    setStep(stepCount - 1);
    scrollTop();
  };

  return (
    <div className="theme-election bg-bg text-dark min-h-screen px-5 py-8 pb-20 2xl:px-8">
      {/* TEMPORARY developer affordance — see `devFill`. Dashed and labelled
          so it cannot be mistaken for part of the survey, and compiled out of
          production builds entirely. */}
      {DEV_TOOLS && !done && (
        <button
          type="button"
          onClick={fillForDev}
          className="type-label-sm fixed bottom-4 right-4 z-50 cursor-pointer border border-dashed border-dark bg-bg px-3 py-2 text-dark transition-colors hover:bg-linen-200"
        >
          Dev: fill survey
        </button>
      )}
      {/* The form is a column of questions and stays at a reading measure; the
          results are two comparison grids — a question a row, a candidate a
          column, and a mayoral field of fifty-odd. Held to the form's width
          they were strips a couple of columns wide with everything else behind
          a sideways drag, so the card opens up to the window once there is
          something to show in it. */}
      <div
        className={`mx-auto w-full overflow-x-clip border-2 border-dark bg-bg transition-[max-width] duration-500 ${done ? "max-w-[1720px]" : "max-w-[760px]"
          }`}
      >
        {/* ── Masthead ───────────────────────────────────────── */}
        {/* Its own band, ruled off from what follows. It had no bottom padding
            at all: the title sat on top of the progress bar, and the only
            thing between them was whatever top padding the next block
            happened to carry. The intro keeps a reading measure of its own —
            once the card widens to hold the results, a line of intro type set
            across seventeen hundred pixels is a line nobody finishes. */}
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5 border-b border-border-light px-6 pt-10 pb-8 md:px-10 md:pt-12 md:pb-9">
          {/* One masthead, saying whichever of the two things the page is
              currently for. Before the answers are in it introduces the
              survey; after, it is the heading of the comparison — which used
              to announce itself a second time, with its own accent rule, in a
              band directly under this one. */}
          <div>
            <h1 className="mb-3.5 font-sans font-medium leading-[1.03] tracking-[-0.02em] text-[clamp(2rem,5vw,2.875rem)] max-w-[18ch] text-balance">
              {done && comparison
                ? "How your answers compare"
                : META_FALLBACK.title}
            </h1>
            {done && comparison ? (
              <>
                {/* Two ballots, so two comparisons. A voter marks a councillor
                    and a mayor separately, and a page that answered only for
                    the ward would answer the smaller half of the question they
                    came with. */}
                <p className="type-lead max-w-[54ch] text-text-secondary text-pretty">
                  You vote twice: once for your councillor, once for mayor.
                  Candidates in both races answered the questions you just did.
                </p>
                {/* The ward is a postal-code lookup, whose stored point is the
                    centroid of a delivery area — a code on a ward line can
                    resolve to the neighbour. Said plainly rather than
                    presented as settled. */}
                <p className="type-caption mt-3 max-w-[54ch] text-text-muted text-pretty">
                  We placed you in {comparison.wardLabel} from your postal code.
                  That is a best guess, not a certainty, for codes that straddle
                  a ward boundary.
                </p>
              </>
            ) : (
              <p className="type-lead max-w-[54ch] text-text-secondary text-pretty">
                {META_FALLBACK.intro}
              </p>
            )}
          </div>

          {/* The way out, in the masthead where a reader looks for it rather
              than at the bottom of a page they have to finish first. */}
          <Link
            href="/toronto/vote/2026"
            className="group/btn type-button inline-flex flex-none items-center gap-2 pb-1 text-dark hover:text-accent"
          >
            Explore the candidates
            <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>

        {done ? (
          <>
            {comparison && (
              <div className="animate-fade-in">
                <AlignmentResults
                  races={comparison.races}
                  survey={survey}
                  answers={answers}
                />
              </div>
            )}
          </>
        ) : (
          <>
            {/* ── Progress ───────────────────────────────────── */}
            <div className="flex items-center gap-4 px-6 pt-8 md:px-10">
              <span className="type-label text-dark">
                Step {step + 1} of {stepCount}
              </span>
              <div
                className="h-0.5 flex-1 bg-border-light"
                role="progressbar"
                aria-valuenow={step + 1}
                aria-valuemin={1}
                aria-valuemax={stepCount}
                aria-label="Survey progress"
              >
                <div
                  className="h-0.5 bg-accent transition-[width] duration-300"
                  style={{
                    width: `${((step + 1) / stepCount) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* ── The current step ───────────────────────────── */}
            <form
              id="toronto-2026-survey"
              name="toronto-2026-survey"
              onSubmit={(e) => {
                e.preventDefault();
                if (isLastStep) void submit();
                else next();
              }}
            >
              {/* Keyed on the step so React remounts it and the entrance
                  animation replays on every move. */}
              <div key={currentStep.id} className="grid gap-8 px-6 pt-6 md:px-10">
                <h2
                  className="step-field font-sans text-[26px] font-medium tracking-[-0.01em]"
                  style={stagger(0)}
                >
                  {currentStep.title}
                </h2>
                {currentStep.intro && (
                  <p
                    className="step-field type-body-sm -mt-4 text-text-secondary"
                    style={stagger(1)}
                  >
                    {currentStep.intro}
                  </p>
                )}

                {currentStep.questions.map((question, i) => (
                  <Question
                    key={question.id}
                    question={question}
                    value={answers[question.id] ?? ""}
                    error={errors[question.id]}
                    onChange={(value) => set(question.id, value)}
                    style={stagger(i + (currentStep.intro ? 2 : 1))}
                  />
                ))}
              </div>

              {/* ── Navigation ───────────────────────────────── */}
              <div className="mt-10 flex items-center justify-between gap-4 border-t border-border-light px-6 py-6 md:px-10">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={back}
                    className="type-button cursor-pointer border border-border-light px-7 py-4 transition-colors hover:bg-linen-200"
                  >
                    Back
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-4">
                  {submitError && (
                    <p className="type-label-sm text-accent">{submitError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className={
                      isLastStep
                        ? "type-button cursor-pointer border border-accent bg-accent px-8 py-4 text-bg transition-colors hover:bg-auburn-700 disabled:opacity-60"
                        : "type-button cursor-pointer border border-dark bg-dark px-8 py-4 text-bg transition-colors hover:bg-black"
                    }
                  >
                    {isLastStep
                      ? submitting
                        ? "Sending…"
                        : meta.submitLabel ?? META_FALLBACK.submitLabel
                      : "Next"}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div >
  );
}

/* ── One question, rendered by type ─────────────────────────── */

function Question({
  question,
  value,
  error,
  onChange,
  style,
}: {
  question: SurveyQuestion;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  /** staggered entrance delay from the parent step */
  style?: CSSProperties;
}) {
  // Choice groups get a <legend>; single inputs get a real <label for>.
  const isGroup = question.type === "radio" || question.type === "yesno";

  // Omitted entirely for free-text questions, so every choice renderer below
  // reads it through this rather than asserting it exists.
  const options = question.options ?? [];

  // The question reads as a heading — one step down from the step title's 26px
  // — rather than as a form label, because several of these are a sentence long
  // and carry a context paragraph underneath.
  const LABEL_CLASS =
    "font-sans text-[19px] font-medium leading-[1.3] tracking-[-0.01em] text-dark text-pretty";

  const labelNode = (
    <>
      {question.label}
      {question.required ? (
        <span className="text-accent">*</span>
      ) : (
        <span className="type-body-sm font-normal text-text-muted">
          {" "}
          (optional)
        </span>
      )}
    </>
  );

  // `help` sits under the context paragraph, so tie both to the field by
  // reference rather than trusting proximity alone.
  const contextId = `${question.id}-context`;
  const helpId = `${question.id}-help`;
  const describedBy =
    [question.context && contextId, question.help && helpId]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <fieldset
      className="step-field grid gap-3 border-0 p-0 m-0"
      style={style}
      aria-describedby={isGroup ? describedBy : undefined}
    >
      {isGroup ? (
        <legend className={`${LABEL_CLASS} p-0`}>{labelNode}</legend>
      ) : (
        <label htmlFor={question.id} className={LABEL_CLASS}>
          {labelNode}
        </label>
      )}

      {/* The briefing a voter needs before they can answer: directly under the
          question, with a rule down its left edge so it reads as background
          rather than as part of the ask. */}
      {question.context && (
        <p
          id={contextId}
          className="type-body-sm max-w-[62ch] border-l-2 border-border-light pl-4 text-text-secondary text-pretty"
        >
          {question.context}
        </p>
      )}

      {/* The field and its own guidance, grouped so the choices sit tighter to
          each other than to the briefing above. */}
      <div className="grid content-start gap-2.5">
        {question.help && (
          <p id={helpId} className="type-caption text-text-muted">
            {question.help}
          </p>
        )}

        {question.type === "text" || question.type === "email" ? (
          <input
            id={question.id}
            name={question.id}
            type={question.type === "email" ? "email" : "text"}
            autoComplete={autoCompleteFor(question.id)}
            aria-describedby={describedBy}
            value={value}
            placeholder={question.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`${FIELD_CLASS} ${question.id === "postal_code" ? "max-w-[240px]" : "max-w-[420px]"}`}
          />
        ) : question.type === "textarea" ? (
          <textarea
            id={question.id}
            name={question.id}
            rows={question.rows ?? 4}
            aria-describedby={describedBy}
            value={value}
            placeholder={question.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={FIELD_CLASS}
          />
        ) : question.type === "select" ? (
          <Select
            id={question.id}
            name={question.id}
            value={value}
            onValueChange={onChange}
            options={options}
            placeholder={question.placeholder}
            invalid={Boolean(error)}
            className="max-w-[420px]"
          />
        ) : question.type === "radio" ? (
          <div className="grid gap-2">
            {options.map((option) => (
              <label key={option.value} className={CHOICE_CLASS}>
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  className={RADIO_CLASS}
                />
                {option.label}
              </label>
            ))}
          </div>
        ) : (
          /* yesno — a segmented control rather than two wide boxes. The answer
             is one word, so the control is sized to its words and the pair
             shares one border, reading as a single unit.

             Deliberately not `type-button`: that utility is uppercase mono at
             0.14em tracking, which is right on a button and unreadable on a
             one-word answer. These use the same serif face and size as the
             radio choices above, so the two question types look related.

             The Yes/No pair still comes from the API like any other options
             list, so results group by values this component never invents.

             The radio is visually hidden and the whole segment is the target —
             `has-checked:` styles the label from the input's own state, so this
             stays a real radio group for keyboard and screen-reader users, with
             the focus ring surfaced by `has-focus-visible:`. Hover is scoped to
             unchecked segments so it can't repaint the selected one.

             The rule and the space above it separate the ask from the answer.
             Several of these questions run a sentence long and carry a context
             paragraph, so without a break the control reads as one more line of
             that text. The rule's width matches the context paragraph's measure,
             so it aligns with the column above rather than running the full
             width of the card. */
          <div className="mt-3 max-w-[62ch] border-t border-border-light pt-5">
            <div className="flex w-fit border border-border-light bg-white">
              {options.map((option, i) => (
                <label
                  key={option.value}
                  className={`cursor-pointer px-7 py-2.5 text-[17px] transition-colors ${i > 0 ? "border-l border-border-light" : ""
                    } not-has-checked:hover:bg-linen-100 has-checked:bg-dark has-checked:text-bg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-dark`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.value}
                    checked={value === option.value}
                    onChange={() => onChange(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {error && <p className="type-label-sm text-accent">{error}</p>}
      </div>
    </fieldset>
  );
}

/** Autofill hints for the handful of fields browsers can help with. */
function autoCompleteFor(id: string): string | undefined {
  if (id === "email") return "email";
  if (id === "name") return "name";
  if (id === "postal_code") return "postal-code";
  return undefined;
}
