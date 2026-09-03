import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import LiveCountdown from "@/components/elections/LiveCountdown";
import { PledgeButton } from "@/components/elections/PledgeButton";
import { getSiteConfig } from "@/lib/api";
import { buildGraph } from "@/lib/schemas/graph";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";
import { generateFAQPageSchema } from "@/lib/schemas/generators/faq-page";
import { generateVotingEventSchema } from "@/lib/schemas/generators/event";
import { breakdown, msUntil, periodTiming } from "@/lib/elections/dates";
import { getToronto2026 } from "../data";
import {
  ALL_PERIODS,
  ELECTION,
  ELECTION_DAY,
  FULL_CALENDAR,
  HOW_TO_VOTE_PATH,
  KEY_DATES_PATH,
  MYVOTE_URL,
  SOURCE_URLS,
  VOTING_PERIODS,
  type VotingPeriod,
} from "../key-dates";

/* Internal destinations this page points at. Written once here rather than
   inlined at each call site: this page is the top of the funnel for the
   "when is the election" queries, and every one of those readers still has to
   find out who is on their ballot. */
const LANDING_PATH = ELECTION.basePath;
const MAYOR_PATH = `${LANDING_PATH}#candidates`;
const WARDS_PATH = `${LANDING_PATH}#wards`;
const wardPath = (token: string) => `${LANDING_PATH}/wards/${token}`;

/* Statically rendered and revalidated hourly. The day counts baked into the
   HTML are therefore at most an hour stale, which is what crawlers and no-JS
   readers see; every visitor with JS gets corrected to the second on mount.
   Deliberately not force-dynamic — that would cost the CDN cache and buy no
   SEO. */
export const revalidate = 3600;

const CANONICAL = KEY_DATES_PATH;
const TITLE = "When Is the Toronto Election? 2026 Dates & Deadlines";
const DESCRIPTION =
  "Toronto votes Monday, October 26, 2026. Live countdowns to advance voting (Oct 6–11), the vote-by-mail deadline (Sept 24) and election day, plus every key date.";

export const metadata: Metadata = {
  // Absolute because /toronto's layout appends "| Build Canada - Toronto",
  // which would push the title well past what Google renders.
  title: { absolute: `${TITLE} | Build Canada` },
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "When Is the Toronto Election?",
    description: DESCRIPTION,
    type: "website",
    url: CANONICAL,
  },
};

/* The eight questions people actually type. Each answer is written to stand on
   its own — repeating the date rather than saying "see above" — because these
   are lifted verbatim into the FAQPage JSON-LD, where there is no "above".

   Eligibility, ID and same-day registration are summarised from the City
   Clerk's own pages (linked in every answer); we are restating their rules,
   not making our own.

   `cta` renders as a link under the answer but is deliberately *not* folded
   into the JSON-LD answer text — a schema answer that reads "click here" is
   worse than one that doesn't, and Google strips the markup anyway. It exists
   so a reader who came for a date leaves with somewhere to go next. */
