import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import CountdownDays from "./CountdownDays";
import LiveCountdown from "./LiveCountdown";
import { CandidateNameLink } from "./CandidateNameLink";
import { PledgeButton } from "./PledgeButton";
import { SurveyCta } from "./SurveyCta";
import { ResidencyModal } from "./ResidencyModal";
import { WardCard } from "./WardCard";
import WardLookup from "./WardLookup";
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
  /** The tools and readings this region has published on top of the roster —
   *  the questionnaire read across the field, the reader's own alignment, the
   *  ward pages. Unset drops the section, which is what every region but
   *  Toronto does today. */
  explore?: ExploreItem[];
};

/** One card in the explore grid. `meta` is the small figure under the title —
 *  a count, a date, whatever makes the card worth clicking. */
export type ExploreItem = {
  eyebrow: string;
  title: ReactNode;
  blurb: ReactNode;
  href: string;
  meta?: ReactNode;
  /** the one card that is an ask rather than a page. Filled in the region's
   *  accent — Toronto blue on this tracker, since `.theme-election` overrides
   *  the token — so it is the only solid block of colour in the grid and the
   *  only thing in it that is not somewhere to go and read. Same fill as the
   *  SurveyCta at the foot of the page and beside every questionnaire on the
   *  site: one ask, one colour, wherever a reader meets it. `cta` replaces the
   *  "Open" foot, because this card is a control and should say what it does. */
  tone?: "invite";
  cta?: string;
};

