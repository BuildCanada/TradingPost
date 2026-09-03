import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { fetchMemos } from "@/lib/api";
import SectionLabel from "@/components/SectionLabel";
import { LinkButton } from "@/components/ui/link-button";
import { SubscribeButton } from "@/components/ui/subscribe-button";
import { SectionHeader } from "@/components/ui/section-header";
import PickCard from "@/components/PickCard";
import LiveCountdown from "@/components/elections/LiveCountdown";
import { breakdown, msUntil, periodTiming } from "@/lib/elections/dates";
import { ELECTION } from "./vote/2026/data";
import { ELECTION_DAY } from "./vote/2026/key-dates";
import { SURVEY_PATH } from "./vote/survey-questions/path";
import { STAGE_ONE } from "./vote/survey-questions/questions";
import { HeroEmailCapture } from "./HeroEmailCapture";

/** Where questions about the Toronto project go. */
const CONTACT_EMAIL = "hi@buildcanada.com";

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
  return (
    <section className="relative border-b border-border-light w-full overflow-hidden">
      <Image
        src="/assets/images/toronto/hero.jpg"
        alt="The Toronto skyline lit up at blue hour, with the CN Tower in red, seen across Lake Ontario"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Scrim: dark frame, light copy — but weighted to the centre, because
          the fully lit skyline is a bright, busy band exactly where the centred
          type sits. The sky above and water below need almost none of it. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/55 to-black/40"
      />
      {/* Content sits in normal flow rather than absolutely positioned, so the
          hero grows to fit the copy instead of clipping it at a fixed aspect. */}
      <div className="relative flex min-h-[85svh] md:min-h-[860px] flex-col justify-center px-5 py-16 md:py-20">
        <div className="w-full max-w-[1080px] mx-auto text-center">
          <h1 className="type-display text-linen-100">
            Vote for the Toronto
            <br />
            <span className="text-auburn-200">you know is possible.</span>
          </h1>
          <p className="type-lead text-linen-100/90 max-w-[560px] mx-auto mt-6">
            Coverage of the October 26 election and bold ideas for the city for the future.
          </p>
          <HeroEmailCapture />
        </div>
      </div>
    </section>
  );
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
      className={`group/card flex flex-col justify-between transition-colors ${className}`}
    >
      <div className="px-6 md:px-10 pt-10 md:pt-14 pb-8">
        <span className={`type-label ${eyebrowClassName}`}>{eyebrow}</span>
        <h2 className="type-h2 mt-4">{title}</h2>
        {children}
      </div>
      <div className="px-6 md:px-10 pb-8 md:pb-10">
        {/* A div, not a button: this sits inside the card's anchor, and nesting
            interactive elements is invalid. It is styled as the call to action
            and the whole card is the hit area. */}
        <div
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 md:py-5 type-label !tracking-[0.12em] border transition-colors ${buttonClassName}`}
        >
          {cta}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            className="shrink-0 transition-transform group-hover/card:translate-x-1"
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
          className="bg-bg text-dark hover:bg-bg-alt border-b cards:border-b-0 cards:border-r border-border-light"
          eyebrowClassName="text-accent"
          buttonClassName="bg-dark text-linen-100 border-dark group-hover/card:bg-accent group-hover/card:border-accent"
        >
          <p className="type-body-sm text-dark/70 mt-4">
            Everyone running for mayor and in all 25 wards &mdash; who they
            are, what they say they will build, and where to find them.
            Straight from the City Clerk&rsquo;s official list, refreshed
            daily.
          </p>
          <ul className="mt-7 divide-y divide-border-light border-t border-border-light">
            {[
              ["Mayor", "The full field, with bios and campaign sites"],
              ["25 wards", "Every council race, with a ward locator map"],
              ["Key dates", "Advance voting, vote-by-mail, election day"],
            ].map(([label, body]) => (
              <li key={label} className="py-4">
                <span className="type-label-sm text-accent">{label}</span>
                <p className="font-serif text-[0.9375rem] leading-[1.45] text-dark/80 mt-1.5">
                  {body}
                </p>
              </li>
            ))}
          </ul>
        </ElectionCard>

        <ElectionCard
          href={SURVEY_PATH}
          eyebrow="Candidate survey"
          title="Take our candidate survey"
          cta="Read the survey questions"
          className="bg-bg-alt text-dark hover:bg-bg"
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
      <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-2 md:gap-x-12 items-start">
        <div>
          <SectionLabel as="h2">Reach out</SectionLabel>
          <p className="type-body text-dark/80 mt-6">
            We publish our questions, our sources and our reasoning, and we
            would rather answer a hard question than dodge it. If something
            here looks wrong, incomplete or unfair &mdash; or you want to know
            who we are and who funds us &mdash; ask us directly.
          </p>
        </div>
        <div className="mt-8 md:mt-0">
          <ul className="divide-y divide-border-light border-y border-border-light">
            {[
              {
                label: "Anyone",
                body: "Questions, corrections, or a tip on a race we are missing.",
              },
              {
                label: "Candidates",
                body: "Ask about the survey, or send us a correction to your entry.",
              },
              {
                label: "Volunteers",
                body: "Tell us what you want to work on and we will find you something.",
              },
            ].map((row) => (
              <li key={row.label} className="py-4">
                <span className="type-label-sm text-accent">{row.label}</span>
                <p className="font-serif text-[1rem] leading-[1.45] text-dark/80 mt-1.5">
                  {row.body}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <LinkButton
              href={`mailto:${CONTACT_EMAIL}`}
              variant="primary"
              className="justify-center px-6 py-4 md:py-5 !tracking-[0.12em]"
            >
              Email {CONTACT_EMAIL}
            </LinkButton>
            <LinkButton
              href="/toronto/vote/get-involved"
              variant="secondary"
              className="justify-center px-6 py-4 md:py-5 !tracking-[0.12em]"
            >
              Get involved
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function SubscribeCTA() {
  return (
    <section className="px-5 py-16 md:py-24 bg-bg">
      <div className="max-w-[760px] mx-auto text-center">
        <SectionLabel as="h2">Be first to know what&rsquo;s possible</SectionLabel>
        <p className="type-body mt-4 mb-8 text-dark/80">
          Get new memos, updates from our team, and ideas to help Toronto grow.
        </p>
        <div className="flex justify-center">
          <SubscribeButton variant="accent" source="inline">
            Subscribe
          </SubscribeButton>
        </div>
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
