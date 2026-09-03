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
import { WARD_GEO, WARD_SHAPES } from "./vote/2026/wardGeo";
import { ELECTION_DAY } from "./vote/2026/key-dates";
import { SURVEY_PATH } from "./vote/survey-questions/path";
import { STAGE_ONE } from "./vote/survey-questions/questions";
import { EmailCapture } from "./EmailCapture";
import { HeroSurface } from "./HeroSurface";

/** Where questions about the Toronto project go. */
const CONTACT_EMAIL = "hi@buildcanada.com";

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
    <section className="bg-dark text-linen-100 border-b border-border-light px-5 py-12 md:py-16">
      {/* Same px-5 / 1080px rhythm as the hero and the sections below it, so
          the two columns start and end on the page's own content edges. */}
      <div className="max-w-[1080px] mx-auto flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div>
          <p className="type-label text-auburn-200">{ELECTION.eyebrow}</p>
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

/**
 * Shared chrome for the two election cards. The whole card is the link, but it
 * still ends in a full-width button rather than a quiet label: these go to
 * other pages, and that should be unmistakable rather than inferred.
 */
function ElectionCard({
  href,
  eyebrow,
  title,
  cta,
  className,
  eyebrowClassName,
  buttonClassName,
  children,
}: {
  href: string;
  eyebrow: string;
  title: string;
  cta: string;
  className: string;
  eyebrowClassName: string;
  buttonClassName: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group/card flex flex-col justify-between transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-accent ${className}`}
    >
      <div className="px-6 md:px-10 pt-10 md:pt-14 pb-8">
        <span className={`type-label ${eyebrowClassName}`}>{eyebrow}</span>
        <h2 className="type-h2 mt-4 transition-colors group-hover/card:text-accent">
          {title}
        </h2>
        {children}
      </div>
      <div className="px-6 md:px-10 pb-8 md:pb-10">
        {/* A div, not a button: this sits inside the card's anchor, and nesting
            interactive elements is invalid. It is styled as the call to action
            and the whole card is the hit area. */}
        <div
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 md:py-5 type-label !tracking-[0.12em] border transition-colors duration-200 ${buttonClassName}`}
        >
          {cta}
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
        </div>
      </div>
    </Link>
  );
}

/**
 * The two entry points into the election coverage. Both cards are filled with
 * the real thing rather than a description of it, and they are pitched light
 * against dark so the pair reads as one composition.
 */
function ElectionCardsSection() {
  const questions = STAGE_ONE.slice(0, 3);

  return (
    <section className="border-b border-border-light">
      <div className="grid grid-cols-1 cards:grid-cols-2">
        <ElectionCard
          href={ELECTION.basePath}
          eyebrow="2026 Election"
          title="Explore the candidates"
          cta="Go to the candidate tracker"
          className="bg-bg text-dark border-b cards:border-b-0 cards:border-r border-border-light"
          eyebrowClassName="text-accent"
          buttonClassName="bg-dark text-linen-100 border-dark group-hover/card:bg-accent group-hover/card:border-accent"
        >
          <p className="type-body-sm text-dark/70 mt-4">
            One race for mayor, and one in every ward. Find yours.
          </p>
          <div className="mt-8">
            <WardOutlineMap />
          </div>
        </ElectionCard>

        <ElectionCard
          href={SURVEY_PATH}
          eyebrow="Candidate survey"
          title="Take our candidate survey"
          cta="Read the survey questions"
          className="bg-bg-alt text-dark"
          eyebrowClassName="text-accent"
          buttonClassName="bg-dark text-linen-100 border-dark group-hover/card:bg-accent group-hover/card:border-accent"
        >
          <p className="type-body-sm text-dark/70 mt-4">
            Where every candidate stands on housing, transit, and whether
            Toronto can still build. Starting with a straight yes or no.
          </p>
          <ul className="mt-7 divide-y divide-border-light border-t border-border-light">
            {questions.map((q) => (
              <li key={q.id} className="py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <span className="type-label-sm text-accent">{q.topic}</span>
                  <p className="font-serif text-[0.9375rem] leading-[1.45] text-dark/80 mt-1.5 line-clamp-2">
                    {q.question}
                  </p>
                </div>
                <div aria-hidden className="flex gap-1.5 shrink-0 pt-0.5">
                  <span className="type-label-sm border border-border-light px-2 py-1 text-dark/50">
                    Yes
                  </span>
                  <span className="type-label-sm border border-border-light px-2 py-1 text-dark/50">
                    No
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </ElectionCard>
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
function ReachOutSection() {
  return (
    <section className="border-b border-border-light px-5 py-12 md:py-20">
      <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-2 md:gap-x-12 md:items-center">
        <div>
          <SectionLabel as="h2">Reach out</SectionLabel>
          <p className="type-body text-dark/80 mt-6">
            We publish our questions, our sources and our reasoning, and we
            would rather answer a hard question than dodge it. If something
            here looks wrong, incomplete or unfair &mdash; or you want to know
            who we are and who funds us &mdash; ask us directly.
          </p>
        </div>
        <div className="mt-8 md:mt-0 md:justify-self-end">
          <LinkButton
            href={`mailto:${CONTACT_EMAIL}`}
            variant="primary"
            className="w-full sm:w-auto justify-center px-6 py-4 md:py-5 !tracking-[0.12em]"
          >
            Email {CONTACT_EMAIL}
          </LinkButton>
        </div>
      </div>
    </section>
  );
}

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
      <ReachOutSection />
      <SubscribeCTA />
    </div>
  );
}
