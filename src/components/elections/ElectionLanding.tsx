import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import CountdownDays from "./CountdownDays";
import { CandidateSiteLink } from "./CandidateSiteLink";
import { PledgeButton } from "./PledgeButton";
import { SurveyCta } from "./SurveyCta";
import { ResidencyModal } from "./ResidencyModal";
import { WardCard } from "./WardCard";
import { daysUntil, yearOf } from "@/lib/elections/dates";
import type { SupportedElection } from "@/lib/elections/registry";
import type {
  CandidateView,
  ElectionView,
  RaceView,
  WardView,
} from "@/lib/elections/election-data";

/* The election landing page every region shares.

   The structure is fixed — hero, countdowns, the mayoral field, the ward
   finder, the closing pledge — and each region supplies its own copy plus,
   where it has one, its ward locator map. Sections a region can't fill drop
   out rather than render empty: no advance-vote date in the registry means
   no advance-vote counter. */

export type LandingContent = {
  heroTitle: ReactNode;
  heroBlurb: ReactNode;
  /** the "Find your ward" blurb — mentions the region's ward and seat count */
  wardsBlurb: ReactNode;
  closingHeadline: ReactNode;
  closingBlurb: ReactNode;
  /** the fine print about where the roster comes from */
  sourceNote: ReactNode;
};

