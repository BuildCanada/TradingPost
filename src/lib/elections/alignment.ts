// Comparing one resident's survey answers to the candidates' answers in their
// ward.
//
// The candidate side mirrors York Factory's
// warehouse.election_candidate_survey_responses: `answers` is {question_id =>
// string}, `explanations` is a parallel map of prose published verbatim beside
// the choice, and `source`/`enteredBy` record provenance because a published
// position has to be traceable to how it was obtained. Nothing here reads that
// table yet — see candidate-responses.fixture.ts.
//
// One property of that table shapes every rule below: York Factory
// deliberately does NOT validate a candidate's answer against the offered
// options (see the model's `answers_match_the_survey`, which checks the key and
// not the value). Staff transcribe what candidates actually say, and "supports
// with caveats" is a wanted value, not a defect. So an answer that isn't one of
// the options is reported as `unclear` and left out of the score. Folding it
// into "differs" would invent a disagreement the candidate never stated, which
// is the one error this comparison must not make.

import type { Survey, SurveyQuestion } from "./survey";

/**
 * Steps that ask who someone is rather than what they think. Excluded by step
 * rather than by question id so that a consent or contact question added in the
 * CMS later is excluded automatically — the likelier edit, and the one that
 * would otherwise quietly show up as a policy position.
 */
const NON_POLICY_STEPS = new Set(["about-you", "stay-in-touch"]);

/**
 * Belt and braces for the two consent questions that exist today: they are
 * choice-typed and would read as policy if their step were ever renamed.
 */
const NON_POLICY_QUESTIONS = new Set(["volunteer", "updates"]);

/** Question types with a fixed option list, so two answers can be compared. */
const CHOICE_TYPES = new Set(["yesno", "radio", "select"]);

/**
 * True when a question's options are a yes/no scale — "Yes", "Yes, with
 * conditions", "No" — rather than distinct alternatives.
 *
 * It decides which chart the answer gets, and the two are not interchangeable.
 * A dial puts three options at 120° from each other, which says they are
 * competing choices of equal standing; a yes-scale is ordered, and drawing it
 * that way loses the order and invents a three-way contest. Those get a bar,
 * where "mostly yes with a bloc of noes" is the shape you actually see.
 *
 * Matched on the labels because that is where the distinction lives: the
 * questionnaire types both kinds as `radio` with three options, so nothing in
 * the schema separates them.
 */
export function isYesNoScale(labels: string[]): boolean {
  if (labels.length < 2) return false;
  return labels.every((label) => /^(yes|no)\b/i.test(label.trim()));
}

/** One candidate's answers to a questionnaire, as York Factory stores them. */
export type CandidateSurveyResponse = {
  candidateName: string;
  /** ward key as candidates.ts stores it, "01".."25" */
  ward: string;
  surveySlug: string;
  surveyVersion: string;
  /** {question_id => stored value}; verbatim, so not always an option value */
  answers: Record<string, string>;
  /** {question_id => prose}, published beside the choice */
  explanations?: Record<string, string>;
  /** how the answers reached us — provenance for a published position */
  source: "admin" | "email" | "form" | "phone" | "other";
  enteredBy?: string;
};

export type Verdict =
  /** same option as the respondent */
  | "agree"
  /** a different option from the respondent */
  | "differ"
  /** answered, but not with one of the offered options */
  | "unclear"
  /** no answer on record for this question */
  | "unanswered";

export type CandidateCell = {
  candidateName: string;
  verdict: Verdict;
  /** the option's label, or the raw transcription when it matched no option */
  answer?: string;
  explanation?: string;
  /**
   * Index into `QuestionRow.options`, or null when there is nothing to point
   * at — an unanswered question, or prose that matched no option. Charts key
   * off this rather than off the label, so a reworded option still lines up.
   */
  choice: number | null;
};

export type QuestionRow = {
  questionId: string;
  question: string;
  stepId: string;
  stepTitle: string;
  /** the respondent's own answer, as a label */
  yourAnswer: string;
  /** the option labels exactly as they were offered, in order */
  options: string[];
  /** each option's expansion, where it has one; parallel to `options` */
  details: (string | null)[];
  /** the respondent's own pick, as an index into `options` */
  yourChoice: number | null;
  /**
   * How many of this ward's candidates picked each option. `unclear` and
   * `unanswered` are in no bucket, so this sums to the number of candidates
   * who gave a usable answer rather than to the size of the field.
   */
  counts: number[];
  cells: CandidateCell[];
};

export type CandidateScore = {
  candidateName: string;
  agreed: number;
  differed: number;
  /** agreed + differed — the denominator the share is actually out of */
  compared: number;
  unclear: number;
  unanswered: number;
  /** 0–1 over `compared`, or null when nothing was comparable */
  share: number | null;
};

export type Alignment = {
  rows: QuestionRow[];
  /** ranked, most aligned first */
  scores: CandidateScore[];
};

