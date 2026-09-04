import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import CountdownDays from "./CountdownDays";
import LiveCountdown from "./LiveCountdown";
import { CandidateSiteLink } from "./CandidateSiteLink";
import { PledgeButton } from "./PledgeButton";
import { SurveyCta } from "./SurveyCta";
import { ResidencyModal } from "./ResidencyModal";
import { WardCard } from "./WardCard";
import {
  breakdown,
  daysUntil,
  msUntil,
  periodTiming,
  yearOf,
} from "@/lib/elections/dates";
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

/**
 * The minute-accurate window for election day, where a region has published
 * the times its polls open and close. The registry's `electionDateIso` is
 * date-only, so a region that supplies this gets the same live
 * days:hours:minutes:seconds timer the /toronto hero uses; a region that
 * doesn't falls back to the whole-day counter.
 *
 * Structurally a subset of Toronto's `VotingPeriod`, so its key-dates module
 * can pass `ELECTION_DAY` straight through without a mapping layer.
 */
export type ElectionDayPeriod = {
  /** absolute instant polls open, e.g. "2026-10-26T10:00:00-04:00" */
  opensAt?: string;
  /** absolute instant polls close */
  closesAt: string;
  upcomingLabel: string;
  openLabel: string;
  closedLabel: string;
};

export type LandingContent = {
  heroTitle: ReactNode;
  heroBlurb: ReactNode;
  /** the "Find your ward" blurb — mentions the region's ward and seat count */
  wardsBlurb: ReactNode;
  closingHeadline: ReactNode;
  closingBlurb: ReactNode;
  /** the fine print about where the roster comes from */
  sourceNote: ReactNode;
  /** This region's supporting guide pages, listed under the poll-hours line.
   *  Unset or empty drops the block rather than rendering dead links — only
   *  Toronto has these pages so far. A list rather than one href per page, so
   *  adding the next guide doesn't mean another prop. */
  guideLinks?: { label: string; href: string }[];
};