export function ElectionLanding({
  election,
  view,
  content,
  wardMapDefs,
  renderWardMap,
  mayorSurveyPath,
  mayorRosterPath,
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
  /** the full mayoral roster, for a region whose field is too long to print
   *  here. Set it and this section keeps its heading and hands the list off;
   *  leave it unset and the section prints every candidate, which is the right
   *  answer for a field of eight and the wrong one for a field of fifty. */
  mayorRosterPath?: string;
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
  /* THE MAYORAL RACE, WHERE IT IS A SIGNPOST RATHER THAN A LIST
     A region with a roster page had a whole band of the front page — heading,
     blurb, count, and two link rows — pointing at two other pages, which is
     exactly what the explore grid is made of. Set as a section of its own it
     pushed the wards a screen further down for no reading a card could not
     carry.

     One card, not two. The other pointed at the roster of every registered
     candidate, which is a page that exists to be indexed rather than read:
     fifty-three names and their campaign links, no answers. It is still
     linked from the mayoral page it belongs to. What a reader on the front
     page wants from this race is what the field said, so that is the card.

     A region with no roster page keeps its own section below: its cards are
     the candidates themselves, names and campaign links, which is a list
     rather than a pointer and belongs nowhere near a grid of pages. */
  const mayorCards: ExploreItem[] =
    mayorRosterPath && mayorSurveyPath
      ? [
        {
          eyebrow: "Mayor",
          title: "The race for mayor",
          blurb: "How the candidates for mayor answered our questions.",
          href: mayorSurveyPath,
        },
      ]
      : [];
  /* The ask, in the middle of the grid rather than only at the foot of the
     page. Everything else here is somewhere to go and read; this is the one
     card that asks the reader for something, and a reader who has just seen
     what the candidates said is the likeliest person on the page to have an
     opinion about it. Middle, not first: the cards on either side are what
     earn the ask. */
  const invite: ExploreItem[] = surveyPath
    ? [
      {
        eyebrow: "Voter survey",
        title: "Where do you stand?",
        blurb:
          "Answer the same questions we put to the candidates and see which of them line up with you.",
        href: surveyPath,
        tone: "invite",
        cta: "Take the survey",
      },
    ]
    : [];

  /* The tiles the lookup shows once it has an answer. Built here rather than
     inside it, because a ward's locator map is server-rendered geometry a
     client component cannot make. Only where the region has boundary data —
     otherwise nothing renders them and the loop is a wasted pass over the
     whole ward list. */
  const wardCards: Record<number, ReactNode> = {};
  if (election.wardLookup) {
    for (const ward of view.wards) {
      wardCards[ward.number] = (
        <WardCard
          ward={ward}
          basePath={election.basePath}
          map={renderWardMap?.(ward)}
          className="border border-border-light max-w-[300px]"
        />
      );
    }
  }

  const pages = [...mayorCards, ...(content.explore ?? [])];
  const exploreItems = [
    ...pages.slice(0, Math.ceil(pages.length / 2)),
    ...invite,
    ...pages.slice(Math.ceil(pages.length / 2)),
  ];

  return (
    <div className={`${election.themeClass ?? ""} bg-bg text-dark`}>
      <Suspense fallback={null}>
        <ResidencyModal election={election.slug} />
      </Suspense>
      <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
        {/* ── Hero: the election, and the clock on it ─────────── */}
        <Hero election={election} content={content} electionDay={electionDay} />

        {/* ── Explore: the mayoral race, and what we've published ─ */}
        {exploreItems.length > 0 && (
          <ExploreSection
            items={exploreItems}
            /* Three other pages link to #candidates, and with the mayoral
               section suppressed that anchor has to land here. Keyed off the
               roster path rather than off the cards: it is the roster path
               that removes the section, so it is what has to replace it. */
            anchorCandidates={Boolean(mayorRosterPath)}
          />
        )}

        {/* ── Candidates for mayor ─────────────────────────────── */}
        {/* Only where there is no roster page to point at. Toronto's mayoral
            field is fifty-three people and lives on a page of its own, which
            the explore grid above links to; a region running a race of eight
            has nowhere else to put them, and printing the names here is the
            right answer for a field that size. */}
        {!mayorRosterPath && (
          <section
            id="candidates"
            className="border-b-2 border-dark scroll-mt-24"
          >
            <div className="px-6 pt-10 pb-6 md:px-14 flex justify-between items-end gap-6 flex-wrap">
              <div>
                <p className="type-label text-accent mb-3">Mayor</p>
                <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.85rem,3vw,2.4rem)] mb-2">
                  Candidates for Mayor
                </h2>
              </div>
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

            <CardGrid min="272px">
              {view.mayoral.map((cand) => (
                <MayoralCard
                  key={cand.key}
                  candidate={cand}
                  election={election.slug}
                />
              ))}
            </CardGrid>
          </section>
        )}

        {/* ── Wards ────────────────────────────────────────────── */}
        <section id="wards" className="border-b-2 border-dark scroll-mt-24">
          <div className="px-6 pt-10 pb-6 md:px-14 flex justify-between items-end gap-6 flex-wrap">
            <div>
              <p className="type-label text-accent mb-3">City Council</p>
              <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.85rem,3vw,2.4rem)] mb-2">
                Find your ward
              </h2>
              <p className="font-serif text-[1.05rem] leading-[1.45] max-w-[52ch] text-dark/80">
                {content.wardsBlurb}
              </p>
              {/* Twenty-five tiles is a list nobody reads to find their own
                  ward: they know their postal code and not their ward number,
                  which is the whole reason this section is called "find". The
                  grid below stays, for the reader who wants to browse and for
                  the one the lookup guesses wrong. */}
              {election.wardLookup && (
                <div className="mt-7">
                  <WardLookup
                    wards={view.wards}
                    cards={wardCards}
                    cityLabel={election.cityLabel}
                  />
                </div>
              )}
            </div>
            <p className="type-label text-text-secondary pb-1.5 !tracking-[0.08em]">
              {view.wards.length} wards
            </p>
          </div>

          {wardMapDefs}
          <CardGrid min="250px">
            {view.wards.map((ward) => (
              <WardCard
                key={ward.n}
                ward={ward}
                basePath={election.basePath}
                map={renderWardMap?.(ward)}
                className="border-b border-r border-border-light"
              />
            ))}
          </CardGrid>
        </section>

        {/* ── Also city-wide (French-language school boards) ────── */}
        {view.atLargeRaces.length > 0 && (
          <section className="border-b-2 border-dark">
            <div className="px-6 pt-10 pb-6 md:px-14">
              <p className="type-label text-accent mb-3">
                Also on every ballot
              </p>
              <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.85rem,3vw,2.4rem)] mb-2">
                City-wide races
              </h2>
              <p className="font-serif text-[1.05rem] leading-[1.45] max-w-[52ch] text-dark/80">
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

        {/* ── Dates and how to vote ────────────────────────────── */}
        <VotingCalendar election={election} content={content} />

        {/* ── Closing CTA ──────────────────────────────────────── */}
        <section className="bg-bg text-dark px-6 py-14 md:px-14 md:py-16 text-center flex flex-col items-center">
          <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.035em] text-[clamp(1.9rem,4vw,3rem)] max-w-[22ch] text-balance mb-6">
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
          <p className="mt-10 pt-5 border-t border-dark/15 type-label-sm text-text-muted !tracking-[0.06em] max-w-[60ch]">
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
          className="font-sans font-medium leading-[0.95] tracking-[-0.03em] text-[clamp(2.1rem,4vw,2.75rem)] tabular-nums"
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
 * The top of the page: what the election is, and how long is left of it.
 *
 * Hero and countdown used to be two stacked bands, which meant the headline
 * and the number that gives it its urgency were separated by a rule and never
 * read as one statement. They're one block now — eyebrow, headline, blurb,
 * then the live timer under a hairline inside the same section — so the first
 * screen answers "which election" and "how long do I have" together.
 *
 * The supporting calendar is not here. Advance polls, the mail-in cutoff and
 * the how-to-vote guides used to run as a strip along the bottom of this
 * band, which put three secondary deadlines between the reader and the field
 * — on a first screen whose one job is which election, and how long. They are
 * the last thing on the page now, in VotingCalendar, which is where someone
 * who has read the candidates and wants to know how to vote for one looks.
 *
 * The survey ask that used to sit in this band is now the explore grid's
 * alignment card and the closing CTA — asking twice in the first screen was
 * the old band's problem, not its strength.
 */
