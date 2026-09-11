// The questionnaire, fetched once and cut to a roster.
//
// Both the ward pages and the mayoral page draw the same grid from the same
// two York Factory resources, and both need the same two things out of them:
// the answers belonging to the candidates on the page, and the shape of the
// questionnaire itself for the case where none of them wrote back.
//
// Both halves are publish-gated, so an empty result is the normal case for
// most of the campaign — not a failure. The questionnaire is a nice-to-have on
// these pages besides: if York Factory is unreachable the page still has to
// render its roster, so a failed fetch costs the answers rather than the page.
// That is the opposite of the survey page, where a missing survey means there
// is nothing to show at all.

import {
  BIO_QUESTION_ID,
  byCandidateKey,
  candidateAnswers,
  candidateWriting,
  questionnaireShape,
  type CandidateAnswers,
  type ComparedGroup,
  type WrittenAnswer,
} from "./candidate-answers";
import {
  CANDIDATE_QUESTIONNAIRE_SLUG,
  fetchCandidateResponses,
} from "./candidate-responses";
import { getElection } from "./registry";
import { fetchSurvey } from "./survey";

export type RosterSurvey = {
  /** the roster's own answers, keyed by `nameKey` */
  answers: Record<string, CandidateAnswers>;
  /** every question, with nobody attached — the grid's shape when the whole
   *  roster stayed quiet */
  shape: ComparedGroup[];
  /** the roster's free-text answers, keyed by `nameKey`. The choices are what
   *  a grid can compare; this is what the candidates wrote. */
  written: Record<string, WrittenAnswer[]>;
};

/**
 * Every published answer belonging to `candidateKeys`, plus the questionnaire's
 * shape.
 *
 * Answers we cannot match to a candidate on the roster are dropped. The join is
 * on name, and a response we cannot place is one we must not attribute.
 *
 * The fetch is deliberately for the whole election rather than the roster: the
 * counts beside each answer are the whole field's split ("21 of 30 said this
 * too"), which a ward of one or two respondents — or a mayoral field of
 * three — cannot supply on its own. The roster narrows who gets a column, not
 * what they are measured against.
 */
export async function rosterSurvey(
  electionSlug: string,
  candidateKeys: Set<string>,
): Promise<RosterSurvey> {
  try {
    const [survey, responses] = await Promise.all([
      fetchSurvey(electionSlug, CANDIDATE_QUESTIONNAIRE_SLUG),
      fetchCandidateResponses(electionSlug),
    ]);
    const entries = candidateAnswers(survey, responses).filter((entry) =>
      candidateKeys.has(entry.key),
    );
    const written = candidateWriting(survey, responses);

    /* Answers withheld, prose kept — see `questionnaireHidden` in the
       registry. The responses are still fetched because the bio rides in on
       them, and a candidate's account of themselves is not one of the answers
       being held back. Every page reading this is left with the empty state it
       already had for a field that has not written back yet.

       `written` is narrowed to the bio alone rather than passed through. The
       rest of it is prose answering a policy question — the questionnaire's
       ward-commitment target is one — and letting that through under the
       heading "About" would publish an answer by another door. */
    if (getElection(electionSlug).questionnaireHidden) {
      return {
        answers: {},
        shape: [],
        written: Object.fromEntries(
          Object.entries(written)
            .filter(([key]) => candidateKeys.has(key))
            .map(([key, entries]) => [
              key,
              entries.filter((entry) => entry.questionId === BIO_QUESTION_ID),
            ])
            .filter(([, entries]) => (entries as WrittenAnswer[]).length > 0),
        ),
      };
    }

    return {
      answers: byCandidateKey(entries),
      shape: questionnaireShape(survey, responses),
      /* Narrowed to the roster on the same rule the answers are: prose we
         cannot place on a candidate is prose we must not attribute. */
      written: Object.fromEntries(
        Object.entries(written).filter(([key]) => candidateKeys.has(key)),
      ),
    };
  } catch {
    return { answers: {}, shape: [], written: {} };
  }
}
