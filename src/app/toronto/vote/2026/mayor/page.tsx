import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SurveyGrid } from "@/components/elections/SurveyGrid";
import { SurveyCta } from "@/components/elections/SurveyCta";
import { SurveyChartNote } from "@/components/elections/CandidateSurveyAnswers";
import CountdownDays from "@/components/elections/CountdownDays";
import {
  comparedQuestions,
  surveyRoster,
} from "@/lib/elections/candidate-answers";
import { daysUntil } from "@/lib/elections/dates";
import { rosterSurvey } from "@/lib/elections/survey-answers";
import { ELECTION, getToronto2026 } from "../data";

/* The mayoral field's questionnaire, read across.
 *
 * The same page as a ward's, for the one race every voter in the city votes
 * in: every candidate for mayor is a column, every question a row, and a
 * candidate who never wrote back says so in every one of them. It lives on its
 * own route rather than on the landing page because the grid is the size of a
 * questionnaire — thirty-odd questions by a field of candidates — and the
 * landing page's job is to point at races, not to hold one.
 */

export const metadata: Metadata = {
  title: "How the mayoral candidates answered",
  description:
    "Every candidate for Mayor of Toronto in the October 26, 2026 election, and how they answered our questionnaire — question by question, side by side.",
  alternates: { canonical: `${ELECTION.basePath}/mayor` },
  openGraph: {
    title: "How the mayoral candidates answered — Toronto 2026 Election",
    description:
      "Every candidate for Mayor of Toronto, and how they answered our questionnaire.",
    type: "website",
  },
};

export default async function MayorPage() {
  const view = await getToronto2026();

  const roster = surveyRoster(view.mayoral);
  const { answers, shape } = await rosterSurvey(
    ELECTION.slug,
    new Set(roster.map((candidate) => candidate.key)),
  );

  const candidates = surveyRoster(view.mayoral, answers);
  const respondents = candidates.filter((candidate) => candidate.answers);
  const groups = comparedQuestions(
    respondents.map((candidate) => candidate.answers!),
    candidates,
    shape,
  );

  return (
    <div className={`${ELECTION.themeClass ?? ""} bg-bg text-dark`}>
      <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
        {/* ── Breadcrumb ─────────────────────────────────────── */}
        <div className="px-6 md:px-14 py-5 border-b border-border-light type-label-sm !tracking-[0.1em] flex items-center gap-2.5">
          <Link
            href={`${ELECTION.basePath}#candidates`}
            className="text-text-secondary hover:text-accent transition-colors"
          >
            Toronto 2026
          </Link>
          <span className="text-border-light">/</span>
          <span>Mayor</span>
        </div>

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="px-6 py-12 md:px-14 md:py-14 border-b-2 border-dark">
          <p className="type-label text-accent mb-5">City of Toronto</p>
          <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(2.75rem,6vw,5rem)] max-w-[16ch] text-balance mb-6">
            Candidates for Mayor
          </h1>
          <p className="font-serif text-[1.15rem] leading-[1.5] text-dark/85 max-w-[62ch] text-pretty">
            The one race every Toronto voter votes in. {candidates.length}{" "}
            candidates have registered for it.
          </p>
        </section>

        {/* ── Key stats ──────────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-3 border-b-2 border-dark">
          <div className="px-6 py-7 md:px-14 border-r border-b md:border-b-0 border-border-light">
            <div className="font-sans font-semibold text-[2.75rem] leading-none tracking-[-0.03em] tabular-nums">
              {candidates.length}
            </div>
            <div className="type-label-sm !tracking-[0.1em] text-text-secondary mt-2.5">
              Candidates registered
            </div>
          </div>
          <div className="px-6 py-7 md:px-14 md:border-r border-b md:border-b-0 border-border-light">
            <CountdownDays
              initialDays={daysUntil(ELECTION.electionDateIso)}
              targetIso={ELECTION.electionDateIso}
              className="font-sans font-semibold text-[2.75rem] leading-none tracking-[-0.03em] tabular-nums"
            />
            <div className="type-label-sm !tracking-[0.1em] text-text-secondary mt-2.5">
              Days until polls open
            </div>
          </div>
          <div className="px-6 py-7 md:px-14 col-span-2 md:col-span-1">
            <div className="flex items-end h-[2.75rem]">
              <div className="font-sans font-semibold text-[1.75rem] leading-none tracking-[-0.03em]">
                {ELECTION.electionDayLabel}
              </div>
            </div>
            <div className="type-label-sm !tracking-[0.1em] text-text-secondary mt-2.5">
              Election day
            </div>
          </div>
        </section>

        {/* ── Questionnaire ──────────────────────────────────── */}
        <section id="questionnaire">
          <div className="px-6 md:px-14 pt-11 pb-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-12">
            <div>
              <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.75rem,3vw,2.5rem)] max-w-[24ch] text-balance">
                Know Your Candidates
              </h2>
              <p className="mt-5 font-serif text-[1.08rem] leading-[1.5] text-dark/85 max-w-[64ch] text-pretty">
                {candidates.length === 0
                  ? "No one has registered for mayor yet."
                  : respondents.length === 0
                    ? "No one running for mayor has answered yet. These are the questions we asked."
                    : `${respondents.length} of ${candidates.length} candidates for mayor answered our questionnaire. Open a question to see every option and what the rest of the field said.`}
              </p>
            </div>

            <SurveyCta href={`${ELECTION.basePath}/survey`} />
          </div>

          <div className="px-6 md:px-14 pb-10">
            {groups.length > 0 ? (
              <SurveyGrid
                groups={groups}
                candidates={candidates}
                election={ELECTION.slug}
                race="mayor"
              />
            ) : (
              /* Only two ways to get here: nobody has registered, or the
                 questionnaire itself could not be fetched. Either way there is
                 no grid to draw, and the candidates are still worth naming. */
              <p className="font-serif text-[1.05rem] leading-[1.5] text-dark/80 max-w-[62ch] text-pretty">
                {candidates.length === 0
                  ? "No one has registered for mayor yet."
                  : `On the ballot, and yet to respond to us: ${candidates
                      .map((candidate) => candidate.name)
                      .join(", ")}.`}
              </p>
            )}
          </div>

          <div className="px-6 md:px-14 py-4 border-t border-border-light grid gap-2.5">
            {respondents.length > 0 && (
              <SurveyChartNote candidateCount={respondents.length} />
            )}
            <p className="type-label-sm text-text-muted">
              Registered candidates from the City Clerk&rsquo;s list, less
              anyone who has withdrawn. The field is not final until nominations
              close
              {view.nominationCloseLabel
                ? ` on ${view.nominationCloseLabel}`
                : ""}
              .
            </p>
          </div>
        </section>

        {/* ── Back to the wards ──────────────────────────────── */}
        <section className="border-t border-dark">
          <Link
            href={`${ELECTION.basePath}#wards`}
            className="group px-6 md:px-14 py-7 flex items-center gap-2.5 transition-colors hover:bg-linen-50"
          >
            <ArrowLeft className="size-3.5 text-text-secondary" />
            <span className="font-sans font-medium text-[1.25rem] tracking-[-0.015em]">
              Find your ward
            </span>
          </Link>
        </section>
      </div>
    </div>
  );
}