export function ElectionLanding({
  election,
  view,
  content,
  wardMapDefs,
  renderWardMap,
  mayorSurveyPath,
  surveyPath,
}: {
  election: SupportedElection;
  view: ElectionView;
  content: LandingContent;
  /** where the mayoral field's questionnaire grid lives, for the regions that
   *  have run one — the cards say who is running, that page says what they
   *  said */
  mayorSurveyPath?: string;
  /** the voter survey, where the region runs one. It takes the closing call to
   *  action from the pledge: a pledge is a name on a list, where the survey
   *  hands the reader their own ballot back with the candidates ranked against
   *  it — a better thing to ask of someone who has just read the field, and a
   *  better first step towards voting than a promise to. */
  surveyPath?: string;
  /** rendered once, so per-ward maps can reference shared geometry */
  wardMapDefs?: ReactNode;
  /** this region's locator map for a ward, when it has ward geometry */
  renderWardMap?: (ward: WardView) => ReactNode;
}) {
  return (
    <div className={`${election.themeClass ?? ""} bg-bg text-dark`}>
      <Suspense fallback={null}>
        <ResidencyModal election={election.slug} />
      </Suspense>
      <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="px-6 py-14 md:px-14 md:py-16 border-b-2 border-dark">
          <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(3rem,7vw,5.75rem)] max-w-[15ch] text-balance mb-7">
            {content.heroTitle}
          </h1>
          <p className="font-serif text-[clamp(1.15rem,1.6vw,1.4rem)] leading-[1.5] max-w-[62ch]">
            {content.heroBlurb}
          </p>
        </section>

        {/* ── Countdown + how to vote ──────────────────────────── */}
        <KeyDates election={election} surveyPath={surveyPath} />

        {/* ── Candidates for mayor ─────────────────────────────── */}
        <section id="candidates" className="border-b-2 border-dark scroll-mt-24">
          <div className="px-6 pt-12 pb-8 md:px-14 flex justify-between items-end gap-6 flex-wrap">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(2rem,3.5vw,2.75rem)]">
              Candidates for Mayor
            </h2>
            {mayorSurveyPath && (
              <Link
                href={mayorSurveyPath}
                className="group/answers type-label-sm text-accent hover:underline inline-flex items-center gap-1.5 pb-1.5"
              >
                How they answered our questionnaire
                <ArrowRight className="size-3.5 transition-transform group-hover/answers:translate-x-0.5" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(272px,1fr))] border-t border-l border-border-light">
            {view.mayoral.map((cand) => (
              <MayoralCard
                key={cand.key}
                candidate={cand}
                election={election.slug}
              />
            ))}
          </div>
        </section>

        {/* ── Wards ────────────────────────────────────────────── */}
        <section id="wards" className="border-b-2 border-dark scroll-mt-24">
          <div className="px-6 pt-12 pb-8 md:px-14 flex justify-between items-end gap-6 flex-wrap">
            <div>
              <p className="type-label text-accent mb-3.5">City Council</p>
              <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(2rem,3.5vw,2.75rem)] mb-2.5">
                Find your ward
              </h2>
              <p className="font-serif text-[1.1rem] leading-[1.45] max-w-[52ch] text-dark/80">
                {content.wardsBlurb}
              </p>
            </div>
            <p className="type-label text-text-secondary pb-1.5 !tracking-[0.08em]">
              {view.wards.length} wards
            </p>
          </div>

          {wardMapDefs}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] border-t border-l border-border-light">
            {view.wards.map((ward) => (
              <WardCard
                key={ward.n}
                ward={ward}
                basePath={election.basePath}
                map={renderWardMap?.(ward)}
                className="border-b border-r border-border-light"
              />
            ))}
          </div>
        </section>

        {/* ── Also city-wide (French-language school boards) ────── */}
        {view.atLargeRaces.length > 0 && (
          <section className="border-b-2 border-dark">
            <div className="px-6 pt-12 pb-8 md:px-14">
              <p className="type-label text-accent mb-3.5">
                Also on every ballot
              </p>
              <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(2rem,3.5vw,2.75rem)] mb-2.5">
                City-wide races
              </h2>
              <p className="font-serif text-[1.1rem] leading-[1.45] max-w-[52ch] text-dark/80">
                These seats are elected across the whole city, so every voter
                sees them regardless of ward.
              </p>
            </div>
            {view.atLargeRaces.map((race) => (
              <RaceSection
                key={race.id}
                race={race}
                election={election.slug}
                nominationCloseLabel={view.nominationCloseLabel}
              />
            ))}
          </section>
        )}

        {/* ── Closing CTA ──────────────────────────────────────── */}
        <section className="bg-bg text-dark px-6 py-20 md:px-14 md:py-28 text-center flex flex-col items-center">
          <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.035em] text-[clamp(2rem,5vw,3.75rem)] max-w-[22ch] text-balance mb-6">
            {content.closingHeadline}
          </h2>
          {/* The survey card itself rather than a button in its colours, so
              the ask looks the same wherever a reader meets it — here, and
              beside every questionnaire on the site. It carries its own body
              copy, which is why the section's blurb only prints where there is
              no card to replace it. */}
          {surveyPath ? (
            <SurveyCta
              href={surveyPath}
              className="w-full max-w-[560px] text-left"
            />
          ) : (
            <>
              <p className="mb-10 font-serif text-[1.15rem] leading-[1.5] text-dark/75 max-w-[46ch]">
                {content.closingBlurb}
              </p>
              <PledgeButton
                election={election.slug}
                source="election-landing"
                className="group/btn inline-flex items-center gap-3 type-button text-bg bg-accent px-7 py-4 transition-colors hover:bg-accent-hover cursor-pointer"
              >
                Pledge to vote
                <ArrowRight className="size-4 shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
              </PledgeButton>
            </>
          )}
          <p className="mt-14 pt-5 border-t border-dark/15 type-label-sm text-text-muted !tracking-[0.06em] max-w-[60ch]">
            {content.sourceNote}
          </p>
        </section>
      </div>
    </div>
  );
}

// ── Countdown band ─────────────────────────────────────────────────────────

/**
 * Election-day countdown, the advance-vote and vote-by-mail counters, and the
 * pledge CTA. Regions that haven't published their advance-vote or mail-in
 * dates get a two-column band instead of three, rather than empty cells.
 */
