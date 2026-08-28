import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import CountdownDays from "./CountdownDays";
import { CandidateSurveyAnswers } from "./CandidateSurveyAnswers";
import { IncumbentBadge, SiteLink } from "./ElectionLanding";
import type { CandidateAnswers } from "@/lib/elections/candidate-answers";
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
}) {
  const { ward, wards, councilRaces, trusteeRaces } = data;
  const idx = wards.findIndex((w) => w.number === ward.number);
  const prev = wards[(idx + wards.length - 1) % wards.length];
  const next = wards[(idx + 1) % wards.length];

  // With one council race the heading would only repeat the page title, so the
  // candidates run straight down — which is how Toronto's page has always read.
  const showRaceHeadings = councilRaces.length > 1;

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

        {/* ── Council candidates ─────────────────────────────── */}
        <section>
          <div className="px-6 md:px-14 pt-11 pb-2">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.75rem,3vw,2.5rem)]">
              Candidates
            </h2>
          </div>

          {councilRaces.length === 0 && (
            <EmptyRace
              wardName={ward.name}
              nominationCloseLabel={nominationCloseLabel}
            />
          )}

          {councilRaces.map((race) => (
            <div key={race.id}>
              {showRaceHeadings && <RaceHeading race={race} />}
              {race.candidates.length === 0 ? (
                <EmptyRace
                  wardName={ward.name}
                  nominationCloseLabel={nominationCloseLabel}
                />
              ) : (
                race.candidates.map((cand) => (
                  <CouncilCandidate
                    key={cand.key}
                    candidate={cand}
                    election={election.slug}
                    ward={ward.n}
                    wardName={ward.name}
                    answers={surveyAnswers?.[cand.key]}
                  />
                ))
              )}
            </div>
          ))}

          <p className="px-6 md:px-14 py-4 type-label-sm text-text-muted border-t border-border-light">
            Registered candidates from the City Clerk&rsquo;s list. The field is
            not final until nominations close
            {nominationCloseLabel ? ` on ${nominationCloseLabel}` : ""}.
          </p>
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

function CouncilCandidate({
  candidate,
  election,
  race = "councillor",
  ward,
  wardName,
  answers,
}: {
  candidate: CandidateView;
  election: string;
  race?: "councillor" | "trustee";
  ward: string;
  wardName: string;
  /** their questionnaire answers, when they have answered it */
  answers?: CandidateAnswers;
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
        <div className="flex items-baseline gap-3.5 flex-wrap mb-2">
          <h3
            className={`font-sans font-medium text-[1.5rem] tracking-[-0.02em] leading-[1.1] ${
              candidate.withdrawn ? "line-through decoration-1" : ""
            }`}
          >
            {candidate.name}
          </h3>
          {candidate.tag === "Incumbent" && <IncumbentBadge />}
          {candidate.withdrawn && (
            <span className="type-label-sm !text-[10px] !tracking-[0.12em] px-2 py-1 border border-border-light text-text-secondary">
              Withdrawn
            </span>
          )}
        </div>
        {candidate.bio && (
          <p className="font-serif text-[1.08rem] leading-[1.45] text-dark/80 max-w-[64ch]">
            {candidate.bio}
          </p>
        )}
      </div>
      <div className="hidden sm:block flex-none">
        <SiteLink
          candidate={candidate}
          election={election}
          race={race}
          ward={ward}
          wardName={wardName}
        />
      </div>
      </div>

      {answers && (
        <CandidateSurveyAnswers
          answers={answers}
          candidateName={candidate.name}
        />
      )}
    </div>
  );
}
