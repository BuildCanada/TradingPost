"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Select } from "@/components/ui/select";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { QuestionnaireCards } from "@/components/elections/QuestionnaireCards";
import type { Seat } from "@/components/elections/QuestionRollCall";
import { AgreementChart } from "./AgreementChart";
import {
  byCandidateKey,
  candidateAnswers,
  comparedQuestions,
  questionnaireShape,
  surveyRoster,
} from "@/lib/elections/candidate-answers";
import { lastName } from "@/lib/elections/names";
import type { CandidateSurveyResponse } from "@/lib/elections/alignment";
import type { Survey } from "@/lib/elections/survey";
import type { Alignment, CandidateScore } from "@/lib/elections/alignment";

/* Alignment between one resident's answers and their ward's candidates.
 *
 * FORM
 *   The same grid the ward and mayoral pages draw, with one column added: the
 *   reader's own. Questions run down, candidates run across, and "You" is the
 *   first column, next to the question and pinned beside it — so the
 *   comparison the page exists to make is two cells on one line rather than
 *   two blocks a scroll apart.
 *
 *   It was a block per question, with the ward's candidates filed under the
 *   option each picked and the reader's own pick badged among them. That read
 *   well for one question and did not compose: the reader's answer was
 *   restated thirty times, and the candidates who never returned the
 *   questionnaire — most of a ward's ballot, most of the campaign — were
 *   nowhere on the page, so a reader could not tell a candidate who disagreed
 *   with them from one who had said nothing at all. The grid has a column for
 *   both, and says which is which in every row.
 *
 *   The ranked list stays. "Who is closest to me" is the question that brought
 *   the reader here, and it is an answer no grid gives at a glance.
 */

/** A candidate on the ward's ballot, as the responses route hands them over. */
export type SurveyRosterCandidate = {
  key: string;
  name: string;
  website?: string;
  withdrawn?: boolean;
};

/* The reader, as the cards name them. Named as the questionnaire would name a
   candidate, because that is exactly what they are to the pivot — a respondent
   with answers, run through the same code as everyone else's. */
const YOU = "You";

/* How the agreement chart is ordered.
 *
 * The cards below it are not sorted by this and should not be: a card files
 * its candidates under the answer they gave, and inside a group they run by
 * surname so a reader finds the same person in the same place on all thirty
 * questions. A ranking belongs in the thing that is a ranking.
 *
 * Agreement first by default: the reader has just answered thirty questions,
 * and "who is closest to me" is the question that brought them here. The rest
 * are the orders a reader actually asks for next — the opposite end of the
 * same list, someone they already have a name for, and who put the most on
 * the record. */
const SORTS = [
  { value: "agreement", label: "Most in common with you" },
  { value: "disagreement", label: "Least in common with you" },
  { value: "answered", label: "Most questions answered" },
  { value: "name", label: "Name (A–Z)" },
] as const;

type Sort = (typeof SORTS)[number]["value"];

function sortScores(scores: CandidateScore[], sort: Sort): CandidateScore[] {
  const byName = (a: CandidateScore, b: CandidateScore) =>
    lastName(a.candidateName).localeCompare(lastName(b.candidateName)) ||
    a.candidateName.localeCompare(b.candidateName);

  /* A candidate with nothing comparable has no share to rank on — a null is
     not a zero, and sorting it as one would put "we cannot say" among the
     people who disagree with you. They go last either way. */
  const share = (score: CandidateScore) => score.share ?? -1;

  return [...scores].sort((a, b) => {
    switch (sort) {
      case "agreement":
        return share(b) - share(a) || byName(a, b);
      case "disagreement":
        return (
          (a.share === null ? 1 : 0) - (b.share === null ? 1 : 0) ||
          share(a) - share(b) ||
          byName(a, b)
        );
      case "answered":
        return b.compared - a.compared || share(b) - share(a) || byName(a, b);
      case "name":
        return byName(a, b);
    }
  });
}

/** One ballot a voter marks: the race, its candidates, and how the reader
 *  lines up with them. */
export type RaceComparison = {
  key: string;
  /** e.g. "For mayor" or "Ward 9 — Davenport" */
  label: string;
  alignment: Alignment;
  /** that race's published responses, as fetched */
  responses: CandidateSurveyResponse[];
  /** everyone on that ballot, respondents or not */
  roster: SurveyRosterCandidate[];
};

export default function AlignmentResults({
  races,
  survey,
  answers,
}: {
  /** in ballot order — mayor first, then the ward */
  races: RaceComparison[];
  survey: Survey;
  /** the reader's own answers, by question id */
  answers: Record<string, string>;
}) {
  const shown = races.filter(
    (race) => race.alignment.scores.length > 0 && race.alignment.rows.length > 0,
  );
  if (shown.length === 0) return null;

  /* No heading of its own. Once the answers are in, the page is this
     comparison and nothing else, so the card's masthead says so — a second
     title under the first was two announcements of one thing, with an accent
     rule and a rule-off between them. What the masthead carries now used to
     live here: see `SurveyClient`. */
  return (
    <section className="min-w-0 px-6 pt-10 pb-14 md:px-10">
      <div className="grid min-w-0 gap-10">
        {shown.map((race) => (
          <RaceBlock
            key={race.key}
            race={race}
            survey={survey}
            answers={answers}
          />
        ))}
      </div>

      {/* One note for the whole page rather than one under every grid: it is
          the same reading in both races. */}
      <p className="type-caption mt-10 max-w-[78ch] border-t border-border-light pt-4 text-text-muted text-pretty">
        <span className="text-text-secondary">Reading these.</span> Every
        candidate on the ballot has a column, whether or not they answered us;
        yours is the first. Open a question for the options in full and what the
        rest of the field said. Counts are out of the candidates who returned
        the questionnaire, not the whole ballot.
      </p>
    </section>
  );
}

