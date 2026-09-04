import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { fetchMemos } from "@/lib/api";
import SectionLabel from "@/components/SectionLabel";
import { LinkButton } from "@/components/ui/link-button";
import { SectionHeader } from "@/components/ui/section-header";
import PickCard from "@/components/PickCard";
import LiveCountdown from "@/components/elections/LiveCountdown";
import { breakdown, msUntil, periodTiming } from "@/lib/elections/dates";
import { isDaylight } from "@/lib/daylight";
import { ELECTION } from "./vote/2026/data";
import { STAGE_ONE } from "./vote/survey-questions/questions";
import { WARD_GEO, WARD_SHAPES } from "./vote/2026/wardGeo";
import {
  ELECTION_DAY,
  KEY_DATES_PATH,
  VOTING_PERIODS,
} from "./vote/2026/key-dates";
import { EmailCapture } from "./EmailCapture";
import { WardLookupCard } from "./WardLookupCard";
import { HeroSurface } from "./HeroSurface";
import { SubscribeCardTrigger } from "./SubscribeCardTrigger";

/* Half-hourly, so the hero photograph follows Toronto's actual daylight (see
   ./HeroSurface) without the page going dynamic and giving up its CDN cache.
   Worst case the skyline is half an hour behind the sky outside, which is
   inside the blue-hour window the night photograph was shot in anyway. */
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Build Canada - Toronto",
  description:
    "Toronto is not the greatest city in the world. But it should be. Memos and ideas to help build a better Toronto.",
  alternates: { canonical: "/toronto" },
  openGraph: {
    title: "Build Canada - Toronto",
    description:
      "Comprehensive coverage of Toronto's 2026 election, plus bold ideas for a better city.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Build Canada - Toronto",
    description:
      "Comprehensive coverage of Toronto's 2026 election, plus bold ideas for a better city.",
  },
};

function HeroSection() {
  /* Toronto's daylight, not the reader's. This is a photograph of this city,
     so it should match what the sky over it looks like — someone opening the
     page from Vancouver at 5 p.m. their time is looking at Toronto at 8 p.m.
     Decided here on the server so there is one image on the critical path and
     nothing swaps under the reader after hydration; HeroSurface takes it as
     the starting point and the corner toggle can override it. */
  return <HeroSurface initialMode={isDaylight(new Date()) ? "day" : "night"} />;
}

/**
 * The live countdown to polls opening, on its own full-bleed band directly
 * under the hero — the one time-sensitive fact on the page, so it goes first
 * and carries nothing else.
 */
function CountdownSection() {
  // Same reading the /when-is-the-election page takes: the server computes the
  // breakdown, the client ticks it forward from there.
  const now = new Date();
  const timing = periodTiming(ELECTION_DAY, now);

  return (
    <section className="bg-dark text-linen-100 border-b border-border-light px-5 py-10 md:py-16">
      {/* Same px-5 / 1080px rhythm as the hero and the sections below it, so
          the two columns start and end on the page's own content edges. */}
      {/* flex-col-reverse on mobile puts the timer at the top of the band, so
          it clears the fold rather than sitting under the heading. Neither
          column is focusable, so the visual reorder costs nothing. */}
      <div className="max-w-[1080px] mx-auto flex flex-col-reverse gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div>
          <p className="type-label text-auburn-200">2026 Municipal Election</p>
          <h2 className="type-h2 mt-4">
            Toronto votes {ELECTION.voteDayLabel}.
          </h2>
          <p className="mt-4 font-serif text-[1rem] leading-[1.4] text-linen-100/70">
            Polls are open {ELECTION_DAY.hoursLabel}.
          </p>
        </div>
        {/* Shrink-wrapped, so `justify-between` puts the timer on the right
            edge while its own digits and labels stay left-aligned to each
            other — the timer is never internally right-aligned, which is what
            went wrong when the parent tried to do this with `text-right`. */}
        <div className="lg:shrink-0">
          <LiveCountdown
            opensAt={ELECTION_DAY.opensAt}
            closesAt={ELECTION_DAY.closesAt}
            initialParts={breakdown(
              timing.targetInstant ? msUntil(timing.targetInstant, now) : 0,
            )}
            initialState={timing.state}
            labels={{
              upcoming: ELECTION_DAY.upcomingLabel,
              open: ELECTION_DAY.openLabel,
              closed: ELECTION_DAY.closedLabel,
            }}
            size="xl"
            tone="dark"
          />
        </div>
      </div>
    </section>
  );
}

