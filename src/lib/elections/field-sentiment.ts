// The whole field's answers to the questionnaire, question-first.
//
// The grid pages (SurveyGrid) answer "what did THIS ballot say" — a ward's
// candidates, or the mayoral field, one column each. That shape stops working
// at city scale: thirty-two respondents is thirty-two columns, which is a
// kilometre of sideways drag and no picture at all.
//
// City-wide, the interesting object is not the candidate — it is the question.
// Across everyone who answered, where does the field converge and where does
// it split? So this module drops the columns and keeps the distribution: one
// entry per question, with every candidate filed under the option they picked.
//
// It reuses `comparableQuestions` so this page and the grids can never
// disagree about which questions count as policy.

import { comparableQuestions, isYesNoScale } from "./alignment";
import type { CandidateSurveyResponse } from "./alignment";
import { nameKey } from "./election-data";
import { lastName } from "./names";
import type { Survey } from "./survey";

/** Which ballot line a respondent is on. A response with no ward is city-wide,
 *  which in Toronto means the mayoral race. */
export type Race = "mayor" | "councillor";

/** One candidate's answer to one question, filed under that question. */
export type FieldPick = {
  /** `nameKey(name)` — matches a roster `CandidateView.key` */
  key: string;
  name: string;
  /** for the surname-first lists the charts print */
  surname: string;
  race: Race;
  /** "01".."25", or "" for a city-wide candidate */
  ward: string;
  /** index into the question's options, or null when the answer matched none */
  choice: number | null;
  /** the option's label, or their own words where it matched none */
  answer: string;
  /** what they wrote alongside the choice, where they wrote anything */
  note?: string;
};

export type FieldQuestion = {
  questionId: string;
  question: string;
  stepId: string;
  stepTitle: string;
  /** the option labels exactly as they were offered, in order */
  options: string[];
  /** each option's expansion, where it has one */
  details: (string | null)[];
  /** the options are an ordered scale (Yes / Yes, with conditions / No) rather
   *  than competing alternatives — drawn as a band, never as a dial */
  ordinal: boolean;
  /** everyone who answered this question, in no particular order */
  picks: FieldPick[];
};

export type FieldGroup = {
  stepId: string;
  stepTitle: string;
  questions: FieldQuestion[];
};

/** One candidate who returned the questionnaire. */
export type Respondent = {
  key: string;
  name: string;
  surname: string;
  race: Race;
  ward: string;
  /** how many policy questions they gave an answer to */
  answered: number;
};

export type FieldSentiment = {
  /** candidates who returned the questionnaire at all */
  respondents: Respondent[];
  groups: FieldGroup[];
  /** every question, flat, in questionnaire order */
  questions: FieldQuestion[];
};

/**
 * Pivots every published response in an election into one entry per question.
 *
 * Pass the whole election's responses, not one ward's: the point of this view
 * is the city-wide distribution, and a ward is far too small a field to have
 * one — most wards have a single respondent, where a distribution says only
 * that the candidate agrees with themselves.
 */
export function fieldSentiment(
  survey: Survey,
  responses: CandidateSurveyResponse[],
): FieldSentiment {
  const respondents: Respondent[] = responses.map((response) => ({
    key: nameKey(response.candidateName),
    name: response.candidateName,
    surname: lastName(response.candidateName),
    race: response.ward ? "councillor" : "mayor",
    ward: response.ward,
    answered: 0,
  }));

  const groups: FieldGroup[] = [];
  const questions: FieldQuestion[] = [];

  for (const { question, stepId, stepTitle } of comparableQuestions(survey)) {
    const options = question.options ?? [];
    const picks: FieldPick[] = [];

    responses.forEach((response, i) => {
      const raw = (response.answers[question.id] ?? "").trim();
      if (!raw) return;

      const index = options.findIndex((option) => option.value === raw);
      respondents[i].answered += 1;
      picks.push({
        key: respondents[i].key,
        name: respondents[i].name,
        surname: respondents[i].surname,
        race: respondents[i].race,
        ward: respondents[i].ward,
        choice: index === -1 ? null : index,
        answer: index === -1 ? raw : (options[index]?.label ?? raw),
        note: response.explanations?.[question.id],
      });
    });

    const entry: FieldQuestion = {
      questionId: question.id,
      question: question.label,
      stepId,
      stepTitle,
      options: options.map((option) => option.label),
      details: options.map((option) => option.detail ?? null),
      ordinal: isYesNoScale(options.map((option) => option.label)),
      picks,
    };
    questions.push(entry);

    const last = groups.at(-1);
    if (last?.stepId === stepId) last.questions.push(entry);
    else groups.push({ stepId, stepTitle, questions: [entry] });
  }

  return {
    // Somebody who returned the form and answered no policy question is not a
    // respondent for this page's purposes: they contribute to no distribution,
    // and counting them would quietly deflate every share on the page.
    respondents: respondents
      .filter((r) => r.answered > 0)
      .sort((a, b) => a.surname.localeCompare(b.surname)),
    groups,
    questions,
  };
}

/* ------------------------------------------------------------------ */
/* Reading a distribution                                              */
/* ------------------------------------------------------------------ */

/** One question's split, once a filter has been applied to the field. */
export type Split = {
  /** how many picked each option, in option order */
  counts: number[];
  /** candidates who answered but matched no option — in no bucket */
  unplaced: FieldPick[];
  /** everyone in a bucket; the denominator every share on the row uses */
  answered: number;
  /** index of the most-picked option, or -1 when nobody answered */
  lead: number;
  /** the leading option's share of `answered`, 0..1 */
  leadShare: number;
  /**
   * How split the field is, 0..1 — normalised Shannon entropy over the options
   * that were OFFERED, not the ones that were picked.
   *
   * 0 is unanimity and 1 is a dead-even split across every option. Entropy
   * rather than "everyone but the leader" because the two read differently on
   * a three-way question: 60/40/0 and 60/20/20 have the same leader and the
   * same runner-up total, and only one of them is a field that has actually
   * fractured. Measured against the offered options so a question whose third
   * option nobody chose is scored as the narrower field it is.
   */
  division: number;
};

export function splitOf(question: FieldQuestion, picks: FieldPick[]): Split {
  const counts = question.options.map(() => 0);
  const unplaced: FieldPick[] = [];

  for (const pick of picks) {
    if (pick.choice === null) unplaced.push(pick);
    else counts[pick.choice] += 1;
  }

  const answered = counts.reduce((a, b) => a + b, 0);
  if (answered === 0)
    return { counts, unplaced, answered, lead: -1, leadShare: 0, division: 0 };

  let lead = 0;
  for (let i = 1; i < counts.length; i += 1)
    if (counts[i] > counts[lead]) lead = i;

  const k = Math.max(2, question.options.length);
  const entropy = counts.reduce((sum, count) => {
    if (count === 0) return sum;
    const p = count / answered;
    return sum - p * Math.log(p);
  }, 0);

  return {
    counts,
    unplaced,
    answered,
    lead,
    leadShare: counts[lead] / answered,
    division: entropy / Math.log(k),
  };
}

/** The picks belonging to one ballot line, or all of them. */
export function forRace(picks: FieldPick[], race: Race | "all"): FieldPick[] {
  return race === "all" ? picks : picks.filter((pick) => pick.race === race);
}
