import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import CountdownDays from "./CountdownDays";
import { CandidateRoster } from "./CandidateRoster";
import {
  QuestionnaireCards,
  questionnaireHeadings,
} from "./QuestionnaireCards";
import { QuestionnaireRail } from "./QuestionnaireRail";
import { SurveyCta } from "./SurveyCta";
import { surveyHref } from "@/lib/elections/registry";
import { IncumbentBadge } from "./ElectionLanding";
import { CandidateNameLink } from "./CandidateNameLink";
import { WardProfileSection, type WardProfile } from "./WardProfile";
import {
  comparedQuestions,
  surveyRoster,
} from "@/lib/elections/candidate-answers";
import type {
  CandidateAnswers,
  ComparedGroup,
} from "@/lib/elections/candidate-answers";
import { daysUntil } from "@/lib/elections/dates";
import type { SupportedElection } from "@/lib/elections/registry";
import type {
  CandidateView,
  RaceView,
  WardDetail as WardDetailData,
} from "@/lib/elections/election-data";

/* One ward's page, shared by every region.

   What a ward elects differs by city and the page follows: Toronto and
   Hamilton each elect a single councillor, so the candidates list reads
   straight down with no race heading; Brampton elects both a city and a
   regional councillor, so each race gets its own heading. School-board races
   the ward votes in follow beneath, where the city maps its trustee wards onto
   city wards (Toronto's don't map, so Toronto shows none). */