const FAQS: {
  question: string;
  answer: string;
  cta?: { label: string; href: string };
}[] = [
  {
    question: "When is the Toronto election?",
    answer:
      "Toronto's 2026 municipal election is Monday, October 26, 2026. Voting places are open from 10 a.m. to 8 p.m. Toronto voters elect a mayor, 25 city councillors and school board trustees on that day.",
    cta: { label: "See every race on the 2026 ballot", href: LANDING_PATH },
  },
  {
    question: "When can I vote early in Toronto?",
    answer:
      "Advance voting runs Tuesday, October 6 to Sunday, October 11, 2026, from 10 a.m. to 7 p.m. each day. Any eligible Toronto voter can use advance voting — you do not need a reason or an excuse to vote early.",
  },
  {
    question: "What is the deadline to vote by mail in Toronto?",
    answer:
      "There are two deadlines. You must apply for a mail-in voting package by Thursday, September 24, 2026 at 4:30 p.m. Your completed package must then be received by Toronto Elections by Wednesday, October 14, 2026 at 12 p.m. (noon) — received, not postmarked, so mail it well in advance or use a drop-off location.",
  },
  {
    question: "What time do polls open and close on election day?",
    answer:
      "Voting places are open from 10 a.m. to 8 p.m. on Monday, October 26, 2026. During advance voting, October 6 to 11, the hours are 10 a.m. to 7 p.m.",
  },
  {
    question: "Who can vote in the Toronto municipal election?",
    answer:
      "To vote you must be a Canadian citizen, at least 18 years old, and either a resident of Toronto or a non-resident who owns or rents property in Toronto (or whose spouse does) — and not prohibited from voting under any law.",
    cta: { label: "The full step-by-step guide to voting", href: HOW_TO_VOTE_PATH },
  },
  {
    question: "Do I need to register before I can vote?",
    answer:
      "You can check, add or update your information on the voters' list online through MyVote until Sunday, October 11, 2026 at 7 p.m. If you miss that, you have not lost your vote: you can still add your name to the voters' list in person during advance voting or on election day.",
  },
  {
    question: "What ID do I need to bring to vote in Toronto?",
    answer:
      "Bring one piece of identification showing your name and your qualifying Toronto address. Photo ID is not required, and a wide range of documents qualify — a driver's licence, a utility bill, a bank statement, a lease, a pay stub, a property tax assessment. Note that your voter information card is not accepted as identification.",
  },
  {
    question: "Who is running for mayor and in my ward?",
    answer:
      "Build Canada tracks every race in the 2026 Toronto election — the candidates for mayor and all 25 council wards, with their platforms and campaign sites. Look up your ward by postal code on our Toronto 2026 election page.",
    cta: { label: "Look up your ward and see its candidates", href: WARDS_PATH },
  },
];