/* ── One race: who is closest, then everyone question by question ─── */

function RaceBlock({
  race,
  survey,
  answers,
}: {
  race: RaceComparison;
  survey: Survey;
  answers: Record<string, string>;
}) {
  const [sort, setSort] = useState<Sort>("agreement");
  const scores = useMemo(
    () => sortScores(race.alignment.scores, sort),
    [race.alignment.scores, sort],
  );

  /* The cards, and the reader inside them.
     `candidateAnswers` does the pivoting for both — the reader is passed
     through it as a response of their own, so their answers are built by the
     same code that builds everyone else's and cannot disagree with them. */
  const grid = useMemo(() => {
    const entries = candidateAnswers(survey, race.responses);
    const byKey = byCandidateKey(entries);
    const field = surveyRoster<SurveyRosterCandidate>(
      race.roster.length > 0
        ? race.roster
        : entries.map((entry) => ({
            key: entry.key,
            name: entry.candidateName,
          })),
      byKey,
    );

    const [you] = candidateAnswers(survey, [
      {
        candidateName: YOU,
        ward: "",
        surveySlug: survey.slug,
        surveyVersion: "",
        answers,
        explanations: {},
        source: "form" as const,
      },
    ]);

    /* Every name the cards can print, the reader first. The order here is
       only the order the pivot hands the rows over in — inside a card the
       candidates are filed under the answer they gave and sorted by surname,
       so a reader looking for one person finds them in the same place on all
       thirty questions. The agreement sort above drives the chart, which is
       where a ranking belongs: it is a ranking. */
    const candidates = [
      ...(you ? [{ key: you.key, name: YOU }] : []),
      ...field.map(({ key, name, website }) => ({ key, name, website })),
    ];

    /* The ballot line each plate belongs to.

       A race block is one race, so its heading already says which — but the
       two blocks sit one under the other on a page a reader scrolls through
       with a candidate's name in mind, and a plate that says only a name is
       a plate whose race depends on remembering which heading you passed.
       Every plate carries its own. The reader's own plate carries none: they
       are not running for anything. */
    const seat: Seat =
      race.key === "mayor"
        ? { race: "mayor", label: "Mayor" }
        : { race: "councillor", label: "Councillor" };
    const seats = Object.fromEntries(
      field.map((candidate) => [candidate.key, seat]),
    );

    return {
      yourKey: you?.key,
      seats,
      /* The reader counts as a respondent: they answered the questionnaire,
         which is the whole reason there is a page. */
      respondents: [
        ...(you ? [{ key: you.key, name: YOU }] : []),
        ...field.filter((candidate) => candidate.answers),
      ],
      silent: field
        .filter((candidate) => !candidate.answers)
        .map(({ key, name, website }) => ({ key, name, website })),
      groups: comparedQuestions(
        you ? [you, ...entries] : entries,
        candidates,
        questionnaireShape(survey, race.responses),
      ),
    };
  }, [survey, answers, race.key, race.responses, race.roster]);

  /* Both races open to begin with. A reader who has just answered thirty
     questions is owed the answer to them, not two closed doors — the fold is
     here so they can put one ballot away while they read the other, which is
     a different thing from making them ask for either. */
  return (
    <Collapsible defaultOpen className="min-w-0">
      <CollapsibleTrigger className="group/race flex w-full items-baseline gap-3 border-t-2 border-dark pt-3 pb-4 text-left transition-colors">
        <h3 className="flex-1 font-sans font-medium leading-[1.15] tracking-[-0.025em] text-[clamp(1.3rem,2vw,1.6rem)] text-dark transition-colors group-hover/race:text-accent">
          {race.label}
        </h3>
        {/* What is behind the fold, so a closed race still says whether it
            is worth opening. */}
        <span className="type-label-sm flex-none text-text-muted">
          {race.alignment.scores.length} answered
        </span>
        <ChevronDown
          className="size-4 flex-none text-text-muted transition-[transform,color] group-hover/race:text-accent group-data-[panel-open]:rotate-180"
          aria-hidden="true"
        />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label
            htmlFor={`sort-${race.key}`}
            className="type-label-sm text-text-muted"
          >
            Order the chart by
          </label>
          <Select
            id={`sort-${race.key}`}
            value={sort}
            onValueChange={(value) => setSort(value as Sort)}
            options={SORTS.map((option) => ({ ...option }))}
            className="max-w-[280px]"
          />
        </div>

        <div className="mb-8">
          <AgreementChart alignment={race.alignment} scores={scores} />
        </div>

        <QuestionnaireCards
          groups={grid.groups}
          respondents={grid.respondents}
          silent={grid.silent}
          seats={grid.seats}
          notes={false}
          yourKey={grid.yourKey}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}