export function WardDetail({
  election,
  data,
  nominationCloseLabel,
  wardMapDefs,
  wardMap,
  surveyAnswers,
  surveyShape,
  profile,
}: {
  election: SupportedElection;
  data: WardDetailData;
  /** e.g. "Aug 21, 2026"; null when the city hasn't published it */
  nominationCloseLabel: string | null;
  /** rendered once so the locator map can reference shared geometry */
  wardMapDefs?: ReactNode;
  /** this region's locator map for this ward, when it has ward geometry */
  wardMap?: ReactNode;
  /**
   * Published questionnaire answers for this ward's candidates, keyed by
   * `nameKey`. A candidate with no entry simply shows no answers — for most of
   * the campaign that is most of them.
   */
  surveyAnswers?: Record<string, CandidateAnswers>;
  /**
   * The questionnaire's questions with nobody's answers on them, used where a
   * ward's whole field stayed quiet — there are no returned questionnaires to
   * read the questions off, and a ward of non-respondents still deserves to
   * show which questions they did not answer.
   */
  surveyShape?: ComparedGroup[];
  /**
   * What this ward is, above the race to represent it — a short brief and the
   * Census statistics behind it. Only regions that maintain ward profiles
   * pass one; without it the section is left out entirely.
   */
  profile?: WardProfile;
}) {
  const { ward, wards, councilRaces, trusteeRaces } = data;
  const idx = wards.findIndex((w) => w.number === ward.number);
  const prev = wards[(idx + wards.length - 1) % wards.length];
  const next = wards[(idx + 1) % wards.length];

  // With one council race the heading would only repeat the page title, so the
  // grid runs straight under it — which is how Toronto's page has always read.
  const showRaceHeadings = councilRaces.length > 1;

  /* The whole council ballot, and the part of it that wrote back.

     The questionnaire grid is the ward's candidate list now — there is no
     separate roster of cards above it to agree or disagree with. So its
     columns are every candidate still standing, and one we never heard from is
     a column that says exactly that, which is more use to a voter than a name
     quietly left out of the comparison.

     Withdrawn candidates are the exception, and are dropped: they cannot be
     voted for, so a column of theirs is a column of a ballot line that does
     not exist, and in a grid this wide every column costs the reader a drag. */
  const councilCandidates = councilRaces
    .flatMap((race) => race.candidates)
    .filter((candidate) => !candidate.withdrawn);
  const respondents = councilCandidates.filter(
    (candidate) => surveyAnswers?.[candidate.key],
  );

  return (
    <div className={`${election.themeClass ?? ""} bg-bg text-dark`}>
      <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
        {wardMapDefs}

        {/* ── Breadcrumb ─────────────────────────────────────── */}
        <div className="px-6 md:px-14 py-5 border-b border-border-light type-label-sm !tracking-[0.1em] flex items-center gap-2.5">
          <Link
            href={`${election.basePath}#wards`}
            className="text-text-secondary hover:text-accent transition-colors"
          >
            All wards
          </Link>
          <span className="text-border-light">/</span>
          <span>Ward {ward.n}</span>
        </div>

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="grid md:grid-cols-[1fr_auto] gap-10 md:items-center px-6 py-12 md:px-14 md:py-14 border-b-2 border-dark">
          <div>
            <p className="type-label text-accent mb-5">
              City Council · Ward {ward.n}
            </p>
            <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(2.75rem,6vw,5rem)] max-w-[16ch] text-balance mb-6">
              {ward.name}
            </h1>
          </div>
          {wardMap}
        </section>

        {/* ── Key stats ──────────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-3 border-b-2 border-dark">
          <div className="px-6 py-7 md:px-14 border-r border-b md:border-b-0 border-border-light">
            <div className="font-sans font-semibold text-[2.75rem] leading-none tracking-[-0.03em] tabular-nums">
              {ward.count}
            </div>
            <div className="type-label-sm !tracking-[0.1em] text-text-secondary mt-2.5">
              Candidates registered
            </div>
          </div>
          <div className="px-6 py-7 md:px-14 md:border-r border-b md:border-b-0 border-border-light">
            <CountdownDays
              initialDays={daysUntil(election.electionDateIso)}
              targetIso={election.electionDateIso}
              className="font-sans font-semibold text-[2.75rem] leading-none tracking-[-0.03em] tabular-nums"
            />
            <div className="type-label-sm !tracking-[0.1em] text-text-secondary mt-2.5">
              Days until polls open
            </div>
          </div>
          <div className="px-6 py-7 md:px-14 col-span-2 md:col-span-1">
            <div className="flex items-end h-[2.75rem]">
              <div className="font-sans font-semibold text-[1.75rem] leading-none tracking-[-0.03em]">
                {election.electionDayLabel}
              </div>
            </div>
            <div className="type-label-sm !tracking-[0.1em] text-text-secondary mt-2.5">
              Election day
            </div>
          </div>
        </section>

        {/* ── Questionnaire ──────────────────────────────────── */}
        <section id="questionnaire">
          {/* The heading, what it amounts to, and the ballot it is about —
              one column, with the survey beside it. The ballot used to sit in
              a band of its own under this one, which left the heading's column
              as a line of type and a sentence against a survey card three
              times its height: a rectangle of nothing exactly where the names
              a reader came for should have been. */}
          <div className="px-6 md:px-14 pt-11 pb-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-12">
            <div className="grid content-start gap-5">
              <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.75rem,3vw,2.5rem)] max-w-[24ch] text-balance">
                Know Your Candidates
              </h2>
              {/* Only the empty states get a sentence. Where candidates have
                  answered, the roster underneath names both halves of the
                  ballot — "2 of 11 answered" was the same count, spelled out,
                  immediately above the list it was counting. */}
              {respondents.length === 0 && (
                <p className="font-serif text-[1.08rem] leading-[1.5] text-dark/85 max-w-[64ch] text-pretty">
                  {councilCandidates.length === 0
                    ? "No one has registered in this ward yet."
                    : "Nobody in this ward has answered yet. These are the questions we asked."}
                </p>
              )}
              {councilCandidates.length > 0 && (
                <CandidateRoster
                  respondents={respondents}
                  silent={councilCandidates.filter(
                    (candidate) => !surveyAnswers?.[candidate.key],
                  )}
                  election={election.slug}
                  race="councillor"
                  ward={ward.n}
                  wardName={ward.name}
                />
              )}
            </div>

            {/* Absent entirely while the survey is closed. The column beside
                it is the heading and the ballot, which stand on their own —
                this was always the ask, not part of the ward's own facts. */}
            {surveyHref(election) && (
              <SurveyCta href={surveyHref(election)!} />
            )}
          </div>

          {councilCandidates.length === 0 ? (
            <EmptyRace
              wardName={ward.name}
              nominationCloseLabel={nominationCloseLabel}
            />
          ) : (
            councilRaces.map((race) => (
              <RaceQuestionnaire
                key={race.id}
                race={race}
                surveyAnswers={surveyAnswers}
                surveyShape={surveyShape}
                showHeading={showRaceHeadings}
                issuesHref={`${election.basePath}/issues`}
              />
            ))
          )}

          <div className="px-6 md:px-14 py-4 border-t border-border-light grid gap-2.5">
            <p className="type-label-sm text-text-muted">
              Registered candidates from the City Clerk&rsquo;s list, less
              anyone who has withdrawn. The field is not final until nominations
              close{nominationCloseLabel ? ` on ${nominationCloseLabel}` : ""}.
            </p>
          </div>
        </section>

        {/* ── School board races ─────────────────────────────── */}
        {trusteeRaces.length > 0 && (
          <section className="border-t-2 border-dark">
            <div className="px-6 md:px-14 pt-11 pb-2">
              <p className="type-label text-accent mb-3.5">School boards</p>
              <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.75rem,3vw,2.5rem)]">
                Trustees on this ballot
              </h2>
            </div>
            {trusteeRaces.map((race) => (
              <div key={race.id}>
                <RaceHeading race={race} />
                {race.candidates.length === 0 ? (
                  <p className="px-6 md:px-14 pb-8 font-serif text-[1.05rem] leading-[1.45] text-dark/70 max-w-[62ch]">
                    No one has filed for this seat yet.
                  </p>
                ) : (
                  race.candidates.map((cand) => (
                    <CouncilCandidate
                      key={cand.key}
                      candidate={cand}
                      election={election.slug}
                      race="trustee"
                      ward={ward.n}
                      wardName={ward.name}
                    />
                  ))
                )}
              </div>
            ))}
          </section>
        )}

        {/* ── About this ward ────────────────────────────────── */}
        {profile && <WardProfileSection profile={profile} />}

        {/* ── Prev / next ward ───────────────────────────────── */}
        <section className="grid grid-cols-2 border-t border-border-light border-dark">
          <Link
            href={`${election.basePath}/wards/${prev.n}`}
            className="group px-6 md:px-14 py-7 border-r border-border-light transition-colors hover:bg-linen-200"
          >
            <div className="type-label-sm !tracking-[0.1em] text-text-secondary mb-2 flex items-center gap-2">
              <ArrowLeft className="size-3.5" /> Ward {prev.n}
            </div>
            <div className="font-sans font-medium text-[1.25rem] tracking-[-0.015em]">
              {prev.name}
            </div>
          </Link>
          <Link
            href={`${election.basePath}/wards/${next.n}`}
            className="group px-6 md:px-14 py-7 text-right transition-colors hover:bg-linen-200"
          >
            <div className="type-label-sm !tracking-[0.1em] text-text-secondary mb-2 flex items-center justify-end gap-2">
              Ward {next.n} <ArrowRight className="size-3.5" />
            </div>
            <div className="font-sans font-medium text-[1.25rem] tracking-[-0.015em]">
              {next.name}
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}

