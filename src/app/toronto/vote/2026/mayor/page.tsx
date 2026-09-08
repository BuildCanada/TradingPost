import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { CandidateRoster } from "@/components/elections/CandidateRoster";
import { QuestionnaireCards } from "@/components/elections/QuestionnaireCards";
import { SurveyCta } from "@/components/elections/SurveyCta";
import CountdownDays from "@/components/elections/CountdownDays";
import {
  byCandidateKey,
  candidateAnswers,
  comparedQuestions,
  questionnaireShape,
  surveyRoster,
} from "@/lib/elections/candidate-answers";
import {
  CANDIDATE_QUESTIONNAIRE_SLUG,
  fetchCandidateResponses,
} from "@/lib/elections/candidate-responses";
import { fetchSurvey } from "@/lib/elections/survey";
import { daysUntil } from "@/lib/elections/dates";
import { ELECTION, getToronto2026 } from "../data";

/* How the mayoral field answered — question first.
 *
 * WHAT THIS PAGE USED TO BE, AND WHY IT CHANGED
 *   A grid: every question a row, every candidate a column, every candidate on
 *   the ballot given a column whether they wrote back or not. That shape is
 *   right for a ward, where a field of four fits across a laptop and an empty
 *   column is a visible fact about a named person.
 *
 *   Toronto's mayoral ballot is fifty-three people. The grid came out 12,558px
 *   wide — thirteen screens of sideways drag — and forty-four of those columns
 *   were empty, because nine candidates answered. The reader had to haul past
 *   forty-four blanks to compare the nine. An empty column stops being a
 *   finding somewhere around the tenth one; after that it is furniture.
 *
 *   So the page turns ninety degrees. The question becomes the object and the
 *   candidates are filed inside it, under the answer each one gave — the same
 *   cards the ward pages use, so the two can never disagree about how a
 *   questionnaire reads. Nine respondents is a comfortable fit: it is a
 *   handful of names under each answer, which is what the form was built for,
 *   where the fifty-three-column grid was thirteen screens of drag.
 *
 *   The forty-four who have not answered are not named on the cards. On a
 *   ward, where the field is a dozen, every card names its silent candidates;
 *   here that would be fifteen hundred names saying one thing. They are on
 *   the roster page, which groups the field by exactly that line, and this
 *   page links to it from the hero and names the count in its stats.
 */

export const metadata: Metadata = {
  title: "How the mayoral candidates answered",
  description:
    "How the candidates for Mayor of Toronto answered our questionnaire in the October 26, 2026 election — question by question, with the whole mayoral field on each one.",
  alternates: { canonical: `${ELECTION.basePath}/mayor` },
  openGraph: {
    title: "How the mayoral candidates answered — Toronto 2026 Election",
    description:
      "Every answer the mayoral field gave us, read question by question.",
    type: "website",
  },
};

