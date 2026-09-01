"use client";

import { useMemo } from "react";

import { SurveyGrid } from "@/components/elections/SurveyGrid";
import {
  byCandidateKey,
  candidateAnswers,
  comparedQuestions,
  questionnaireShape,
  surveyRoster,
} from "@/lib/elections/candidate-answers";
import { DEFAULT_ELECTION_SLUG } from "@/lib/elections/registry";
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

/* The reader's own column. Named as the questionnaire would name a candidate,
   because that is exactly what it is to the grid — a respondent with answers,
   pivoted by the same code as everyone else's. */
const YOU = "You";

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
  wardLabel,
  survey,
  answers,
}: {
  /** in ballot order — mayor first, then the ward */
  races: RaceComparison[];
  /** e.g. "Ward 9 — Davenport"; the ward is a postal-code guess, not a fact */
  wardLabel: string;
  survey: Survey;
  /** the reader's own answers, by question id */
  answers: Record<string, string>;
}) {
  const shown = races.filter(
    (race) => race.alignment.scores.length > 0 && race.alignment.rows.length > 0,
  );
  if (shown.length === 0) return null;

  return (
    <section className="min-w-0 border-t border-border-light px-6 pt-14 pb-16 md:px-10">
      <div className="mb-7 h-0.5 w-10 bg-accent" />
      <h2 className="mb-3 font-sans font-medium leading-[1.05] tracking-[-0.015em] text-[clamp(1.5rem,3.5vw,2rem)] text-balance">
        How your answers compare
      </h2>
      {/* Two ballots, so two comparisons. A voter marks a councillor and a
          mayor separately, and a page that answered only for the ward would be
          answering the smaller half of the question they came with. */}
      <p className="type-body-sm mb-2 text-text-secondary text-pretty">
        You vote twice: once for your councillor, once for mayor. Candidates in
        both races answered the same questions you just did.
      </p>
      {/* The ward comes from a postal-code lookup, whose stored point is the
          centroid of a delivery area — a code on a ward line can resolve to the
          neighbour. Said plainly rather than presented as settled. */}
      <p className="type-caption mb-10 text-text-muted text-pretty">
        We placed you in {wardLabel} from your postal code. That is a best
        guess, not a certainty, for codes that straddle a ward boundary.
      </p>

      <div className="grid min-w-0 gap-14">
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
  /* The grid's columns and rows: the reader first, then the field.
     `candidateAnswers` does the pivoting for both — the reader is passed
     through it as a response of their own, so their column is built by the
     same code that builds everyone else's and cannot disagree with it. */
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

    const candidates = [
      ...(you ? [{ key: you.key, name: YOU }] : []),
      ...field.map(({ key, name, website }) => ({ key, name, website })),
    ];

    return {
      yourKey: you?.key,
      candidates,
      groups: comparedQuestions(
        you ? [you, ...entries] : entries,
        candidates,
        questionnaireShape(survey, race.responses),
      ),
    };
  }, [survey, answers, race.responses, race.roster]);

  return (
    <div className="min-w-0">
      <h3 className="border-t-2 border-dark pt-3 mb-4 font-sans font-medium leading-[1.15] tracking-[-0.025em] text-[clamp(1.3rem,2vw,1.6rem)] text-dark">
        {race.label}
      </h3>

      <p className="type-label-sm mb-3 text-text-muted">Closest to you</p>
      <ol className="mb-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {race.alignment.scores.map((score, i) => (
          <li key={score.candidateName}>
            <ScoreRow rank={i + 1} score={score} />
          </li>
        ))}
      </ol>

      <SurveyGrid
        groups={grid.groups}
        candidates={grid.candidates}
        election={DEFAULT_ELECTION_SLUG}
        race={race.key === "mayor" ? "mayor" : "councillor"}
        wardName={race.label}
        yourKey={grid.yourKey}
      />
    </div>
  );
}

/* ── One candidate, one line: how close, out of how many ─────── */

function ScoreRow({ rank, score }: { rank: number; score: CandidateScore }) {
  const percent = score.share === null ? null : Math.round(score.share * 100);

  return (
    <div className="grid h-full gap-2 border border-border-light px-4 py-3.5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="type-label-sm tabular-nums text-text-muted">
          {rank}
        </span>
        <h4 className="flex-1 font-sans text-[1.05rem] font-medium tracking-[-0.01em] text-dark">
          {score.candidateName}
        </h4>
        <span className="font-sans text-[1.05rem] font-medium tabular-nums text-dark">
          {percent === null ? "—" : `${percent}%`}
        </span>
      </div>

      {/* Decorative: the share and the count are both direct-labelled, so the
          bar repeats what the text already says. */}
      <div className="h-1.5 w-full bg-charcoal-200" aria-hidden="true">
        {percent !== null && percent > 0 && (
          <div className="h-1.5 bg-pine-600" style={{ width: `${percent}%` }} />
        )}
      </div>

      <p className="type-caption text-text-secondary">
        {score.compared === 0
          ? "No answers we could compare yet"
          : `Agrees on ${score.agreed} of ${score.compared} questions you both answered`}
        {score.unclear > 0 && ` · ${score.unclear} unclear`}
        {score.unanswered > 0 && ` · ${score.unanswered} unanswered`}
      </p>
    </div>
  );
}