function KeyDates({
  election,
  surveyPath,
}: {
  election: SupportedElection;
  /** where the region's voter survey lives; the panel falls back to the pledge
   *  where there is none */
  surveyPath?: string;
}) {
  const { advanceVote, mailIn } = election;
  const hasMiddle = Boolean(advanceVote || mailIn);

  return (
    <section
      className={`grid ${hasMiddle ? "md:grid-cols-[1.15fr_0.85fr_1fr]" : "md:grid-cols-[1.6fr_1fr]"} border-b-2 border-dark`}
    >
      <div className="px-6 py-12 md:px-14 md:py-14 flex flex-col justify-center">
        <div className="flex items-end gap-5 flex-wrap">
          <CountdownDays
            initialDays={daysUntil(election.electionDateIso)}
            targetIso={election.electionDateIso}
            className="font-sans font-semibold leading-[0.8] tracking-[-0.05em] text-[clamp(5rem,13vw,11rem)] tabular-nums"
          />
          <span className="type-label !tracking-[0.12em] leading-[1.5] pb-3.5">
            Days until
            <br />
            polls open
          </span>
        </div>
      </div>

      {hasMiddle && (
        <div className="px-6 py-12 md:px-14 md:py-14 border-t-2 md:border-t-0 md:border-l border-border-light flex flex-col justify-center gap-8">
          {advanceVote && (
            <div>
              <div className="flex items-end gap-3">
                <CountdownDays
                  initialDays={daysUntil(advanceVote.iso)}
                  targetIso={advanceVote.iso}
                  className="font-sans font-semibold leading-[0.8] tracking-[-0.04em] text-[clamp(2.75rem,5.5vw,4rem)] tabular-nums"
                />
                <span className="type-label !tracking-[0.12em] leading-[1.4] pb-1">
                  Days until
                  <br />
                  advance polls
                </span>
              </div>
              <p className="mt-2.5 font-serif text-[1rem] leading-[1.4] text-accent">
                {advanceVote.label}
              </p>
            </div>
          )}
          {mailIn && (
            <div className={advanceVote ? "pt-7 border-t border-border-light" : ""}>
              <div className="flex items-end gap-3">
                <CountdownDays
                  initialDays={daysUntil(mailIn.iso)}
                  targetIso={mailIn.iso}
                  className="font-sans font-semibold leading-[0.8] tracking-[-0.04em] text-[clamp(2.75rem,5.5vw,4rem)] tabular-nums"
                />
                <span className="type-label !tracking-[0.12em] leading-[1.4] pb-1">
                  Days to apply
                  <br />
                  to vote by mail
                </span>
              </div>
              <p className="mt-2.5 font-serif text-[1rem] leading-[1.4] text-accent">
                {mailIn.label}, 4:30&nbsp;p.m.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="px-6 py-12 md:px-14 md:py-14 border-t-2 md:border-t-0 md:border-l border-border-light bg-bg-alt flex flex-col justify-center">
        {surveyPath ? (
          <SurveyCta href={surveyPath} className="w-full" />
        ) : (
          <>
            <p className="type-label text-accent mb-3.5">Ready to vote?</p>
            <p className="font-serif text-[1.15rem] leading-[1.45] max-w-[34ch] mb-6">
              Put your name on the record. Pledging takes ten seconds — and
              it&rsquo;s the first step to showing up on election day.
            </p>
            <PledgeButton
              election={election.slug}
              source="election-ready-to-vote"
              className="group/btn self-start inline-flex items-center gap-3 type-button text-bg bg-dark px-5 py-4 transition-colors hover:bg-black cursor-pointer"
            >
              Pledge to vote
              <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
            </PledgeButton>
          </>
        )}
        <p className="mt-7 pt-5 border-t border-border-light font-serif text-[1.05rem] leading-[1.4]">
          Polls open{" "}
          <span className="text-accent">
            {election.voteDayLabel},&nbsp;{yearOf(election.electionDateIso)}
          </span>
          , {election.pollHoursLabel}.
        </p>
      </div>
    </section>
  );
}

// ── Candidate cards ────────────────────────────────────────────────────────

function MayoralCard({
  candidate,
  election,
}: {
  candidate: CandidateView;
  election: string;
}) {
  return (
    <div className="bg-bg flex gap-4 items-center px-6 py-5 border-b border-r border-border-light">
      <div className="flex-none size-12 bg-dark relative overflow-hidden flex items-center justify-center font-sans font-medium text-[1rem] tracking-[-0.02em] text-bg">
        {candidate.image ? (
          <Image
            src={candidate.image}
            alt={candidate.name}
            fill
            sizes="48px"
            className="object-cover object-center"
          />
        ) : (
          candidate.initials
        )}
      </div>
      <div className="min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="font-sans font-medium text-[1.15rem] tracking-[-0.02em] leading-[1.15]">
            {candidate.name}
          </h3>
          {candidate.tag === "Incumbent" && <IncumbentBadge />}
        </div>
        <SiteLink candidate={candidate} election={election} race="mayor" />
      </div>
    </div>
  );
}

/** A city-wide race listed under "Also on every ballot". */
function RaceSection({
  race,
  election,
  nominationCloseLabel,
}: {
  race: RaceView;
  election: string;
  nominationCloseLabel: string | null;
}) {
  return (
    <div className="border-t border-border-light">
      <div className="px-6 md:px-14 pt-8 pb-4 flex justify-between items-end gap-5 flex-wrap">
        <div>
          {race.officeBody && (
            <p className="type-label text-accent mb-2.5">{race.officeBody}</p>
          )}
          <h3 className="font-sans font-medium leading-[1.1] tracking-[-0.025em] text-[clamp(1.3rem,2.2vw,1.7rem)]">
            {race.seat}
          </h3>
        </div>
        <p className="type-label-sm text-text-secondary !tracking-[0.06em] pb-1">
          {race.registeredCount}{" "}
          {race.registeredCount === 1 ? "candidate" : "candidates"} · all wards
          vote
        </p>
      </div>
      {race.candidates.length === 0 ? (
        <p className="px-6 md:px-14 pb-8 font-serif text-[1.05rem] leading-[1.45] text-dark/70 max-w-[62ch]">
          No one has filed for this seat yet.
          {nominationCloseLabel
            ? ` Nominations close ${nominationCloseLabel} — check back as candidates register.`
            : " Check back as candidates register."}
        </p>
      ) : (
        <ul>
          {race.candidates.map((candidate) => (
            <CandidateRow
              key={candidate.key}
              candidate={candidate}
              election={election}
              race="trustee"
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/** A compact list row, used for the city-wide races. */
export function CandidateRow({
  candidate,
  election,
  race,
}: {
  candidate: CandidateView;
  election: string;
  race: "mayor" | "councillor" | "trustee";
}) {
  return (
    <li
      className={`flex gap-5 sm:gap-6 items-center px-6 md:px-14 py-5 border-t border-border-light ${
        candidate.withdrawn ? "opacity-55" : ""
      }`}
    >
      <span
        aria-hidden="true"
        className="flex-none size-12 bg-dark flex items-center justify-center font-sans font-medium text-[1.05rem] tracking-[-0.02em] text-bg"
      >
        {candidate.initials}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 flex-wrap">
          <p
            className={`font-sans font-medium text-[1.25rem] tracking-[-0.02em] leading-[1.15] ${
              candidate.withdrawn ? "line-through decoration-1" : ""
            }`}
          >
            {candidate.name}
          </p>
          {candidate.withdrawn && (
            <span className="type-label-sm !text-[10px] !tracking-[0.12em] px-2 py-1 border border-border-light text-text-secondary">
              Withdrawn
            </span>
          )}
        </div>
        {candidate.socialLinks.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
            {candidate.socialLinks.map((link) => (
              <a
                key={`${link.name}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="type-label-sm !tracking-[0.06em] text-text-secondary hover:text-accent transition-colors"
              >
                {socialLabel(link.name)}
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="hidden sm:block flex-none">
        <SiteLink candidate={candidate} election={election} race={race} />
      </div>
    </li>
  );
}

export function IncumbentBadge() {
  return (
    <span className="inline-flex items-center type-label-sm !text-[10px] !leading-none !tracking-[0.12em] pl-2 pr-[calc(0.5rem-0.12em)] py-1.5 border border-accent text-accent">
      Incumbent
    </span>
  );
}

/** The campaign-site link, or the placeholder shown when we have no URL. */
export function SiteLink({
  candidate,
  election,
  race,
  ward,
  wardName,
}: {
  candidate: CandidateView;
  election: string;
  race: "mayor" | "councillor" | "trustee";
  ward?: string;
  wardName?: string;
}) {
  if (!candidate.website) {
    return (
      <span className="type-label-sm text-text-secondary">Profile to come</span>
    );
  }
  return (
    <CandidateSiteLink
      href={candidate.website}
      candidate={candidate.name}
      candidateKey={candidate.key}
      election={election}
      race={race}
      tag={candidate.tag}
      ward={ward}
      wardName={wardName}
      className="group/btn self-start inline-flex items-center gap-1.5 type-label-sm text-accent hover:underline"
    >
      Campaign site
      <ArrowUpRight className="size-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
    </CandidateSiteLink>
  );
}

/** `social_links[].name` is an open vocabulary ("web", "facebook", "tiktok",
 *  …), so unknown names are title-cased rather than dropped. */
function socialLabel(name: string): string {
  if (name.toLowerCase() === "web") return "Website";
  return name.charAt(0).toUpperCase() + name.slice(1);
}