/**
 * One race's questionnaire, question by question.
 *
 * One per race rather than one for the ward, because a ward can elect more
 * than one councillor — Brampton's wards elect a city and a regional
 * councillor — and two rival fields read together would compare candidates who
 * are not running against each other.
 *
 * A race nobody answered has no questions to draw, since the questions come
 * from the returned questionnaires. That case still names the candidates: they
 * are on the ballot, and the page is now the only place that says so.
 */
function RaceQuestionnaire({
  race,
  surveyAnswers,
  surveyShape,
  showHeading,
  issuesHref,
}: {
  race: RaceView;
  surveyAnswers?: Record<string, CandidateAnswers>;
  surveyShape?: ComparedGroup[];
  showHeading: boolean;
  issuesHref?: string;
}) {
  /* Two lists, not one. The candidates who wrote back are the ones the
     questions can group, and the rest are named beside them — a reader can
     still see everyone on their ballot and go to their site, without a
     ward's dozen registrants turning thirty questions into three hundred
     cells of "did not respond". */
  const roster = surveyRoster(
    race.candidates.map((candidate) => ({
      ...candidate,
      // "" for most of the ballot; the grid only draws the row when something
      // in it is non-empty, so pass through rather than filtering here.
      bio: candidate.bio || undefined,
    })),
    surveyAnswers,
  );
  const answered = roster.filter((candidate) => candidate.answers);
  const silent = roster.filter((candidate) => !candidate.answers);
  const groups = comparedQuestions(
    answered.map((candidate) => candidate.answers!),
    answered,
    surveyShape,
  );

  return (
    <div>
      {showHeading && <RaceHeading race={race} />}
      <div className="px-6 md:px-14 pb-10">
        {groups.length > 0 ? (
          <QuestionnaireRail headings={questionnaireHeadings(groups)}>
            <QuestionnaireCards
              groups={groups}
              respondents={answered}
              silent={silent}
              issuesHref={issuesHref}
            />
          </QuestionnaireRail>
        ) : (
          /* Only two ways to get here now: nobody has filed for the seat, or
             the questionnaire itself could not be fetched. Either way there is
             no grid to draw, and the candidates are still worth naming. */
          <p className="font-serif text-[1.05rem] leading-[1.5] text-dark/80 max-w-[62ch] text-pretty">
            {roster.length === 0
              ? "No one has filed for this seat yet."
              : `On the ballot, and yet to respond to us: ${roster
                  .map((candidate) => candidate.name)
                  .join(", ")}.`}
          </p>
        )}
      </div>
    </div>
  );
}