/**
 * "ward-5" (York Factory's `derived_region`) → "05" (candidates.ts's key).
 * Returns null for a missing or unrecognised region, which callers treat as
 * "we could not place this respondent in a ward" rather than as ward zero.
 */
export function wardKeyFromRegion(
  region: string | null | undefined,
): string | null {
  if (typeof region !== "string") return null;
  const match = /^ward-(\d{1,2})$/.exec(region.trim());
  if (!match) return null;
  const number = parseInt(match[1], 10);
  if (!Number.isFinite(number) || number < 1) return null;
  return String(number).padStart(2, "0");
}

/** The policy questions of a survey, in the order a respondent meets them. */
export function comparableQuestions(
  survey: Survey,
): { question: SurveyQuestion; stepId: string; stepTitle: string }[] {
  return survey.steps.flatMap((step) =>
    NON_POLICY_STEPS.has(step.id)
      ? []
      : step.questions
          .filter(
            (question) =>
              CHOICE_TYPES.has(question.type) &&
              !NON_POLICY_QUESTIONS.has(question.id) &&
              (question.options?.length ?? 0) > 0,
          )
          .map((question) => ({
            question,
            stepId: step.id,
            stepTitle: step.title,
          })),
  );
}

/**
 * Compares one set of resident answers against several candidate responses.
 *
 * Only questions the respondent actually answered are included: this reads as
 * "here is where you and they differ", and a question the respondent skipped
 * has no "you" to compare against. Questions no candidate has answered are
 * dropped too, since a row of four dashes tells a reader nothing.
 */
export function alignToCandidates(
  survey: Survey,
  answers: Record<string, string>,
  responses: CandidateSurveyResponse[],
): Alignment {
  const tallies = new Map<string, CandidateScore>(
    responses.map((response) => [
      response.candidateName,
      {
        candidateName: response.candidateName,
        agreed: 0,
        differed: 0,
        compared: 0,
        unclear: 0,
        unanswered: 0,
        share: null,
      },
    ]),
  );

  const rows: QuestionRow[] = [];

  for (const { question, stepId, stepTitle } of comparableQuestions(survey)) {
    const yourValue = (answers[question.id] ?? "").trim();
    if (!yourValue) continue;

    const options = question.options ?? [];
    const indexOf = (value: string) =>
      options.findIndex((option) => option.value === value);
    const labelFor = (value: string) =>
      options.find((option) => option.value === value)?.label;
    const yourAnswer = labelFor(yourValue) ?? yourValue;
    const yourIndex = indexOf(yourValue);

    const counts = options.map(() => 0);

    const cells = responses.map((response): CandidateCell => {
      const tally = tallies.get(response.candidateName)!;
      const raw = (response.answers[question.id] ?? "").trim();
      const explanation = response.explanations?.[question.id];

      if (!raw) {
        tally.unanswered += 1;
        return {
          candidateName: response.candidateName,
          verdict: "unanswered",
          explanation,
          choice: null,
        };
      }

      const label = labelFor(raw);
      if (label === undefined) {
        // Transcribed prose rather than one of the options — reportable, but
        // not a disagreement we get to assert on the candidate's behalf.
        tally.unclear += 1;
        return {
          candidateName: response.candidateName,
          verdict: "unclear",
          answer: raw,
          explanation,
          choice: null,
        };
      }

      const agrees = raw === yourValue;
      if (agrees) tally.agreed += 1;
      else tally.differed += 1;
      tally.compared += 1;

      const choice = indexOf(raw);
      counts[choice] += 1;

      return {
        candidateName: response.candidateName,
        verdict: agrees ? "agree" : "differ",
        answer: label,
        explanation,
        choice,
      };
    });

    if (cells.every((cell) => cell.verdict === "unanswered")) continue;

    rows.push({
      questionId: question.id,
      question: question.label,
      stepId,
      stepTitle,
      yourAnswer,
      options: options.map((option) => option.label),
      details: options.map((option) => option.detail ?? null),
      yourChoice: yourIndex === -1 ? null : yourIndex,
      counts,
      cells,
    });
  }

  const scores = [...tallies.values()].map((tally) => ({
    ...tally,
    share: tally.compared > 0 ? tally.agreed / tally.compared : null,
  }));

  // Most aligned first. A candidate with nothing comparable sorts last rather
  // than as 0%, because "we can't say" is not the same claim as "agrees on
  // nothing". Ties break on the number compared — a 4/5 is better evidenced
  // than a 1/1 — and then on name, so the order is stable across renders.
  scores.sort((a, b) => {
    if (a.share === null || b.share === null) {
      if (a.share === b.share) return a.candidateName.localeCompare(b.candidateName);
      return a.share === null ? 1 : -1;
    }
    if (b.share !== a.share) return b.share - a.share;
    if (b.compared !== a.compared) return b.compared - a.compared;
    return a.candidateName.localeCompare(b.candidateName);
  });

  return { rows, scores };
}
