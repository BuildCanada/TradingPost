import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Heading } from "@/components/custom/signpost/config";
import type { GridCandidate } from "./SurveyGrid";
import { QuestionRollCall } from "./QuestionRollCall";
import type { Seat } from "./QuestionRollCall";
import type { ComparedGroup } from "@/lib/elections/candidate-answers";

/* One race's questionnaire, read question by question — a card per question,
 * the candidates filed under the answer they gave.
 *
 * WHAT THIS REPLACED
 *   A grid: candidates across, thirty-odd questions down, sticky heads, and a
 *   horizontally scrolling region with a chart behind every row. It answered
 *   "what did this candidate say" well and "how do these four differ" badly,
 *   and the second question is the one a voter arrives with. So the page is
 *   now a question at a time, with the candidates filed under the answer they
 *   gave — see QuestionRollCall for the form itself.
 *
 * THE ORDER IS THE QUESTIONNAIRE'S
 *   Sections in the order the questions were asked, everything open. Ranking
 *   them by how divided the field is would put the interesting ones on top,
 *   and it would also mean the page reshuffles between wards and between
 *   visits, so a reader who found something cannot find it again. The
 *   questionnaire's own topics are a table of contents that holds still.
 *
 * THE BALLOT IS NOT HERE
 *   The cards name candidates in full but do not link them: a campaign link
 *   per name per question is several hundred outbound links on one page. The
 *   links live once, in the CandidateRoster beside the section heading, where
 *   a reader gets the whole ballot before reading thirty cards about it.
 *
 * `silent` IS A JUDGEMENT THE PAGE MAKES
 *   A ward passes its non-respondents in, and every card names them: the
 *   field is a dozen people and a reader deciding how to vote is owed the
 *   fact that their ballot line said nothing. The mayoral page passes none,
 *   because forty-four names under each of thirty-four questions is fifteen
 *   hundred names saying one thing that the stats row and the roster page
 *   already say once.
 */

/** The id a section heading answers to, and the one the rail scrolls at. */
export function sectionId(stepId: string, prefix?: string): string {
  return prefix ? `${prefix}-${stepId}` : stepId;
}

/** The questionnaire's sections, as the scroll rail wants them.
 *
 * Sections only. Hanging every question off its section was tried and is
 * wrong for this rail: a level-3 entry on a memo is three words of a
 * sub-heading, where a question here is a full sentence — "Should Toronto
 * permit substantially more housing as-of-right in every ward, including
 * areas currently dominated by detached and semi-detached homes?" — and
 * thirty-three of those turn a navigation aid into a second copy of the page
 * you have to read to navigate.
 *
 * The questions still carry their ids, so a deep link into one works and the
 * rail can be given them later if the case for it changes. */
export function questionnaireHeadings(
  groups: ComparedGroup[],
  { prefix }: { prefix?: string } = {},
): Heading[] {
  return groups.map((group) => ({
    id: sectionId(group.stepId, prefix),
    text: group.stepTitle,
    level: 2 as const,
  }));
}

export function QuestionnaireCards({
  groups,
  respondents,
  silent,
  issuesHref,
  seats,
  notes = true,
  yourKey,
  idPrefix,
}: {
  groups: ComparedGroup[];
  /** the candidates who returned the questionnaire */
  respondents: GridCandidate[];
  /** on the ballot, and yet to */
  silent: GridCandidate[];
  /** the whole city's answers, where this election has that page */
  issuesHref?: string;
  /** the seat each candidate is running for, keyed by candidate key — see
   *  QuestionRollCall. Only the city-wide page passes one. */
  seats?: Record<string, Seat>;
  /** print each candidate's own words about their answer — see
   *  QuestionRollCall. The city-wide page turns them off. */
  notes?: boolean;
  /** the reader's own row, where they have answered the same questionnaire —
   *  see QuestionRollCall. */
  yourKey?: string;
  /** namespaces the section headings' ids. A page showing one questionnaire
   *  needs none; the survey results show two, a mayoral race and a ward one,
   *  built from the same question set — without a prefix both would put an
   *  element called "housing" in the document and the scroll rail would only
   *  ever find the first. */
  idPrefix?: string;
}) {
  const silentNames = silent.map((candidate) => ({
    key: candidate.key,
    name: candidate.name,
  }));

  return (
    /* Sections sit well apart. The cards inside one are a gap-4 grid, so a
       section break that was only a little wider read as another row of the
       same grid rather than a change of subject. */
    <div className="grid gap-12">
      {groups.map((group) => (
        <section key={group.stepId} className="grid gap-4 scroll-mt-24">
          {/* The rule that opens a section, on one line. Five headings should
              not be five screens — but they do have to sit above the question
              headings inside the cards, which sit above the answer titles
              inside those, so the three are set a step apart. */}
          <h2
            id={sectionId(group.stepId, idPrefix)}
            className="scroll-mt-24 border-b border-border-light pb-2 font-sans font-medium leading-none tracking-[-0.03em] text-[1.8rem]"
          >
            {group.stepTitle}
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {group.questions.map((question) => (
              <QuestionRollCall
                key={question.questionId}
                question={question}
                silent={silentNames}
                nameTheSilent={respondents.length > 0}
                headingId={sectionId(question.questionId, idPrefix)}
                seats={seats}
                notes={notes}
                yourKey={yourKey}
              />
            ))}
          </div>
        </section>
      ))}

      <WardAnswerNote issuesHref={issuesHref} notes={notes} />
    </div>
  );
}

/* How to read the blocks above. Short, because the form is nearly
 * self-explanatory now — what it still has to say is what is NOT on the page:
 * the options nobody picked, and the candidates who are not in any group. */
function WardAnswerNote({
  issuesHref,
  notes,
}: {
  issuesHref?: string;
  notes?: boolean;
  /** the reader's own row, where they have answered the same questionnaire —
   *  see QuestionRollCall. */
  yourKey?: string;
  /** namespaces the section headings' ids. A page showing one questionnaire
   *  needs none; the survey results show two, a mayoral race and a ward one,
   *  built from the same question set — without a prefix both would put an
   *  element called "housing" in the document and the scroll rail would only
   *  ever find the first. */
  idPrefix?: string;
}) {
  return (
    <div className="grid gap-2 border-t border-border-light pt-4">
      <p className="type-label-sm text-text-muted text-pretty">
        Candidates are grouped by the answer they gave. Options nobody in this
        ward picked are not shown, and a candidate who answered in their own
        words sits on no option.
        {notes ? " Notes are the candidates’ own words." : ""}
      </p>
      {issuesHref && (
        <Link
          href={issuesHref}
          className="type-label-sm inline-flex items-center gap-1.5 text-accent transition-colors hover:text-dark"
        >
          How the whole city answered
          <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