export function ElectionLanding({
  election,
  view,
  content,
  wardMapDefs,
  renderWardMap,
  mayorSurveyPath,
  surveyPath,
  electionDay,
}: {
  election: SupportedElection;
  view: ElectionView;
  content: LandingContent;
  /** poll-open/poll-close instants for election day. Supplied turns the band's
   *  headline counter into the live timer; omitted keeps the days counter. */
  electionDay?: ElectionDayPeriod;
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
        <KeyDates
          election={election}
          surveyPath={surveyPath}
          guideLinks={content.guideLinks}
          electionDay={electionDay}
        />

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
 * Seeds LiveCountdown from the server's reading of election day. Split out so
 * the `targetInstant ?? 0` dance lives in one place, the same way Toronto's
 * PeriodCountdown wraps it for the key-dates pages.
 */
function ElectionDayCountdown({ period }: { period: ElectionDayPeriod }) {
  const now = new Date();
  const timing = periodTiming(period, now);

  return (
    <LiveCountdown
      opensAt={period.opensAt}
      closesAt={period.closesAt}
      initialParts={breakdown(
        timing.targetInstant ? msUntil(timing.targetInstant, now) : 0,
      )}
      initialState={timing.state}
      labels={{
        upcoming: period.upcomingLabel,
        open: period.openLabel,
        closed: period.closedLabel,
      }}
      size="xl"
    />
  );
}

/**
 * One of the band's secondary counters — advance voting, vote by mail.
 *
 * Same three-part shape as the headline: an eyebrow naming the thing, the
 * number, the date underneath. The unit sits inline with the digits at a
 * fraction of their size, which is how the live timer pairs "52" with "days".
 * The old version hung a two-line caption off the number's baseline instead,
 * and beside a four-slot timer that read as a different component.
 */
function DateCounter({
  eyebrow,
  targetIso,
  dateLabel,
}: {
  eyebrow: string;
  /** "YYYY-MM-DD" — the day being counted down to */
  targetIso: string;
  /** the human date or range beneath the number */
  dateLabel: ReactNode;
}) {
  return (
    <div>
      <p className="type-label text-accent">{eyebrow}</p>
      <p className="mt-3 flex items-baseline gap-2">
        <CountdownDays
          initialDays={daysUntil(targetIso)}
          targetIso={targetIso}
          className="font-sans font-medium leading-[0.95] tracking-[-0.03em] text-[clamp(2.5rem,5vw,3.5rem)] tabular-nums"
        />
        <span className="type-label-sm !tracking-[0.14em] text-text-secondary">
          days
        </span>
      </p>
      <p className="mt-2.5 font-serif text-[1rem] leading-[1.4] text-dark/80">
        {dateLabel}
      </p>
    </div>
  );
}

/**
 * Election-day countdown, the advance-vote and vote-by-mail counters, and the
 * survey (or, where a region runs none, the pledge).
 *
 * Two rows rather than one. The headline countdown takes the full width of the
 * band, because a live days:hrs:min:sec timer is eleven glyphs plus four unit
 * labels and cannot share a third of the row with anything — squeezed into a
 * column it either clamps down to the size of the secondary counters, losing
 * the hierarchy that made it the headline, or overruns its gutter. Its own row
 * also puts the date and the guide links beside the number they describe,
 * rather than across the band in the CTA cell where they used to sit.
 *
 * The second row is the supporting calendar: one cell per published date, then
 * the survey. Regions that haven't published their advance-vote or mail-in
 * dates drop those cells rather than render empty ones, and the survey takes
 * the row on its own.
 */
function KeyDates({
  election,
  surveyPath,
  guideLinks,
  electionDay,
}: {
  election: SupportedElection;
  /** where the region's voter survey lives; the panel falls back to the pledge
   *  where there is none */
  surveyPath?: string;
  /** the region's supporting guide pages, listed beside the headline number */
  guideLinks?: { label: string; href: string }[];
  /** poll hours for election day, where the region has published them */
  electionDay?: ElectionDayPeriod;
}) {
  const { advanceVote, mailIn } = election;
  const dateCells = [advanceVote, mailIn].filter(Boolean).length;

  return (
    <section className="border-b-2 border-dark">
      {/* ── Headline: the countdown, and the day it counts to ── */}
      <div className="px-6 py-12 md:px-14 md:py-14 border-b border-border-light grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
        <div>
          {electionDay ? (
            // The same live timer the /toronto hero band runs: the server
            // reads the state and the remaining milliseconds once, and
            // LiveCountdown ticks forward from there. It carries its own state
            // label — "Until polls open" before the day, "Left to vote" during
            // it — so the eyebrow above it names the election, not the count.
            <>
              <p className="type-label text-accent mb-5">
                {yearOf(election.electionDateIso)} Election day
              </p>
              <ElectionDayCountdown period={electionDay} />
            </>
          ) : (
            // Regions with no published poll hours get a whole-day count, in
            // the same three-part shape so the band reads the same either way.
            <>
              <p className="type-label text-accent mb-5">Until polls open</p>
              <p className="flex items-baseline gap-4">
                <CountdownDays
                  initialDays={daysUntil(election.electionDateIso)}
                  targetIso={election.electionDateIso}
                  className="font-sans font-medium leading-[0.95] tracking-[-0.04em] text-[clamp(4rem,10vw,8rem)] tabular-nums"
                />
                <span className="type-label !tracking-[0.14em] text-text-secondary">
                  days
                </span>
              </p>
            </>
          )}
        </div>

        {/* Shrink-wrapped, so the grid hands the timer every pixel it can use
            and this block stays as wide as its own longest line rather than
            taking a fixed share of the row. */}
        <div className="lg:shrink-0 lg:text-right">
          <p className="font-serif text-[1.05rem] leading-[1.4] lg:text-[1.15rem]">
            Polls open{" "}
            <span className="text-accent">
              {election.voteDayLabel},&nbsp;{yearOf(election.electionDateIso)}
            </span>
            , {election.pollHoursLabel}.
          </p>
          {guideLinks && guideLinks.length > 0 && (
            <div className="mt-5 flex flex-col items-start gap-2 lg:items-end">
              {guideLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group/dates inline-flex items-center gap-1.5 type-label-sm !tracking-[0.1em] text-dark hover:text-accent transition-colors"
                >
                  {link.label}
                  <ArrowRight className="size-3 shrink-0 transition-transform group-hover/dates:translate-x-0.5" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Supporting calendar, then the survey ── */}
      <div
        className={`grid ${
          dateCells === 2
            ? "md:grid-cols-[1fr_1fr_1.3fr]"
            : dateCells === 1
              ? "md:grid-cols-[1fr_1.3fr]"
              : ""
        }`}
      >
        {advanceVote && (
          <div className="px-6 py-12 md:px-14 md:py-14 flex flex-col justify-center">
            <DateCounter
              eyebrow="Until advance polls"
              targetIso={advanceVote.iso}
              dateLabel={advanceVote.label}
            />
          </div>
        )}

        {mailIn && (
          <div className="px-6 py-12 md:px-14 md:py-14 border-t md:border-t-0 md:border-l border-border-light flex flex-col justify-center">
            <DateCounter
              eyebrow="To apply to vote by mail"
              targetIso={mailIn.iso}
              /* Also spelled out, with the rest of Toronto's calendar, in
                 src/app/toronto/vote/2026/key-dates.ts. This component is
                 shared by four cities and can't import a Toronto route
                 module, so the cutoff is written twice — change both. */
              dateLabel={<>{mailIn.label}, 4:30&nbsp;p.m.</>}
            />
          </div>
        )}

        <div
          className={`px-6 py-12 md:px-14 md:py-14 bg-bg-alt flex flex-col justify-center ${
            dateCells > 0
              ? "border-t md:border-t-0 md:border-l border-border-light"
              : ""
          }`}
        >
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
        </div>
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