export default async function MayorPage() {
  const [view, survey, responses] = await Promise.all([
    getToronto2026(),
    fetchSurvey(ELECTION.slug, CANDIDATE_QUESTIONNAIRE_SLUG).catch(() => null),
    fetchCandidateResponses(ELECTION.slug),
  ]);

  /* The ballot line, and the part of it that wrote back.

     The whole election's responses come back from one fetch — the counts a
     candidate's answer is measured against are the field's, not this race's —
     and the roster narrows who gets named, exactly as the ward pages do. */
  const ballot = view.mayoral.filter((candidate) => !candidate.withdrawn);
  const registered = ballot.length;

  const ballotKeys = new Set(ballot.map((candidate) => candidate.key));
  const answers = survey
    ? byCandidateKey(
        candidateAnswers(survey, responses).filter((entry) =>
          ballotKeys.has(entry.key),
        ),
      )
    : {};
  const roster = surveyRoster(ballot, answers);
  const mayoral = roster.filter((candidate) => candidate.answers);
  const groups = comparedQuestions(
    mayoral.map((candidate) => candidate.answers!),
    mayoral,
    survey ? questionnaireShape(survey, responses) : undefined,
  );
  const questionCount = groups.reduce(
    (n, group) => n + group.questions.length,
    0,
  );

  return (
    <div className={`${ELECTION.themeClass ?? ""} bg-bg text-dark`}>
      <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
        {/* ── Breadcrumb ─────────────────────────────────────── */}
        <div className="px-6 md:px-14 py-4 border-b border-border-light type-label-sm !tracking-[0.1em] flex items-center gap-2.5">
          <Link
            href={ELECTION.basePath}
            className="text-text-secondary hover:text-accent transition-colors"
          >
            Toronto 2026
          </Link>
          <span className="text-border-light">/</span>
          <span>Mayor</span>
        </div>

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="px-6 py-8 md:px-14 md:py-10 border-b-2 border-dark">
          <p className="type-label text-accent mb-3.5">City of Toronto</p>
          <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(2.25rem,4.5vw,3.75rem)] max-w-[17ch] text-balance mb-4">
            How the mayoral field answered
          </h1>
          <p className="font-serif text-[1.05rem] leading-[1.5] text-dark/85 max-w-[58ch] text-pretty">
            {mayoral.length > 0
              ? `${mayoral.length} of the ${registered} candidates for mayor returned our questionnaire. Their answers, question by question — the mayoral field on each one.`
              : `No one running for mayor has answered our questionnaire yet. ${registered} candidates have registered for the race.`}
          </p>
          <Link
            href={`${ELECTION.basePath}/mayor/candidates`}
            className="group/roster mt-5 type-label-sm text-accent hover:underline inline-flex items-center gap-1.5"
          >
            Every candidate for mayor
            <ArrowRight className="size-3.5 transition-transform group-hover/roster:translate-x-0.5" />
          </Link>
        </section>

        {/* ── Key stats ──────────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 border-b-2 border-dark">
          <Stat value={mayoral.length} label="Answered us" />
          <Stat value={registered} label="On the ballot" />
          <Stat value={questionCount} label="Policy questions" />
          <div className="px-6 py-4 md:px-14 border-b md:border-b-0 border-border-light">
            <CountdownDays
              initialDays={daysUntil(ELECTION.electionDateIso)}
              targetIso={ELECTION.electionDateIso}
              className="font-sans font-semibold text-[2rem] leading-none tracking-[-0.03em] tabular-nums"
            />
            <div className="type-label-sm !tracking-[0.1em] text-text-secondary mt-1.5">
              Days until polls open
            </div>
          </div>
        </section>

        {/* ── The field, question by question ────────────────── */}
        {groups.length > 0 && mayoral.length > 0 ? (
          <section className="px-6 md:px-14 py-9 md:py-11 border-b-2 border-dark grid gap-9">
            {/* The nine who answered, named and linked once. The forty-four
                who have not are on the roster page, which groups the field by
                exactly that line — naming them here, on each of thirty-four
                cards, would bury the nine. */}
            <CandidateRoster
              respondents={mayoral}
              silent={[]}
              election={ELECTION.slug}
              race="mayor"
            />
            <QuestionnaireCards
              groups={groups}
              respondents={mayoral}
              silent={[]}
              issuesHref={`${ELECTION.basePath}/issues`}
            />
          </section>
        ) : (
          <section className="px-6 md:px-14 py-14 border-b-2 border-dark">
            <p className="font-serif text-[1.05rem] leading-[1.5] text-dark/80 max-w-[58ch] text-pretty">
              No answers from the mayoral field have been published yet.
              Responses appear here as they are reviewed and released.
            </p>
          </section>
        )}

        {/* ── Your turn ──────────────────────────────────────── */}
        <section className="px-6 md:px-14 py-9 md:py-10 border-t-2 border-dark grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.6rem,2.6vw,2.1rem)] max-w-[20ch] text-balance">
              Now answer them yourself
            </h2>
            <p className="mt-3.5 font-serif text-[1.05rem] leading-[1.5] text-dark/85 max-w-[56ch] text-pretty">
              These are the same questions we put to the field. Answer them and
              see which candidates line up with you.
            </p>
          </div>
          <SurveyCta href={`${ELECTION.basePath}/survey`} />
        </section>

        {/* ── Method ─────────────────────────────────────────── */}
        <section className="px-6 md:px-14 py-4 border-t border-border-light grid gap-2">
          <p className="type-label-sm text-text-muted max-w-[80ch] text-pretty">
            Every bar is the mayoral field that answered, one cell per
            candidate: filled with the option that candidate picked, hollow
            where they did not answer that question. Candidates who never
            returned the questionnaire are not in these counts — they are on the
            roster. Open a card for the names behind the bars and what each of
            them wrote, published verbatim.
          </p>
          <p className="type-label-sm text-text-muted max-w-[80ch] text-pretty">
            Registered candidates come from the City Clerk&rsquo;s list, less
            anyone who has withdrawn. The field is not final until nominations
            close
            {view.nominationCloseLabel
              ? ` on ${view.nominationCloseLabel}`
              : ""}
            .
          </p>
        </section>

        {/* ── Elsewhere ──────────────────────────────────────── */}
        <section className="border-t border-dark grid md:grid-cols-2">
          <Link
            href={`${ELECTION.basePath}/issues`}
            className="group px-6 md:px-14 py-6 flex items-center justify-between gap-4 transition-colors hover:bg-linen-50"
          >
            <span className="font-sans font-medium text-[1.15rem] tracking-[-0.015em]">
              The whole field, mayoral and council
            </span>
            <ArrowRight className="size-4 flex-none text-text-secondary transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href={`${ELECTION.basePath}#wards`}
            className="group px-6 md:px-14 py-6 flex items-center gap-2.5 border-t md:border-t-0 md:border-l border-border-light transition-colors hover:bg-linen-50"
          >
            <ArrowLeft className="size-3.5 text-text-secondary" />
            <span className="font-sans font-medium text-[1.15rem] tracking-[-0.015em]">
              Find your ward
            </span>
          </Link>
        </section>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="px-6 py-4 md:px-14 border-r border-b md:border-b-0 border-border-light">
      <div className="font-sans font-semibold text-[2rem] leading-none tracking-[-0.03em] tabular-nums">
        {value}
      </div>
      <div className="type-label-sm !tracking-[0.1em] text-text-secondary mt-1.5">
        {label}
      </div>
    </div>
  );
}