/**
 * Toronto's 25 wards. The same geometry the tracker's locator maps are drawn
 * from — rendered once here as the whole city, so the card shows you the thing
 * you are about to go and search rather than describing it.
 */
function WardOutlineMap() {
  return (
    <svg
      viewBox={WARD_GEO.viewBox}
      role="img"
      aria-label={`The 25 wards of the ${WARD_GEO.regionLabel}`}
      className="w-full h-auto"
    >
      {WARD_SHAPES.map((w) => (
        <path
          key={w.n}
          d={w.d}
          className="fill-accent/10 stroke-accent/40 transition-colors duration-200 group-hover/card:fill-accent/20 group-hover/card:stroke-accent/70"
          strokeWidth={0.5}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

/* The arrow that trails every card's call to action. */
function CardArrow() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="shrink-0 transition-transform duration-200 group-hover/card:translate-x-1.5"
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ElectionCardCommon = {
  title: string;
  cta: string;
  className: string;
  buttonClassName: string;
  children: React.ReactNode;
};

/** A card's foot is either a link or a modal trigger. */
type ElectionCardAction =
  | { href: string; modalHeadline?: never }
  | { href?: never; modalHeadline: string };

type ElectionCardProps = ElectionCardCommon & ElectionCardAction;

/**
 * Shared chrome for the election cards. The whole card is the hit area, but it
 * still ends in a full-width button rather than a quiet label: these lead
 * somewhere, and that should be unmistakable rather than inferred.
 *
 * Navigating cards are a single anchor. The card whose action is a modal
 * cannot be — see SubscribeCardTrigger — so it becomes a plain container with
 * a real button at its foot, stretched over the card. Both end up with one
 * hit area and one accessible name.
 */
function ElectionCard(props: ElectionCardProps) {
  /* Narrowed off `props` rather than destructured: pulling `href` and
     `modalHeadline` out as locals loses the link between them, and the
     exclusive union stops discriminating. */
  const { title, cta, className, buttonClassName, children } = props;
  const shellClass = `group/card relative flex flex-col justify-between border border-border-light transition-colors ${className}`;
  const ctaClass = `w-full flex items-center justify-center gap-3 px-6 py-4 md:py-5 type-label !tracking-[0.12em] border transition-colors duration-200 ${buttonClassName}`;

  const head = (
    <div className="px-6 md:px-8 pt-8 md:pt-10 pb-6">
      <h2 className="type-h3 transition-colors group-hover/card:text-accent">
        {title}
      </h2>
      {children}
    </div>
  );

  if (props.href !== undefined) {
    return (
      <Link
        href={props.href}
        className={`${shellClass} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
      >
        {head}
        <div className="px-6 md:px-8 pb-6 md:pb-8">
          {/* A div, not a button: this sits inside the card's anchor, and
              nesting interactive elements is invalid. It is styled as the
              call to action and the whole card is the hit area. */}
          <div className={ctaClass}>
            {cta}
            <CardArrow />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className={shellClass}>
      {head}
      <div className="px-6 md:px-8 pb-6 md:pb-8">
        <SubscribeCardTrigger
          className={ctaClass}
          headline={props.modalHeadline}
          source="survey-interest"
        >
          {cta}
          <CardArrow />
        </SubscribeCardTrigger>
      </div>
    </div>
  );
}

/**
 * The three entry points into the election coverage, then the ward lookup.
 * Each card carries a heading, one compact block of the real thing, and its
 * button — no summary prose, since the heading and the contents already say
 * what it is.
 */
function ElectionCardsSection() {
  // Four topics against Yes/No, to match the four date rows beside it.
  const questions = STAGE_ONE.slice(0, 4);
  // Off the shared calendar, so these can't drift from the page they link to.
  const dates = [...VOTING_PERIODS, ELECTION_DAY];

  const button =
    "bg-dark text-linen-100 border-dark group-hover/card:bg-accent group-hover/card:border-accent";
  const rows = "mt-6 divide-y divide-border-light border-t border-border-light";

  return (
    <section className="border-b border-border-light px-5 py-12 md:py-16">
      <div className="max-w-[1080px] mx-auto">
        {/* One column, then three — no two-column stage, which left the third
            card orphaned on a half-empty second row. The cards are spaced
            rather than seamed, so each carries its own border (see
            ElectionCard). */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          <ElectionCard
          href={KEY_DATES_PATH}
          title="Key election dates"
          cta="See all dates"
          className="bg-bg-alt text-dark"
          buttonClassName={button}
        >
          <dl className={rows}>
            {dates.map((d) => (
              <div
                key={d.id}
                className="py-3 flex items-baseline justify-between gap-4"
              >
                <dt className="type-label-sm text-dark/60 min-w-0">
                  {d.title}
                </dt>
                <dd className="font-serif text-[0.9375rem] leading-[1.35] text-dark text-right shrink-0">
                  {d.dateLabel}
                </dd>
              </div>
            ))}
          </dl>
        </ElectionCard>

          <ElectionCard
          href={ELECTION.basePath}
          title="Explore the candidates"
          cta="See all candidates"
          className="bg-bg text-dark"
          buttonClassName={button}
        >
          <div className="mt-6">
            <WardOutlineMap />
          </div>
        </ElectionCard>

          <ElectionCard
          /* Points at the signup rather than the survey page for now: the
             questions are written but the answers aren't in, so the card
             sells being told when they are. Swap this back to
             href={SURVEY_PATH} at launch.

             Pitched as the reader's own comparison, not as our research: the
             questions only matter to a voter because answering them yourself
             is what sorts the field. This is the one card whose action is a
             signup rather than a link, so it is also the one that needs a
             line of copy to say what it does. */
          modalHeadline="Be first to compare your views with the candidates’"
          title="Compare your views to the candidates"
          cta="Be first to compare"
          className="bg-bg-alt text-dark"
          buttonClassName={button}
        >
          <p className="type-body-sm text-dark/70 mt-3">
            Answer the same questions we put to every candidate, then see who
            lines up with you.
          </p>
          <ul className="mt-6 divide-y divide-border-light border-t border-border-light">
            {questions.map((q) => (
              <li key={q.id} className="py-3 flex items-start gap-4">
                <span className="flex-1 min-w-0 font-serif text-[0.9375rem] leading-[1.35] text-dark/80 line-clamp-1">
                  {q.topic}
                </span>
                <span aria-hidden className="flex gap-1.5 shrink-0">
                  <span className="type-label-sm border border-border-light px-2 py-0.5 text-dark/50">
                    Yes
                  </span>
                  <span className="type-label-sm border border-border-light px-2 py-0.5 text-dark/50">
                    No
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </ElectionCard>
        </div>

        {/* The ward lookup is deliberately not a card: it is a single field,
            and boxing it next to cards with real bodies left it mostly empty.
            A plain rule and one row give it its own footing. */}
        <div className="mt-10 md:mt-12 pt-10 md:pt-12 border-t border-border-light flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-10">
          <div className="md:max-w-[30rem]">
            <h2 className="type-h3">Find your ward</h2>
            <p className="type-body-sm text-dark/70 mt-2">
              Enter your postal code to see who&rsquo;s running to represent
              you.
            </p>
          </div>
          <div className="w-full md:w-auto md:min-w-[22rem]">
            <WardLookupCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function MissionSection() {
  return (
    <section className="px-5 py-12 md:py-20 border-b border-border-light">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel as="h2" className="mb-8 md:mb-12">
          Building a Better Toronto
        </SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12 items-start">
          <div className="relative aspect-[3/4] max-w-[420px] w-full">
            <Image
              src="/assets/images/toronto/gardiner.jpg"
              alt="Frederick Gardiner, First Chairman of Metropolitan Toronto"
              fill
              sizes="(min-width: 956px) 420px, 100vw"
              className="object-cover"
            />
            <span className="absolute bottom-0 left-0 right-0 p-4 type-label text-bg bg-gradient-to-t from-black/80 to-transparent">
              Frederick Gardiner,
              <br />
              First Chairman of
              <br />
              Metropolitan Toronto
            </span>
          </div>
          <div className="mt-8 md:mt-0">
            <div className="type-body text-dark/80 space-y-4">
              <p>
                We&rsquo;re Torontonians who refuse to accept our city&rsquo;s
                managed decline. We believe Toronto should be something
                greater: a city of energy and beauty, where world-class
                infrastructure and serious governance let people thrive.
              </p>
              <p>
                We help notable Torontonians share their bold policy ideas to
                make that a reality.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <LinkButton href="/toronto/about" variant="primary">
                Learn More
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PolicyIdeasSection({
  memos,
}: {
  memos: Awaited<ReturnType<typeof fetchMemos>>;
}) {
  const cards = memos.slice(0, 4);

  if (cards.length === 0) {
    return (
      <section className="px-5 py-12 md:py-20 border-b border-border-light">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeader label="Policy ideas to grow Toronto" />
          <p className="type-body text-dark/70 max-w-[640px]">
            New memos are on the way. Subscribe to be the first to read them.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-12 md:py-20 border-b border-border-light">
      <div className="max-w-[1080px] mx-auto">
        <SectionHeader
          label="Policy ideas to grow Toronto"
          action={
            <LinkButton href="/toronto/memos" variant="primary">
              See more memos
            </LinkButton>
          }
        />
        <p className="type-body text-dark/70 max-w-[640px] mb-8">
          We help notable Torontonians share their bold ideas to grow our city.
        </p>
        <div className="grid grid-cols-1 cards:grid-cols-2 wide:grid-cols-4 gap-0 border-t border-border-light">
          {cards.map((m) => (
            <PickCard key={m.id} memo={m} basePath="/toronto/memos" />
          ))}
        </div>
        <LinkButton
          href="/toronto/memos"
          className="compact:hidden flex w-full justify-center mt-6"
        >
          See more memos
        </LinkButton>
      </div>
    </section>
  );
}

/**
 * Direct contact. Deliberately a real address rather than a form: the point is
 * that a person reads it, so anything that looks like a ticket queue would
 * undercut it.
 */
function SubscribeCTA() {
  return (
    <section className="bg-linen-200 px-5 py-16 md:py-24">
      <div className="max-w-[680px] mx-auto text-center">
        <h2 className="type-display-sm text-dark mt-5">
          Toronto changes fast.
          <br />
          <span className="text-accent">Keep up with it.</span>
        </h2>
        <p className="type-lead text-dark/75 mt-5">
          One email a week: new memos, our election coverage as it lands, and
          new ideas for Canada&rsquo;s largest city.
        </p>
        <EmailCapture
          id="digest-email"
          source="footer"
          buttonLabel="Subscribe"
          tone="light"
          className="mt-9 max-w-[520px] mx-auto"
        />
        <p className="type-label-sm text-dark/50 mt-5">
          Over 10,000 subscribers &middot; No spam, unsubscribe anytime
        </p>
      </div>
    </section>
  );
}

export default async function TorontoHome() {
  const memos = await fetchMemos({ publication: "build_toronto" });

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
      <HeroSection />
      <CountdownSection />
      <ElectionCardsSection />
      <PolicyIdeasSection memos={memos} />
      <MissionSection />
      <SubscribeCTA />
    </div>
  );
}