function Hero({
  election,
  content,
  electionDay,
}: {
  election: SupportedElection;
  content: LandingContent;
  /** poll hours for election day, where the region has published them */
  electionDay?: ElectionDayPeriod;
}) {
  return (
    <section className="border-b-2 border-dark">
      <div className="px-6 pt-14 pb-12 md:px-14 md:pt-16 md:pb-14">
        <p className="type-label text-accent mb-6">{election.eyebrow}</p>
        <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(3rem,7vw,5.75rem)] max-w-[15ch] text-balance mb-7">
          {content.heroTitle}
        </h1>
        <p className="font-serif text-[clamp(1.15rem,1.6vw,1.4rem)] leading-[1.5] max-w-[62ch]">
          {content.heroBlurb}
        </p>

        {/* The clock, under a hairline rather than in a band of its own. The
            timer takes every pixel the grid can give it — eleven glyphs plus
            four unit labels don't survive sharing a column — and the poll-hours
            line shrink-wraps beside it. */}
        <div className="mt-12 pt-10 border-t border-border-light grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
          <div>
            {electionDay ? (
              // The same live timer the /toronto hero band runs: the server
              // reads the state and the remaining milliseconds once, and
              // LiveCountdown ticks forward from there. It carries its own
              // state label — "Until polls open" before the day, "Left to
              // vote" during it — so the eyebrow above it names the election,
              // not the count.
              <>
                <p className="type-label text-accent mb-5">
                  {yearOf(election.electionDateIso)} Election day
                </p>
                <ElectionDayCountdown period={electionDay} />
              </>
            ) : (
              // Regions with no published poll hours get a whole-day count, in
              // the same three-part shape so the hero reads the same either
              // way.
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

          <p className="font-serif text-[1.05rem] leading-[1.4] lg:shrink-0 lg:text-right lg:text-[1.15rem]">
            Polls open{" "}
            <span className="text-accent">
              {election.voteDayLabel},&nbsp;{yearOf(election.electionDateIso)}
            </span>
            , {election.pollHoursLabel}.
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * How to vote, and by when — the last thing on the page.
 *
 * These three cells opened the page, tucked under the hero: two deadline
 * counters and a stack of guide links, read before the reader had met a single
 * candidate. That is the wrong order for what they are. A deadline matters to
 * someone who has decided to vote, and the page spends its whole length making
 * that decision possible; asked at the top, "apply to vote by mail by Friday"
 * is an errand in front of the thing they came for.
 *
 * So it closes rather than opens, immediately before the call to action, where
 * a reader who has just read the field and wants to know how to act on it is
 * already looking down the page.
 *
 * Cells a region can't fill are dropped rather than rendered empty, so a region
 * with no published advance date and no guides gets no band at all.
 */
function VotingCalendar({
  election,
  content,
}: {
  election: SupportedElection;
  content: LandingContent;
}) {
  const { advanceVote, mailIn } = election;
  const guideLinks = content.guideLinks ?? [];
  const dateCells = [advanceVote, mailIn].filter(Boolean).length;
  if (dateCells === 0 && guideLinks.length === 0) return null;

  /* The columns, counted rather than auto-fit: the guides cell holds a stack
     of links and wants the wider share, the counters are a number and a date
     apiece. One cell takes the row on its own. */
  const cells = dateCells + (guideLinks.length > 0 ? 1 : 0);
  const cols =
    cells === 3
      ? "md:grid-cols-[1fr_1fr_1.15fr]"
      : cells === 2
        ? guideLinks.length > 0
          ? "md:grid-cols-[1fr_1.15fr]"
          : "md:grid-cols-2"
        : "";

  return (
    <section className="border-b-2 border-dark">
      <div className="px-6 pt-10 pb-6 md:px-14">
        <p className="type-label text-accent mb-3">Before you vote</p>
        <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.85rem,3vw,2.4rem)] mb-2">
          Dates and how to vote
        </h2>
      </div>
      <div className={`border-t border-border-light grid ${cols}`}>
        {advanceVote && (
          <div className="px-6 py-8 md:px-14 md:py-9">
            <DateCounter
              eyebrow="Until advance polls"
              targetIso={advanceVote.iso}
              dateLabel={advanceVote.label}
            />
          </div>
        )}

        {mailIn && (
          <div className="px-6 py-8 md:px-14 md:py-9 border-t md:border-t-0 md:border-l border-border-light">
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

        {guideLinks.length > 0 && (
          <div
            className={`px-6 py-8 md:px-14 md:py-9 bg-bg-alt ${dateCells > 0
                ? "border-t md:border-t-0 md:border-l border-border-light"
                : ""
              }`}
          >
            <p className="type-label text-accent mb-4">How to vote</p>
            <div className="flex flex-col items-start gap-2.5">
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
          </div>
        )}
      </div>
    </section>
  );
}

// ── Explore grid ───────────────────────────────────────────────────────────

/**
 * Everything we've made out of the questionnaire, in one grid.
 *
 * These pages exist either way — the field's answers issue by issue, the
 * reader's own alignment, the mayoral grid — but until now the only way to
 * find them was a link buried beside a section heading, and the alignment
 * survey was the closing CTA at the bottom of a very long page. The grid puts
 * them where someone who has just read the countdown can see them.
 *
 * Cards over a list, because each one needs a sentence to explain what it
 * shows; the same border-collapse trick as the ward and mayoral grids, so the
 * three sections read as one table rather than three treatments.
 */
function ExploreSection({
  items,
  anchorCandidates = false,
}: {
  items: ExploreItem[];
  /** also answer to #candidates, which three other pages link to and which
   *  lands here whenever the mayoral cards do */
  anchorCandidates?: boolean;
}) {
  return (
    <section id="explore" className="border-b-2 border-dark scroll-mt-24">
      {anchorCandidates && (
        <span
          id="candidates"
          className="block scroll-mt-24"
          aria-hidden="true"
        />
      )}
      <div className="px-6 pt-10 pb-6 md:px-14">
        <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.85rem,3vw,2.4rem)] mb-2">
          Explore the election
        </h2>
        <p className="font-serif text-[1.05rem] leading-[1.45] max-w-[52ch] text-dark/80">
          We put the same questions to every candidate on the ballot. See how
          they answered — then answer them yourself and find out who lines up
          with you.
        </p>
      </div>

      {/* auto-FIT, not auto-fill. Filling laid out as many 288px tracks as the
          row could hold and left the spare ones empty: three cards on a wide
          screen were three narrow columns hard against the left edge, with
          half the row a blank rectangle inside the same border. Fitting
          collapses the empty tracks, so however many cards a region has, they
          divide the row between them. */}
      <CardGrid min="288px" fit>
        {items.map((item) => {
          const invite = item.tone === "invite";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group/explore flex flex-col border-b border-r px-6 py-6 md:px-8 md:py-7 lg:min-h-[290px] lg:px-10 lg:py-9 transition-colors ${invite
                  ? "border-accent bg-accent text-bg hover:bg-dark"
                  : "border-border-light hover:bg-bg-alt"
                }`}
            >
              <p
                className={`type-label-sm !tracking-[0.1em] mb-3 ${invite ? "text-bg/70" : "text-text-secondary"
                  }`}
              >
                {item.eyebrow}
              </p>
              <h3
                className={`type-h3 lg:text-[1.75rem] lg:leading-[1.15] transition-colors ${invite ? "" : "group-hover/explore:text-accent"
                  }`}
              >
                {item.title}
              </h3>
              {item.meta && (
                <p
                  className={`mt-2 font-sans font-medium tracking-[-0.02em] text-[1.35rem] leading-none tabular-nums ${invite ? "text-bg/80" : "text-accent"
                    }`}
                >
                  {item.meta}
                </p>
              )}
              <p
                className={`mt-3 font-serif text-[1rem] leading-[1.45] lg:mt-4 lg:text-[1.1rem] lg:leading-[1.5] ${invite ? "text-bg/85" : "text-dark/80"
                  }`}
              >
                {item.blurb}
              </p>
              {/* A button rather than a link with an arrow, on the one card
                  that is a control — the same distinction the survey card
                  makes everywhere else on the site. */}
              {invite ? (
                <span className="type-button mt-auto pt-5 inline-flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 bg-bg px-4 py-2.5 text-dark">
                    {item.cta ?? "Open"}
                    <ArrowRight className="size-3.5 transition-transform group-hover/explore:translate-x-0.5" />
                  </span>
                </span>
              ) : (
                <span className="mt-auto pt-5 inline-flex items-center gap-1.5 type-label-sm !tracking-[0.1em] text-accent">
                  Open
                  <ArrowRight className="size-3 shrink-0 transition-transform group-hover/explore:translate-x-0.5" />
                </span>
              )}
            </Link>
          );
        })}
      </CardGrid>
    </section>
  );
}

/**
 * A row of cards that closes on all four sides, exactly once.
 *
 * THE PROBLEM THIS SOLVES
 *   Cards in a full-bleed grid have to be ruled off from each other without
 *   doubling the page frame that already surrounds them, and neither obvious
 *   arrangement manages it:
 *
 *   · Rules on the container (`border-t border-l`) plus rules after each cell
 *     (`border-b border-r`) draws a second line on top of the frame's left and
 *     right borders, and leaves a hairline sitting a pixel above the section's
 *     2px rule at the foot.
 *   · Rules before each cell (`border-t border-r`) fixes all three of those and
 *     breaks something worse: twenty-five wards in a four-column grid leave one
 *     card alone on the last row, and the rule above it spans one column of
 *     four. A line that stops a quarter of the way across the page is not a
 *     subtle defect.
 *
 * THE ARRANGEMENT
 *   Cells rule *after* themselves, so every row draws a full-width line under
 *   itself whether or not the row below it is complete. The two lines that
 *   would then land on the frame — the last row's and the last column's — are
 *   pushed a pixel past the edge with negative margins and clipped away by the
 *   wrapper. What is left is the frame's own border on the outside, the
 *   section's rule at the foot, and one line between any two cards.
 */
function CardGrid({
  min,
  fit = false,
  children,
}: {
  /** the narrowest a column may get before the grid drops one */
  min: string;
  /** collapse empty tracks so a few cards fill the row, rather than lining up
   *  at their minimum width with the rest of the row left blank */
  fit?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden">
      <div
        className="-mb-px -mr-px grid border-t border-border-light"
        style={{
          gridTemplateColumns: `repeat(${fit ? "auto-fit" : "auto-fill"}, minmax(${min}, 1fr))`,
        }}
      >
        {children}
      </div>
    </div>
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
      {/* The name is the link. It used to be plain text with "Campaign site"
          on the line beneath it, which spent a second line saying that the
          thing above it led somewhere — and led off the site. */}
      <div className="min-w-0 flex items-center gap-2.5 flex-wrap">
        <h3 className="font-sans font-medium text-[1.15rem] tracking-[-0.02em] leading-[1.15]">
          <CandidateNameLink
            candidate={candidate}
            election={election}
            race="mayor"
          />
        </h3>
        {candidate.tag === "Incumbent" && <IncumbentBadge />}
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
      className={`flex gap-5 sm:gap-6 items-center px-6 md:px-14 py-5 border-t border-border-light ${candidate.withdrawn ? "opacity-55" : ""
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
            className={`font-sans font-medium text-[1.25rem] tracking-[-0.02em] leading-[1.15] ${candidate.withdrawn ? "line-through decoration-1" : ""
              }`}
          >
            <CandidateNameLink
              candidate={candidate}
              election={election}
              race={race}
            />
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

/** `social_links[].name` is an open vocabulary ("web", "facebook", "tiktok",
 *  …), so unknown names are title-cased rather than dropped. */
function socialLabel(name: string): string {
  if (name.toLowerCase() === "web") return "Website";
  return name.charAt(0).toUpperCase() + name.slice(1);
}
