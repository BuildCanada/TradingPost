"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Select } from "@/components/ui/select";

import type { Survey, SurveyQuestion } from "@/lib/elections/survey";

import { submitSurvey } from "./submitSurvey";

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
const META_FALLBACK = {
  title: "Toronto priorities survey",
  intro: "",
  submitLabel: "Submit survey",
  thankYou: {
    title: "Thank you. Your answers are in.",
    body: "We read every response.",
    restartLabel: "Start again",
  },
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

export default function SurveyClient({ survey }: { survey: Survey }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Everything about the shape of the form comes from the fetched survey, so a
  // question added in the CMS shows up here with no change to this component.
  const steps = survey.steps;
  const stepCount = steps.length;
  const meta = survey.meta;
  const thankYou = { ...META_FALLBACK.thankYou, ...(meta.thankYou ?? {}) };

  const isLastStep = step === stepCount - 1;
  const currentStep = steps[step];

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
      await submitSurvey(survey, answers);
      setDone(true);
      scrollTop();
    } catch {
      // Answers stay on screen so they can just press submit again.
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setAnswers({});
    setErrors({});
    setSubmitError(null);
    setStep(0);
    setDone(false);
    scrollTop();
  };

  return (
    <div className="theme-election bg-bg text-dark min-h-screen px-5 py-8 pb-20">
      <div className="mx-auto w-full max-w-[760px] border-2 border-dark bg-bg">
        {/* ── Masthead ───────────────────────────────────────── */}


        <div className="px-6 pt-8 md:px-10">
          <h1 className="mb-3 font-sans font-medium leading-[1.03] tracking-[-0.02em] text-[clamp(2rem,5vw,2.875rem)] text-balance">
            {meta.title ?? META_FALLBACK.title}
          </h1>
          <p className="type-lead text-text-secondary text-pretty">
            {meta.intro ?? META_FALLBACK.intro}
          </p>
        </div>

        {done ? (
          <div className="animate-fade-in border-t border-border-light px-6 pt-14 pb-16 md:px-10">
            <div className="mb-7 h-0.5 w-10 bg-accent" />
            <h2 className="mb-4 font-sans font-medium leading-[1.05] tracking-[-0.015em] text-[clamp(1.75rem,4vw,2.375rem)] text-balance">
              {thankYou.title}
            </h2>
            <p className="type-lead mb-8 text-text-secondary text-pretty">
              {thankYou.body}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={restart}
                className="type-button cursor-pointer border border-border-light px-7 py-4 transition-colors hover:bg-linen-200"
              >
                {thankYou.restartLabel}
              </button>
              <Link
                href="/toronto/elections/2026"
                className="group/btn type-button inline-flex items-center gap-2 text-dark hover:text-accent"
              >
                Explore the candidates
                <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ── Progress ───────────────────────────────────── */}
            <div className="flex items-center gap-4 px-6 pt-7 md:px-10">
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
          /* yesno — the API sends the Yes/No pair like any other options list,
             so results group by values this component never invents. */
          <div className="flex gap-2">
            {options.map((option) => (
              <label
                key={option.value}
                className={`${CHOICE_CLASS} type-button max-w-[160px] flex-1 justify-center`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  className="size-4 m-0 accent-accent"
                />
                {option.label}
              </label>
            ))}
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
