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
import { lastName } from "./names";
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

/* ------------------------------------------------------------------ */
/* Question-first                                                      */
/* ------------------------------------------------------------------ */

/** One candidate's cell in a question's row; `answer` is null where they
 *  answered the questionnaire but skipped this question. */
export type AnswerCell = {
  /** `nameKey(candidateName)` — matches a roster `CandidateView.key` */
  key: string;
  candidateName: string;
  /** false where they never returned the questionnaire at all — which is a
   *  different fact from answering it and skipping this question, and the two
   *  print differently */
  responded: boolean;
  answer: CandidateAnswer | null;
};

/** One question, with every candidate's answer to it side by side. */
export type ComparedQuestion = {
  questionId: string;
  question: string;
  options: string[];
  details: (string | null)[];
  /** the whole field's split, the same figure every candidate's card used */
  counts: number[];
  ordinal: boolean;
  /** one per candidate, in the order the candidates were handed in */
  cells: AnswerCell[];
};

export type ComparedGroup = {
  stepId: string;
  stepTitle: string;
  questions: ComparedQuestion[];
};

/**
 * Pivots a ward's candidates into one row per question.
 *
 * The candidate-first shape (`candidateAnswers`) answers "what does this
 * candidate think", and a ward page asked it once per candidate: the same
 * thirty-odd questions, the same option wording, the same charts, repeated in
 * full for everyone on the ballot. That is the right shape for one card and
 * the wrong shape for a page — it ran to tens of thousands of pixels, and the
 * one thing a voter is there to do, hold two candidates against each other on
 * a question, meant scrolling between two cards a screen or more apart.
 *
 * Same data, read across instead of down. Questions keep the order and the
 * grouping the questionnaire gave them, taken from the first candidate who
 * answered each — a candidate who skipped a question simply has an empty cell
 * in that row, which is itself worth seeing.
 *
 * The columns come from `roster` where one is given, which is how the whole
 * ballot gets into the grid rather than only the part of it that wrote back.
 * A candidate who never returned the questionnaire is a column of "did not
 * respond", and that is the single most useful thing the page can tell a voter
 * about them. Without a roster the columns are the entries themselves.
 */
export function comparedQuestions(
  entries: CandidateAnswers[],
  roster?: { key: string; name: string }[],
  shape?: ComparedGroup[],
): ComparedGroup[] {
  const groups: ComparedGroup[] = [];
  const byStep = new Map<string, ComparedGroup>();
  const byQuestion = new Map<string, ComparedQuestion>();

  const responded = new Set(entries.map((entry) => entry.key));
  const columns = (
    roster ??
    entries.map((entry) => ({ key: entry.key, name: entry.candidateName }))
  ).map((candidate) => ({
    key: candidate.key,
    candidateName: candidate.name,
    responded: responded.has(candidate.key),
  }));

  for (const entry of entries) {
    for (const group of entry.groups) {
      let compared = byStep.get(group.stepId);
      if (!compared) {
        compared = {
          stepId: group.stepId,
          stepTitle: group.stepTitle,
          questions: [],
        };
        byStep.set(group.stepId, compared);
        groups.push(compared);
      }

      for (const answer of group.answers) {
        let question = byQuestion.get(answer.questionId);
        if (!question) {
          question = {
            questionId: answer.questionId,
            question: answer.question,
            options: answer.options,
            details: answer.details,
            counts: answer.counts,
            ordinal: answer.ordinal,
            cells: columns.map((column) => ({ ...column, answer: null })),
          };
          byQuestion.set(answer.questionId, question);
          compared.questions.push(question);
        }

        const cell = question.cells.find((c) => c.key === entry.key);
        if (cell) cell.answer = answer;
      }
    }
  }

  /* Nobody in this ward wrote back, so the questions have nowhere to come
     from: they are read off the returned questionnaires, and there are none.
     The questionnaire itself supplies them instead, and every cell is a "did
     not respond" — which is the whole point of the page in a ward like that.
     Silence from a whole field is a finding, and it reads as one only when a
     reader can see the thirty questions nobody answered. */
  if (groups.length === 0 && shape) {
    return shape.map((group) => ({
      ...group,
      questions: group.questions.map((question) => ({
        ...question,
        cells: columns.map((column) => ({ ...column, answer: null })),
      })),
    }));
  }

  return groups;
}

/**
 * The columns of a survey grid, in the order they should print.
 *
 * Answered first, then the rest, each half by surname. The clerk's order is a
 * filing order and reads as noise in a grid: it puts the one candidate who
 * answered thirty questions somewhere in the middle of eleven columns of "did
 * not respond", so the columns worth reading are the ones a reader has to go
 * looking for. Sorting by name alone would do the same. Alphabetical within
 * each half because a reader checking on one candidate needs somewhere to look
 * them up.
 *
 * Withdrawn candidates are dropped: they cannot be voted for, so a column of
 * theirs is a column of a ballot line that does not exist, and in a grid this
 * wide every column costs the reader a drag.
 */
export function surveyRoster<
  T extends { key: string; name: string; withdrawn?: boolean },
>(
  candidates: T[],
  answers?: Record<string, CandidateAnswers>,
): (T & { answers?: CandidateAnswers })[] {
  return candidates
    .filter((candidate) => !candidate.withdrawn)
    .map((candidate) => ({ ...candidate, answers: answers?.[candidate.key] }))
    .sort((a, b) => {
      if (!!a.answers !== !!b.answers) return a.answers ? -1 : 1;
      return (
        lastName(a.name).localeCompare(lastName(b.name)) ||
        a.name.localeCompare(b.name)
      );
    });
}

/**
 * Every comparable question in the questionnaire, with the whole field's split
 * on each and no candidate attached — the shape of the grid, for a ward whose
 * candidates have all stayed quiet.
 *
 * The counts come from every response in the election, exactly as they do on a
 * candidate's own answers: what the rest of the field said is the one thing a
 * ward of non-respondents can still tell a reader.
 */
export function questionnaireShape(
  survey: Survey,
  responses: CandidateSurveyResponse[],
): ComparedGroup[] {
  const groups: ComparedGroup[] = [];

  for (const { question, stepId, stepTitle } of comparableQuestions(survey)) {
    const options = question.options ?? [];
    const counts = options.map(() => 0);
    for (const response of responses) {
      const raw = (response.answers[question.id] ?? "").trim();
      if (!raw) continue;
      const index = options.findIndex((option) => option.value === raw);
      if (index !== -1) counts[index] += 1;
    }

    const compared: ComparedQuestion = {
      questionId: question.id,
      question: question.label,
      options: options.map((option) => option.label),
      details: options.map((option) => option.detail ?? null),
      counts,
      ordinal: isYesNoScale(options.map((option) => option.label)),
      cells: [],
    };

    const last = groups.at(-1);
    if (last?.stepId === stepId) last.questions.push(compared);
    else groups.push({ stepId, stepTitle, questions: [compared] });
  }

  return groups;
}