export default async function WhenIsTheTorontoElectionPage() {
  // The roster, for the ballot section's live counts and its 25 ward links.
  // Same source the landing and ward pages read, so the counts here can't
  // disagree with the pages they link to; it falls back to the local roster
  // when York Factory is unreachable, so this never blocks the dates.
  const view = await getToronto2026();
  const mayoralCount = view.mayoral.filter((c) => !c.withdrawn).length;
  /* `view.raceCount` and `view.candidateCount` span *every* race, trustees
     included — 55 and counting. The "mayor and council" figure this page
     quotes is the narrower one, so derive it: one city-wide mayoral race plus
     one council race per ward. Summing `ward.count` is safe in Toronto
     because each ward elects its own councillor; in Brampton one race covers
     two wards and this would double-count. */
  const mayorAndCouncilRaces = view.wards.length + 1;
  const councilCandidateCount = view.wards.reduce((n, w) => n + w.count, 0);

  // One instant for the whole render, so every card agrees. Absolute time is
  // all this page needs: the countdowns show elapsed *duration* (to match the
  // hours/minutes/seconds beside them), not calendar days, so there is no
  // timezone to get wrong. The wall-clock dates themselves are baked into
  // key-dates.ts with an explicit -04:00 offset.
  const absoluteNow = new Date();
  const { siteUrl } = getSiteConfig();

  const jsonLd = buildGraph(
    generateFAQPageSchema(FAQS),
    generateBreadcrumbSchema(CANONICAL, "When Is the Toronto Election?", siteUrl),
    ...ALL_PERIODS.map((period) =>
      generateVotingEventSchema({
        name: `${period.title} — Toronto 2026 municipal election`,
        description: period.blurb,
        startDate: period.opensAt ?? period.closesAt,
        endDate: period.closesAt,
        url: `${siteUrl}${CANONICAL}`,
        cityLabel: ELECTION.cityLabel,
        organizerName: "City of Toronto Elections",
        organizerUrl: SOURCE_URLS.city,
      }),
    ),
  );

  const electionDayTiming = periodTiming(ELECTION_DAY, absoluteNow);

  return (
    <div className={`${ELECTION.themeClass ?? ""} bg-bg text-dark`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
        {/* ── Hero: the answer, then the headline countdown ────── */}
        <section className="px-6 py-14 md:px-14 md:py-16 border-b-2 border-dark">
          <p className="type-label text-accent mb-3.5">{ELECTION.eyebrow}</p>
          <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(2.6rem,6vw,5rem)] max-w-[20ch] text-balance mb-7">
            When Is the Toronto Election?
          </h1>
          {/* The direct answer, in the first sentence — this is the paragraph
              a featured snippet or an AI answer will lift. */}
          <p className="font-serif text-[clamp(1.15rem,1.6vw,1.4rem)] leading-[1.5] max-w-[62ch]">
            Toronto&rsquo;s 2026 municipal election is{" "}
            <strong className="font-semibold">
              {ELECTION.voteDayLabel}, 2026
            </strong>
            , with voting places open {ELECTION.pollHoursLabel}. You can also
            vote early during advance voting,{" "}
            <strong className="font-semibold">October 6&ndash;11</strong>, or
            vote by mail if you applied by{" "}
            <strong className="font-semibold">September 24</strong>.
          </p>

          <div className="mt-11 pt-10 border-t border-border-light">
            <LiveCountdown
              opensAt={ELECTION_DAY.opensAt}
              closesAt={ELECTION_DAY.closesAt}
              initialParts={breakdown(
                electionDayTiming.targetInstant
                  ? msUntil(electionDayTiming.targetInstant, absoluteNow)
                  : 0,
              )}
              initialState={electionDayTiming.state}
              labels={{
                upcoming: ELECTION_DAY.upcomingLabel,
                open: ELECTION_DAY.openLabel,
                closed: ELECTION_DAY.closedLabel,
              }}
              size="2xl"
            />

            {/* The page's primary action. MyVote is where registration
                actually happens, so it gets the solid blue treatment and
                everything else on the page stays subordinate to it. */}
            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Button
                as="external-link"
                variant="auburn"
                href={MYVOTE_URL}
                className="px-7 py-4.5"
              >
                Check or register to vote
              </Button>
              <p className="font-serif text-[1rem] leading-[1.4] text-text-secondary max-w-[30ch]">
                Registering online closes{" "}
                <span className="text-accent">Oct 11, 7 p.m.</span> &mdash;
                after that, sign up in person at the polls.
              </p>
            </div>

            {/* Deliberately text, not buttons: MyVote above stays the only
                solid CTA in the hero, but a reader who already knows the date
                — most of the traffic this page gets — needs a way onward to
                the races without scrolling the whole calendar. */}
            <p className="mt-7 font-serif text-[1.05rem] leading-[1.6] max-w-[56ch] text-text-secondary">
              Already know the date? Skip ahead to{" "}
              <InlineLink href={MAYOR_PATH}>
                the {mayoralCount} candidates for mayor
              </InlineLink>
              , find{" "}
              <InlineLink href={WARDS_PATH}>
                the council race in your ward
              </InlineLink>
              , or read{" "}
              <InlineLink href={HOW_TO_VOTE_PATH}>
                how to vote step by step
              </InlineLink>
              .
            </p>
          </div>
        </section>

        {/* ── The other three voting periods ───────────────────── */}
        <section className="border-b-2 border-dark">
          <div className="px-6 pt-12 pb-8 md:px-14">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.9rem,3.2vw,2.5rem)] mb-2.5">
              Every way to vote, and how long you have
            </h2>
            <p className="font-serif text-[1.1rem] leading-[1.5] max-w-[58ch] text-text-secondary">
              Three deadlines fall before election day. Two of them are already
              behind most people who wait for the campaign to get loud.
            </p>
          </div>
          <div className="grid md:grid-cols-3 border-t border-border-light">
            {VOTING_PERIODS.map((period, i) => (
              <PeriodCard
                key={period.id}
                period={period}
                now={absoluteNow}
                className={[
                  cellPadding(i, VOTING_PERIODS.length),
                  i > 0 && "border-t md:border-t-0 md:border-l border-border-light",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            ))}
          </div>
        </section>

        {/* ── Who's on the ballot ──────────────────────────────── */}
        {/* The dates are the query; the ballot is the reason the query was
            worth answering. This sits above the calendar table on purpose —
            a reader who bounces after the countdown should still have passed
            a link to the races. */}
        <section id="ballot" className="border-b-2 border-dark scroll-mt-24">
          <div className="px-6 pt-12 pb-8 md:px-14">
            <p className="type-label text-accent mb-3.5">Before you go</p>
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.9rem,3.2vw,2.5rem)] mb-2.5">
              Who&rsquo;s on your ballot
            </h2>
            <p className="font-serif text-[1.1rem] leading-[1.5] max-w-[58ch] text-text-secondary">
              You get three votes on {ELECTION.voteDayLabel}: mayor, the
              councillor for your ward, and a school board trustee. We track
              all {mayorAndCouncilRaces} mayor and council races, and the
              trustee races alongside them &mdash; {view.candidateCount}{" "}
              candidates in all.
            </p>
          </div>

          <div className="grid md:grid-cols-2 border-t border-border-light">
            <div className={`px-6 py-11 ${cellPadding(0, 2)}`}>
              <h3 className="font-sans font-medium text-[1.2rem] leading-[1.25] tracking-[-0.02em] mb-2.5">
                The race for mayor
              </h3>
              <p className="font-serif text-[1.05rem] leading-[1.5] text-text-secondary mb-6 max-w-[46ch]">
                {mayoralCount} candidates are registered city-wide, and every
                Toronto voter votes in this one. Photos, platforms and campaign
                sites for each.
              </p>
              <Button as="link" variant="auburn" href={MAYOR_PATH}>
                See the {mayoralCount} candidates for mayor
              </Button>
            </div>
            <div
              className={`px-6 py-11 ${cellPadding(1, 2)} border-t md:border-t-0 md:border-l border-border-light`}
            >
              <h3 className="font-sans font-medium text-[1.2rem] leading-[1.25] tracking-[-0.02em] mb-2.5">
                Your council race
              </h3>
              <p className="font-serif text-[1.05rem] leading-[1.5] text-text-secondary mb-6 max-w-[46ch]">
                The vote that decides what gets built on your street, and the
                one nobody covers. {councilCandidateCount} candidates are
                running across the {view.wards.length} wards &mdash; enter a
                postal code and we&rsquo;ll show you yours.
              </p>
              <Button as="link" variant="ghost" href={WARDS_PATH}>
                Find your ward by postal code
              </Button>
            </div>
          </div>

          {/* All 25 wards, by name. Crawlable, descriptive anchor text, and
              faster than the postal-code lookup for anyone who already knows
              which ward they live in. */}
          <div className="px-6 md:px-14 pt-11 pb-12 border-t border-border-light">
            <h3 className="type-label text-text-secondary !tracking-[0.08em] mb-5">
              Or go straight to a ward
            </h3>
            <ul className="grid gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
              {view.wards.map((ward) => (
                <li key={ward.n} className="border-b border-border-light">
                  <Link
                    href={wardPath(ward.n)}
                    className="group/ward flex items-baseline gap-3 py-3 transition-colors hover:text-accent"
                  >
                    <span className="type-label-sm text-accent !tracking-[0.08em] tabular-nums shrink-0">
                      {ward.number}
                    </span>
                    <span className="font-serif text-[1.05rem] leading-[1.35] flex-1">
                      {ward.name}
                    </span>
                    <span className="type-label-sm text-text-secondary !tracking-[0.06em] shrink-0 tabular-nums">
                      {ward.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-5 font-serif text-[0.95rem] leading-[1.5] text-text-secondary">
              The number on the right is how many candidates are registered
              for that ward&rsquo;s council seat.
            </p>
          </div>
        </section>

        {/* ── The full calendar ────────────────────────────────── */}
        <section id="all-dates" className="border-b-2 border-dark scroll-mt-24">
          <div className="px-6 pt-12 pb-8 md:px-14">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.9rem,3.2vw,2.5rem)]">
              All 2026 Toronto election dates
            </h2>
          </div>
          <div className="px-6 md:px-14 pb-8 overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[34rem]">
              <caption className="sr-only">
                Key dates in the 2026 Toronto municipal election
              </caption>
              <thead>
                <tr className="border-b border-dark">
                  <th scope="col" className="type-label py-3 pr-6 align-bottom">
                    Milestone
                  </th>
                  <th scope="col" className="type-label py-3 pr-6 align-bottom">
                    Date
                  </th>
                  <th scope="col" className="type-label py-3 align-bottom">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {FULL_CALENDAR.map((row) => {
                  const passed =
                    absoluteNow.getTime() >= Date.parse(row.instant);
                  return (
                    <tr
                      key={`${row.label}-${row.instant}`}
                      className="border-b border-border-light align-top"
                    >
                      <th
                        scope="row"
                        className="py-4 pr-6 font-serif font-normal text-[1.05rem] leading-[1.4]"
                      >
                        {row.label}
                        {row.note && (
                          <span className="block mt-1 font-serif text-[0.95rem] leading-[1.4] text-text-secondary">
                            {row.note}
                          </span>
                        )}
                      </th>
                      <td className="py-4 pr-6 font-serif text-[1.05rem] leading-[1.4] text-accent whitespace-nowrap">
                        {row.dateLabel}
                      </td>
                      <td className="py-4 type-label-sm !tracking-[0.1em] text-text-secondary whitespace-nowrap">
                        {passed ? "Passed" : "Upcoming"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="px-6 md:px-14 pb-12 font-serif text-[0.95rem] leading-[1.5] text-text-secondary max-w-[62ch]">
            Source:{" "}
            <a
              href={SOURCE_URLS.keyDates}
              className="underline hover:text-accent"
              target="_blank"
              rel="noopener noreferrer"
            >
              City of Toronto Elections, key dates
            </a>
            . Dates and times are Toronto local time. Toronto Elections is the
            authority on all of this &mdash; if anything here disagrees with
            toronto.ca, believe toronto.ca.
          </p>
        </section>

        {/* ── Three ways to vote ───────────────────────────────── */}
        <section className="border-b-2 border-dark">
          <div className="px-6 pt-12 pb-8 md:px-14">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.9rem,3.2vw,2.5rem)]">
              Three ways to vote in Toronto
            </h2>
          </div>
          <div className="grid md:grid-cols-3 border-t border-border-light">
            <HowToVote
              heading="On election day"
              dateLine={`${ELECTION.voteDayLabel}, ${ELECTION.pollHoursLabel}`}
              className={cellPadding(0, 3)}
            >
              <p>
                Vote at your assigned voting place. Bring one piece of ID
                showing your name and your Toronto address &mdash; photo ID is
                not required, and a utility bill or bank statement is enough.
              </p>
              <p>
                Your voter information card tells you where to go, but it is not
                accepted as identification, so bring something else too.
              </p>
            </HowToVote>
            <HowToVote
              heading="Advance voting"
              dateLine="Oct 6 – 11, 10 a.m. – 7 p.m. daily"
              className={`${cellPadding(1, 3)} border-t md:border-t-0 md:border-l border-border-light`}
            >
              <p>
                Six days of early voting, open to every eligible voter with no
                reason required. Advance voting places are usually fewer and
                busier than election-day ones, so check the location before you
                travel.
              </p>
              <p>
                If you are not on the voters&rsquo; list, you can be added in
                person when you arrive.
              </p>
            </HowToVote>
            <HowToVote
              heading="By mail"
              dateLine="Apply by Sept 24 · return by Oct 14, noon"
              className={`${cellPadding(2, 3)} border-t md:border-t-0 md:border-l border-border-light`}
            >
              <p>
                Request a package through MyVote by September 24 at 4:30 p.m.
                Toronto Elections must then physically receive your completed
                ballot by noon on October 14.
              </p>
              <p>
                That second date is the one people miss: a ballot postmarked
                October 13 that arrives October 15 does not count.
              </p>
            </HowToVote>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section id="faq" className="border-b-2 border-dark scroll-mt-24">
          <div className="px-6 pt-12 pb-8 md:px-14">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.9rem,3.2vw,2.5rem)]">
              Frequently asked questions
            </h2>
          </div>
          <div className="px-6 md:px-14 pb-12 grid gap-9 md:grid-cols-2 md:gap-x-14">
            {FAQS.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-sans font-medium text-[1.15rem] leading-[1.3] tracking-[-0.02em] mb-2.5">
                  {faq.question}
                </h3>
                <p className="font-serif text-[1.05rem] leading-[1.5] text-text-secondary">
                  {faq.answer}
                </p>
                {faq.cta && (
                  <p className="mt-2.5">
                    <InlineLink href={faq.cta.href}>{faq.cta.label}</InlineLink>
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="px-6 md:px-14 pb-12 font-serif text-[0.95rem] leading-[1.5] text-text-secondary max-w-[62ch]">
            Eligibility, identification and voters&rsquo;-list rules are
            summarised from the City of Toronto&rsquo;s{" "}
            <a
              href={SOURCE_URLS.city}
              className="underline hover:text-accent"
              target="_blank"
              rel="noopener noreferrer"
            >
              elections pages
            </a>
            :{" "}
            <a
              href={SOURCE_URLS.identification}
              className="underline hover:text-accent"
              target="_blank"
              rel="noopener noreferrer"
            >
              accepted ID
            </a>{" "}
            and{" "}
            <a
              href={SOURCE_URLS.votersList}
              className="underline hover:text-accent"
              target="_blank"
              rel="noopener noreferrer"
            >
              the voters&rsquo; list
            </a>
            .
          </p>
        </section>

        {/* ── Closing CTA ──────────────────────────────────────── */}
        <section className="grid md:grid-cols-2">
          <div className="px-6 py-12 md:px-14 md:py-14">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.75rem,3vw,2.35rem)] max-w-[24ch] text-balance mb-5">
              Knowing the date is the easy part.
            </h2>
            <p className="font-serif text-[1.1rem] leading-[1.5] max-w-[46ch] mb-7">
              {mayorAndCouncilRaces} mayor and council races are on the line
              across the city, and most of them get no coverage at all. We
              track every one, plus the trustee races &mdash;{" "}
              {view.candidateCount} candidates, with platforms and campaign
              sites.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button as="link" variant="auburn" href={MAYOR_PATH}>
                See the candidates for mayor
              </Button>
              <Button as="link" variant="ghost" href={WARDS_PATH}>
                Find your ward
              </Button>
              <Button as="link" variant="ghost" href="#ballot">
                Browse all {view.wards.length} wards
              </Button>
              <Button as="link" variant="ghost" href={HOW_TO_VOTE_PATH}>
                How to vote
              </Button>
            </div>
          </div>
          <div className="px-6 py-12 md:px-14 md:py-14 border-t-2 md:border-t-0 md:border-l border-border-light bg-bg-alt flex flex-col justify-center">
            <p className="type-label text-accent mb-3.5">Ready to vote?</p>
            <p className="font-serif text-[1.15rem] leading-[1.45] max-w-[34ch] mb-6">
              Put your name on the record. Pledging takes ten seconds &mdash;
              and it&rsquo;s the first step to actually showing up.
            </p>
            <PledgeButton
              election={ELECTION.slug}
              source="when-is-the-election"
              className="group/btn self-start inline-flex items-center gap-3 type-button text-bg bg-dark px-5 py-4 transition-colors hover:bg-black cursor-pointer"
            >
              Pledge to vote
              <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
            </PledgeButton>
          </div>
        </section>
      </div>
    </div>
  );
}

/* An internal link inside a paragraph. Underlined rather than buttoned, so
   the prose keeps reading as prose and the solid CTAs stay distinguishable
   from it. Next's Link, not an anchor, so these prefetch like the rest of the
   site's navigation. */
function InlineLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-dark underline decoration-border-light decoration-1 underline-offset-[3px] transition-colors hover:text-accent hover:decoration-accent"
    >
      {children}
    </Link>
  );
}

