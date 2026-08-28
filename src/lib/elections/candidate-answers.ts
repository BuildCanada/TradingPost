// One ward's candidates, each with the answers they gave the questionnaire.
//
// The alignment view (alignment.ts) is question-first and needs a resident to
// compare against. A ward page has no resident: it is the roster, and what
// belongs on a candidate's card is simply what that candidate said. So this
// module pivots the same source data candidate-first and drops the comparison.
//
// It reuses `comparableQuestions` so the two views can never disagree about
// which questions count as policy — a consent question added in the CMS is
// excluded from both by the same rule.
//
// The per-question `counts` are the split across EVERY candidate who answered
// the questionnaire, not just the ward's. That is what makes a single answer
// legible — "21 of 30 said this too" — and a ward is far too small a field to
// carry it: most wards have one or two respondents, where a per-ward count
// says only that the candidate agrees with themselves.

import { comparableQuestions, isYesNoScale } from "./alignment";
import type { CandidateSurveyResponse } from "./alignment";
import { nameKey } from "./election-data";
import type { Survey } from "./survey";

export type CandidateAnswer = {
  questionId: string;
  question: string;
  /** the option labels exactly as they were offered, in order */
  options: string[];
  /**
   * Each option's expansion, where it has one. Kept apart from the label so a
   * chart can stay terse while the list beside it reads in full — which is how
   * the questionnaire actually put the choice.
   */
  details: (string | null)[];
  /**
   * How many candidates picked each option, across everyone who answered the
   * questionnaire. Answers that matched no option are in no bucket, so this
   * sums to the candidates who chose something rather than to the whole field.
   */
  counts: number[];
  /** index into `options`, or null when the answer matched none */
  choice: number | null;
  /**
   * The options are an ordered yes/no scale rather than competing
   * alternatives, so this answer is drawn as a bar and not a dial.
   */
  ordinal: boolean;
  /** the option's label, or the raw transcription when it matched no option */
  answer: string;
  /** true when `answer` is the candidate's own words rather than an option */
  verbatim: boolean;
  explanation?: string;
};

export type AnswerGroup = {
  stepId: string;
  stepTitle: string;
  answers: CandidateAnswer[];
};

export type CandidateAnswers = {
  candidateName: string;
  /** `nameKey(candidateName)` — how a roster CandidateView is matched */
  key: string;
  /** questions this candidate gave any answer to */
  answered: number;
  /**
   * Candidates on file, the whole field — the top of the value scale every
   * chart is drawn against. One shared maximum is the point: a wedge reaching
   * the rim is the most lopsided answer on the questionnaire, and every other
   * wedge is measured against it. A per-question scale would make every answer
   * look unanimous.
   */
  fieldSize: number;
  groups: AnswerGroup[];
};

/**
 * Pivots published responses into one entry per candidate.
 *
 * Pass every response for the election, not one ward's: the counts on each
 * answer are the whole field's split, and a caller narrows to a ward by
 * keeping the entries whose `key` is on that ward's roster.
 *
 * Candidates who answered nothing are dropped rather than returned empty: a
 * card with a "Survey answers (0)" disclosure on it is worse than a card with
 * no disclosure at all.
 */
export function candidateAnswers(
  survey: Survey,
  responses: CandidateSurveyResponse[],
): CandidateAnswers[] {
  const byCandidate = new Map<string, AnswerGroup[]>(
    responses.map((response) => [response.candidateName, []]),
  );

  for (const { question, stepId, stepTitle } of comparableQuestions(survey)) {
    const options = question.options ?? [];
    const counts = options.map(() => 0);

    // First pass: the field's split, so every candidate's chart is drawn
    // against the same denominator.
    const picks = responses.map((response) => {
      const raw = (response.answers[question.id] ?? "").trim();
      if (!raw) return null;
      const index = options.findIndex((option) => option.value === raw);
      if (index !== -1) counts[index] += 1;
      return { raw, index };
    });

    responses.forEach((response, i) => {
      const pick = picks[i];
      if (!pick) return;

      const groups = byCandidate.get(response.candidateName)!;
      const answer: CandidateAnswer = {
        questionId: question.id,
        question: question.label,
        options: options.map((option) => option.label),
        details: options.map((option) => option.detail ?? null),
        ordinal: isYesNoScale(options.map((option) => option.label)),
        counts,
        choice: pick.index === -1 ? null : pick.index,
        answer:
          pick.index === -1 ? pick.raw : (options[pick.index]?.label ?? pick.raw),
        verbatim: pick.index === -1,
        explanation: response.explanations?.[question.id],
      };

      const last = groups.at(-1);
      if (last?.stepId === stepId) last.answers.push(answer);
      else groups.push({ stepId, stepTitle, answers: [answer] });
    });
  }

  return responses
    .map((response) => {
      const groups = byCandidate.get(response.candidateName)!;
      return {
        candidateName: response.candidateName,
        key: nameKey(response.candidateName),
        answered: groups.reduce((n, group) => n + group.answers.length, 0),
        fieldSize: responses.length,
        groups,
      };
    })
    .filter((entry) => entry.answered > 0);
}

/** Keyed by `nameKey`, ready to look up against a roster `CandidateView.key`. */
export function byCandidateKey(
  entries: CandidateAnswers[],
): Record<string, CandidateAnswers> {
  return Object.fromEntries(entries.map((entry) => [entry.key, entry]));
}