function RaceHeading({ race }: { race: RaceView }) {
  return (
    <div className="px-6 md:px-14 pt-8 pb-3 border-t border-border-light flex justify-between items-end gap-5 flex-wrap">
      <div>
        {race.officeBody && (
          <p className="type-label text-accent mb-2">{race.officeBody}</p>
        )}
        <h3 className="font-sans font-medium leading-[1.1] tracking-[-0.025em] text-[clamp(1.3rem,2.2vw,1.7rem)]">
          {race.seat}
        </h3>
      </div>
      <p className="type-label-sm text-text-secondary !tracking-[0.06em] pb-1">
        {race.registeredCount}{" "}
        {race.registeredCount === 1 ? "candidate" : "candidates"}
      </p>
    </div>
  );
}

function EmptyRace({
  wardName,
  nominationCloseLabel,
}: {
  wardName: string;
  nominationCloseLabel: string | null;
}) {
  return (
    <p className="px-6 md:px-14 py-10 font-serif text-[1.08rem] leading-[1.45] text-dark/80 border-t border-border-light">
      No candidates have registered in {wardName} yet.
      {nominationCloseLabel
        ? ` Nominations close on ${nominationCloseLabel} — check back as more candidates register.`
        : " Check back as more candidates register."}
    </p>
  );
}

/* A candidate card, which only the school-board races use now: the council
   ballot is the questionnaire grid, and trustees have no questionnaire. */
function CouncilCandidate({
  candidate,
  election,
  race = "councillor",
  ward,
  wardName,
}: {
  candidate: CandidateView;
  election: string;
  race?: "councillor" | "trustee";
  ward: string;
  wardName: string;
}) {
  return (
    <div
      className={`px-6 md:px-14 py-7 border-t border-border-light ${
        candidate.withdrawn ? "opacity-55" : ""
      }`}
    >
      <div className="flex gap-5 sm:gap-7 items-center">
        <div className="flex-none size-16 bg-dark relative overflow-hidden flex items-center justify-center font-sans font-medium text-[1.35rem] tracking-[-0.02em] text-bg">
          {candidate.image ? (
            <Image
              src={candidate.image}
              alt={candidate.name}
              fill
              sizes="64px"
              className="object-cover object-center"
            />
          ) : (
            candidate.initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3.5 flex-wrap">
            <h3
              className={`font-sans font-medium text-[1.5rem] tracking-[-0.02em] leading-[1.1] ${
                candidate.withdrawn ? "line-through decoration-1" : ""
              }`}
            >
              <CandidateNameLink
                candidate={candidate}
                election={election}
                race={race}
                ward={ward}
                wardName={wardName}
              />
            </h3>
            {candidate.tag === "Incumbent" && <IncumbentBadge />}
            {candidate.withdrawn && (
              <span className="type-label-sm !text-[10px] !tracking-[0.12em] px-2 py-1 border border-border-light text-text-secondary">
                Withdrawn
              </span>
            )}
          </div>
          {candidate.bio && (
            <p className="font-serif text-[1.08rem] leading-[1.45] text-dark/80 max-w-[64ch] mt-2">
              {candidate.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