/* Horizontal padding for a cell in a full-bleed three-up grid. The dividers
   run edge to edge, but the first and last cells have to inset to md:px-14 —
   the gutter every other section on this page uses — or their content sits
   left of the heading above it and hugs the frame. Written out per side rather
   than as md:px-9 plus an override, so it doesn't depend on Tailwind's
   utility ordering. */
function cellPadding(index: number, total: number): string {
  const left = index === 0 ? "md:pl-14" : "md:pl-9";
  const right = index === total - 1 ? "md:pr-14" : "md:pr-9";
  return `${left} ${right}`;
}

function PeriodCard({
  period,
  now,
  className = "",
}: {
  period: VotingPeriod;
  now: Date;
  className?: string;
}) {
  const timing = periodTiming(period, now);
  const initialParts = breakdown(
    timing.targetInstant ? msUntil(timing.targetInstant, now) : 0,
  );

  return (
    <div className={`px-6 py-11 flex flex-col ${className}`}>
      <div className="flex items-center gap-3 mb-5">
        <h3 className="font-sans font-medium text-[1.2rem] leading-[1.25] tracking-[-0.02em]">
          {period.title}
        </h3>
        {/* Only a real window can be "open now". A pure deadline (no opensAt)
            is live from the moment the page exists, so the pill would be
            meaningless on it. */}
        {timing.state === "open" && period.opensAt && (
          <span className="type-label-sm !tracking-[0.1em] text-bg bg-accent px-2 py-1 whitespace-nowrap">
            Open now
          </span>
        )}
      </div>

      <LiveCountdown
        opensAt={period.opensAt}
        closesAt={period.closesAt}
        initialParts={initialParts}
        initialState={timing.state}
        labels={{
          upcoming: period.upcomingLabel,
          open: period.openLabel,
          closed: period.closedLabel,
        }}
      />

      <p className="mt-6 font-serif text-[1rem] leading-[1.4] text-accent">
        {period.dateLabel}
        {period.hoursLabel && (
          <span className="block text-text-secondary">{period.hoursLabel}</span>
        )}
      </p>
      <p className="mt-4 font-serif text-[1rem] leading-[1.5] text-text-secondary flex-1">
        {period.blurb}
      </p>
      {/* Solid while the period is actually open, outlined otherwise — so the
          one thing a reader can act on today is the one that draws the eye. */}
      <div className="mt-7 self-start">
        <Button
          as="external-link"
          variant={
            timing.state === "open" && period.opensAt ? "auburn" : "ghost"
          }
          href={period.href}
        >
          {period.hrefLabel}
        </Button>
      </div>
    </div>
  );
}

function HowToVote({
  heading,
  dateLine,
  children,
  className = "",
}: {
  heading: string;
  dateLine: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-6 py-11 ${className}`}>
      <h3 className="font-sans font-medium text-[1.2rem] leading-[1.25] tracking-[-0.02em] mb-2">
        {heading}
      </h3>
      <p className="font-serif text-[1rem] leading-[1.4] text-accent mb-5">
        {dateLine}
      </p>
      <div className="font-serif text-[1.05rem] leading-[1.5] text-text-secondary space-y-3.5">
        {children}
      </div>
    </div>
  );
}
