import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import type { Heading } from "@/components/custom/signpost/config";
import type { GridCandidate } from "./SurveyGrid";
import { QuestionRollCall } from "./QuestionRollCall";
import { QuestionSplit } from "./QuestionSplit";
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
 * TWO CARDS, CHOSEN BY THE SIZE OF THE FIELD
 *   A race's own page names names: four candidates under a question is the
 *   comparison the reader came for. The city-wide page puts the same question
 *   to thirty-odd people across a mayoral race and two dozen wards, and the
 *   names there are neither a comparison nor a ballot the reader can act on —
 *   they are several hundred plates standing between the reader and the split.
 *   `chart` swaps the roll call for QuestionSplit, which draws the same data
 *   as a share of the field.
 *
 * `silent` IS A JUDGEMENT THE PAGE MAKES
 *   Nobody who reads a card should have to wonder what the rest of the ballot
 *   said — but a name repeated under all thirty-odd questions says it thirty
 *   times and tells a reader once. A ward of one respondent and nine silent
 *   was printing the same nine names on every card: a hundred and forty
 *   characters, identical, thirty-three times, and the longest thing in most
 *   of those cards.
 *
 *   So the race pages pass none, and the CandidateRoster over the section
 *   carries the fact instead — it names the same people, links each to their
 *   own page, and does it before the reader starts on the questions rather
 *   than at the foot of each one. What the cards still name is the other
 *   half of `unanswered`: a candidate who did write back and skipped this
 *   question. That one is per-question and genuinely news.
 *
 *   The survey's own results pass their silent in, having no roster to hand
 *   the job to.
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
  roles,
  ballotSize,
  notes = true,
  printWriting = false,
  yourKey,
  idPrefix,
  answerNote,
  chart = false,
}: {
  groups: ComparedGroup[];
  /** the candidates who returned the questionnaire */
  respondents: GridCandidate[];
  /** on the ballot, and yet to */
  silent: GridCandidate[];
  /** the whole city's answers, where this election has that page */
  issuesHref?: string;
  /** the seat each candidate is running for, keyed by candidate key — see
   *  QuestionRollCall. The split cards took this too and printed it beside
   *  every name in the panel behind a segment; they no longer do, so on the
   *  city-wide page this now reaches nothing. Kept because the same component
   *  draws the roll-call pages, which do print it. */
  seats?: Record<string, Seat>;
  /** what each candidate is on the ballot — "Incumbent", "Challenger" — keyed
   *  by candidate key. See QuestionRollCall. */
  roles?: Record<string, string>;
  /** how many candidates are on the ballot these cards are drawn from, for
   *  the line saying how much of it answered each question. */
  ballotSize?: number;
  /** print each candidate's own words about their answer — see
   *  QuestionRollCall. The city-wide page turns them off. */
  notes?: boolean;
  /** print each row's writing outright rather than putting it behind a
   *  disclosure. A candidate's own page passes it: with a field of one there
   *  is no split to read down, and the writing is the whole of what a card
   *  says. See `printWriting` in QuestionRollCall. */
  printWriting?: boolean;
  /** the reader's own row, where they have answered the same questionnaire —
   *  see QuestionRollCall. */
  yourKey?: string;
  /** namespaces the section headings' ids. A page showing one questionnaire
   *  needs none; the survey results show two, a mayoral race and a ward one,
   *  built from the same question set — without a prefix both would put an
   *  element called "housing" in the document and the scroll rail would only
   *  ever find the first. */
  idPrefix?: string;
  /** replaces the sentence at the foot explaining how to read the cards. The
   *  default is written for a race — "options nobody in this ward picked are
   *  not shown" — and a page whose cards hold a single candidate has a
   *  different thing to say about what is missing from them. */
  answerNote?: ReactNode;
  /** draw each question as a band of the field's split rather than a roll
   *  call of names — see QuestionSplit. The city-wide page turns it on; a
   *  race's own page never should. */
  chart?: boolean;
}) {
  const silentNames = silent.map((candidate) => ({
    key: candidate.key,
    name: candidate.name,
  }));

  /* Faces for the rows, keyed the way `seats` and `roles` are. Built here
     rather than asked of the caller: every page already hands this component
     its whole roster, and the portrait is two fields of it. Where a roster
     carries neither a photograph nor a monogram — the city-wide page, whose
     names come from the responses and not from the ballot — the map is empty
     and the rows print as they always did. */
  const portraits = Object.fromEntries(
    [...respondents, ...silent]
      .filter((candidate) => candidate.image || candidate.initials)
      .map((candidate) => [
        candidate.key,
        {
          name: candidate.name,
          image: candidate.image,
          initials: candidate.initials,
        },
      ]),
  );

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
          {/* Two to a row from 1166px, both kinds of card.

              The roll call went to one card a row when it was panels of
              quotes, which needed the width. It is a table of rows now with
              the writing folded away, so a card is a handful of short lines
              and two of them sit side by side without crowding — and thirty-
              three full-width cards was a great deal of scrolling for a page
              a reader is meant to compare across. The rows inside size
              themselves against the card rather than the window, so they lay
              out correctly at half width. */}
          <div
            className={`grid grid-cols-1 gap-4 lg:grid-cols-2 ${
              /* A third column for the charts, and only for them. A band and a
                 legend read fine narrow, where a roll call is a table whose
                 answer column already runs to ninety characters.

                 From 1280 rather than from 1166, because the scroll rail
                 arrives at 1200 and takes 268 pixels with it: splitting three
                 ways at 1166 would hand the cards their narrowest width at the
                 moment they multiplied. At 1280 a card is about 280 pixels,
                 at 1440 about 336. */
              chart ? "xl:grid-cols-3" : ""
            }`}
          >
            {group.questions.map((question) =>
              chart ? (
                <QuestionSplit
                  key={question.questionId}
                  question={question}
                  headingId={sectionId(question.questionId, idPrefix)}
                />
              ) : (
                <QuestionRollCall
                  key={question.questionId}
                  question={question}
                  silent={silentNames}
                  nameTheSilent={respondents.length > 0}
                  headingId={sectionId(question.questionId, idPrefix)}
                  seats={seats}
                  roles={roles}
                  portraits={portraits}
                  ballotSize={ballotSize}
                  notes={notes}
                  printWriting={printWriting}
                  yourKey={yourKey}
                />
              ),
            )}
          </div>
        </section>
      ))}

      <WardAnswerNote
        issuesHref={issuesHref}
        notes={notes}
        note={answerNote}
        silentNamedElsewhere={silentNames.length === 0}
      />
    </div>
  );
}

/* How to read the blocks above. Short, because the form is nearly
 * self-explanatory now — what it still has to say is what is NOT on the page:
 * the options nobody picked, and the candidates who are not in any group. */
function WardAnswerNote({
  issuesHref,
  notes,
  note,
  silentNamedElsewhere,
}: {
  issuesHref?: string;
  notes?: boolean;
  /**
   * The cards are not naming the candidates who never wrote back, because a
   * roster above them already has. True where the caller passes no `silent`
   * and stands a CandidateRoster over the section — the ward pages and the
   * mayoral one. The survey's own results have neither, so they keep naming
   * the silent on each card and this sentence would be a direction to
   * somewhere that is not there.
   */
  silentNamedElsewhere?: boolean;
  /** an override for the sentence — see `answerNote` */
  note?: ReactNode;
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
        {note ?? (
          <>
            Candidates are grouped by the answer they gave. Options nobody in
            this ward picked are not shown, and a candidate who answered in
            their own words sits on no option.
            {notes ? " Notes are the candidates’ own words." : ""}
            {silentNamedElsewhere
              ? " Candidates who have not returned the questionnaire are named at the top of this section."
              : ""}
          </>
        )}
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
