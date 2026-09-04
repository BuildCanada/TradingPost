import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { getSiteConfig } from "@/lib/api";
import { buildGraph } from "@/lib/schemas/graph";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";
import { generateFAQPageSchema } from "@/lib/schemas/generators/faq-page";
import { generateVotingEventSchema } from "@/lib/schemas/generators/event";
import { PeriodCountdown } from "../PeriodCountdown";
import {
  ADVANCE_VOTING_PATH,
  ELECTION,
  HOW_TO_VOTE_PATH,
  KEY_DATES_PATH,
  MYVOTE_URL,
  SOURCE_URLS,
  VOTE_BY_MAIL_PATH,
  votingPeriod,
} from "../key-dates";

/* Hourly: the hero swaps from the application deadline to the return deadline
   the moment the first one passes, and that moment is 4:30 p.m. — a daily
   revalidate would leave a dead countdown up until the following morning. */
export const revalidate = 3600;

const APPLY = votingPeriod("mail-in-apply");
const RETURN = votingPeriod("mail-in-return");

const CANONICAL = VOTE_BY_MAIL_PATH;
const DESCRIPTION =
  "Voting by mail in Toronto's 2026 municipal election has two deadlines: apply for a package by Thursday, September 24 at 4:30 p.m., and Toronto Elections must receive your completed ballot by noon on Wednesday, October 14.";

export const metadata: Metadata = {
  // Absolute because /toronto's layout appends "| Build Canada - Toronto".
  title: {
    absolute: "Vote by Mail in Toronto: 2026 Deadlines and How to Apply | Build Canada",
  },
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "Vote by Mail in Toronto",
    description: DESCRIPTION,
    type: "website",
    url: CANONICAL,
  },
};

/* Mail owns the two-deadline questions. The advance page owns early voting and
   the election-day page owns "when is the election" — no overlap, so the three
   are not bidding against each other for the same result. */
const FAQS: { question: string; answer: string }[] = [
  {
    question: "What is the deadline to vote by mail in Toronto?",
    answer:
      "There are two, and both are hard deadlines. You must apply for a mail-in voting package by Thursday, September 24, 2026 at 4:30 p.m. Toronto Elections must then have your completed package in hand by Wednesday, October 14, 2026 at 12 p.m. (noon).",
  },
  {
    question: "How do I apply to vote by mail in Toronto?",
    answer:
      "Request a package through MyVote, the City of Toronto's own portal, or call Toronto Elections at 416-338-1111 and choose option 5. Applications opened September 1, 2026 and close September 24 at 4:30 p.m.",
  },
  {
    question: "Does my mail-in ballot have to be postmarked or received by the deadline?",
    answer:
      "Received. Toronto Elections must physically have your completed package by noon on October 14, 2026 — a ballot postmarked October 13 that arrives on October 15 does not count. Mail it well in advance or use one of the drop boxes.",
  },
  {
    question: "Where can I drop off my mail-in ballot in Toronto?",
    answer:
      "There is one yellow drop box in each of Toronto's 25 wards, available from October 1 until noon on October 14. You can use any of them, not only the one in your own ward. The package also comes with a prepaid Canada Post envelope.",
  },
  {
    question: "Can I still vote in person if I asked for a mail-in package?",
    answer:
      "Yes, as long as you have not returned it. If you change your mind before sending your completed package back, you can vote in person instead and the package is cancelled automatically. Once you have returned it your vote is complete and in-person voting is no longer available to you.",
  },
  {
    question: "Who can vote by mail in Toronto?",
    answer:
      "Any eligible Toronto voter. Voting by mail is not restricted to people who are away or unable to attend — there is no reason to give. You do need to apply for it, which is what separates it from the other ways to vote.",
  },
];

export default function VoteByMailPage() {
  const now = new Date();
  const { siteUrl } = getSiteConfig();

  /* Which deadline the hero counts down. Before 4:30 p.m. on September 24 the
     only thing a reader can act on is applying; after it, the only thing left
     is getting the package back in time. Counting down a deadline that has
     already gone is worse than counting down nothing. */
  const applyClosed = now.getTime() > Date.parse(APPLY.closesAt);
  const active = applyClosed ? RETURN : APPLY;

  const jsonLd = buildGraph(
    generateFAQPageSchema(FAQS),
    generateBreadcrumbSchema(CANONICAL, "Vote by Mail in Toronto", siteUrl),
    ...[APPLY, RETURN].map((period) =>
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

  return (
    <div className={`${ELECTION.themeClass ?? ""} bg-bg text-dark`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="px-6 py-14 md:px-14 md:py-16 border-b-2 border-dark">
          <p className="type-label text-accent mb-3.5">{ELECTION.eyebrow}</p>
          <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(2.6rem,6vw,5rem)] max-w-[18ch] text-balance mb-7">
            Vote by Mail in Toronto
          </h1>
          {/* The direct answer, first sentence — the snippet target. Both
              deadlines, because quoting only the first one is how people end
              up with an uncounted ballot. */}
          <p className="font-serif text-[clamp(1.15rem,1.6vw,1.4rem)] leading-[1.5] max-w-[62ch]">
            Voting by mail in Toronto&rsquo;s 2026 municipal election has two
            deadlines. Apply for a package by{" "}
            <strong className="font-semibold">
              Thursday, September 24, 4:30 p.m.
            </strong>
            , then get your completed ballot back to Toronto Elections by{" "}
            <strong className="font-semibold">
              noon on Wednesday, October 14
            </strong>{" "}
            &mdash; received, not postmarked.
          </p>

          <div className="mt-11 pt-10 border-t border-border-light">
            <p className="type-label text-accent mb-5">{active.title}</p>
            <PeriodCountdown period={active} now={now} size="2xl" />
            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Button
                as="external-link"
                variant="auburn"
                href={applyClosed ? SOURCE_URLS.mailIn : MYVOTE_URL}
                className="px-7 py-4.5"
              >
                {applyClosed
                  ? "How to return your ballot"
                  : "Apply through MyVote"}
              </Button>
              <p className="font-serif text-[1rem] leading-[1.4] text-text-secondary max-w-[32ch]">
                {applyClosed
                  ? "Applications closed on September 24. If you have a package, it must arrive by noon on October 14."
                  : "Or call Toronto Elections at 416-338-1111 and choose option 5."}
              </p>
            </div>
          </div>
        </section>

        {/* ── The two deadlines ────────────────────────────────── */}
        {/* Stated as dates, not as clocks. These cards each had their own
            countdown, which put three running timers on one page and made the
            hero's — the only one a reader needs, since it always shows the
            deadline that is still live — compete with two smaller copies of
            itself. */}
        <section id="deadlines" className="border-b-2 border-dark scroll-mt-24">
          <div className="px-6 pt-12 pb-8 md:px-14">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.9rem,3.2vw,2.5rem)] mb-2.5">
              Two important deadlines
            </h2>
            <p className="font-serif text-[1.1rem] leading-[1.5] max-w-[58ch] text-text-secondary">
              Applying on time is the easy half. Getting the ballot back in
              time is the half that decides whether it counts.
            </p>
          </div>
          <div className="grid md:grid-cols-2 border-t border-border-light">
            <div className="px-6 py-11 md:pl-14 md:pr-9">
              <p className="type-label text-accent mb-3">Deadline one</p>
              <h3 className="font-sans font-medium text-[1.3rem] leading-[1.2] tracking-[-0.02em] mb-3">
                Apply by Thu, Sept 24, 4:30 p.m.
              </h3>
              <p className="font-serif text-[1.05rem] leading-[1.5] text-text-secondary max-w-[44ch]">
                Applications opened September 1. Request the package through
                MyVote or by phone. After 4:30 p.m. on September 24 no more
                packages are issued, and mail is off the table for this
                election.
              </p>
            </div>
            <div className="px-6 py-11 md:pl-9 md:pr-14 border-t md:border-t-0 md:border-l border-border-light">
              <p className="type-label text-accent mb-3">Deadline two</p>
              <h3 className="font-sans font-medium text-[1.3rem] leading-[1.2] tracking-[-0.02em] mb-3">
                Received by Wed, Oct 14, noon
              </h3>
              <p className="font-serif text-[1.05rem] leading-[1.5] text-text-secondary max-w-[44ch]">
                Toronto Elections must physically have your package by 12 p.m.
                &mdash; not have it postmarked by then. A ballot mailed on
                October 13 that lands on October 15 is not counted.
              </p>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section id="how" className="border-b-2 border-dark scroll-mt-24">
          <div className="px-6 pt-12 pb-8 md:px-14">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.9rem,3.2vw,2.5rem)]">
              How it works
            </h2>
          </div>
          <ol className="border-t border-border-light">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="grid md:grid-cols-[6rem_1fr] gap-y-3 px-6 py-10 md:px-14 border-b border-border-light last:border-b-0"
              >
                <div
                  className="font-sans font-medium leading-none text-[clamp(2rem,3.5vw,2.75rem)] tabular-nums text-accent"
                  aria-hidden="true"
                >
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-sans font-medium text-[1.3rem] leading-[1.25] tracking-[-0.02em] mb-2.5">
                    <span className="sr-only">Step {i + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="font-serif text-[1.05rem] leading-[1.55] text-text-secondary max-w-[60ch]">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Returning it ─────────────────────────────────────── */}
        <section id="returning" className="border-b-2 border-dark scroll-mt-24">
          <div className="px-6 pt-12 pb-8 md:px-14">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.9rem,3.2vw,2.5rem)] mb-2.5">
              Getting it back in time
            </h2>
            <p className="font-serif text-[1.1rem] leading-[1.5] max-w-[58ch] text-text-secondary">
              Two routes, one deadline. The drop boxes take the post out of the
              equation, which is why they exist.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 border-t border-border-light">
            <div className="px-6 py-9 md:px-14 border-b border-border-light">
              <h3 className="font-sans font-medium text-[1.1rem] leading-[1.3] tracking-[-0.02em] mb-2">
                Yellow drop boxes
              </h3>
              <p className="font-serif text-[1rem] leading-[1.5] text-text-secondary max-w-[46ch]">
                One in every ward, open from October 1 until noon on October
                14. You can use any of them &mdash; it does not have to be the
                box in your own ward.
              </p>
            </div>
            <div className="px-6 py-9 md:px-14 border-b border-border-light sm:border-l">
              <h3 className="font-sans font-medium text-[1.1rem] leading-[1.3] tracking-[-0.02em] mb-2">
                Canada Post
              </h3>
              <p className="font-serif text-[1rem] leading-[1.5] text-text-secondary max-w-[46ch]">
                The package comes with a prepaid return envelope. Delivery time
                is on you, though: post it days ahead, not on the 13th.
              </p>
            </div>
          </div>
          <div className="px-6 md:px-14 py-10">
            <div className="border border-dark bg-bg-alt px-5 py-5 sm:px-7">
              <p className="type-label text-accent mb-2">Changed your mind?</p>
              <p className="font-serif text-[1.05rem] leading-[1.5] max-w-[62ch]">
                As long as you have not sent your completed package back, you
                can still vote in person &mdash; during advance voting or on
                election day &mdash; and your mail-in package is cancelled
                automatically. Once you have returned it, your vote is
                complete and voting in person is no longer an option.
              </p>
            </div>
          </div>
          <div className="px-6 md:px-14 pb-10">
            <Button
              as="external-link"
              variant="ghost"
              href={SOURCE_URLS.mailIn}
            >
              The City&rsquo;s mail-in voting page
            </Button>
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
              </div>
            ))}
          </div>
          <p className="px-6 md:px-14 pb-12 font-serif text-[0.95rem] leading-[1.5] text-text-secondary max-w-[62ch]">
            Deadlines, drop-box details and the change-of-mind rule are
            summarised from the City of Toronto&rsquo;s{" "}
            <a
              href={SOURCE_URLS.mailIn}
              className="underline hover:text-accent"
              target="_blank"
              rel="noopener noreferrer"
            >
              mail-in voting
            </a>{" "}
            and{" "}
            <a
              href={SOURCE_URLS.keyDates}
              className="underline hover:text-accent"
              target="_blank"
              rel="noopener noreferrer"
            >
              key dates
            </a>{" "}
            pages. Toronto Elections is the authority &mdash; where anything
            here disagrees with toronto.ca, believe toronto.ca.
          </p>
        </section>

        {/* ── Next steps ───────────────────────────────────────── */}
        <section className="grid md:grid-cols-2">
          <div className="px-6 py-12 md:px-14 md:py-14">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.75rem,3vw,2.35rem)] max-w-[24ch] text-balance mb-5">
              A ballot you mail early is a ballot you research early.
            </h2>
            <p className="font-serif text-[1.1rem] leading-[1.5] max-w-[46ch] mb-7">
              Mail-in voters mark their ballot weeks before everyone else, so
              the council race on it is worth reading up on now rather than in
              October.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button as="link" variant="auburn" href={`${ELECTION.basePath}#wards`}>
                Find your ward
              </Button>
              <Button as="link" variant="ghost" href={`${ELECTION.basePath}#candidates`}>
                Candidates for mayor
              </Button>
            </div>
          </div>
          <div className="px-6 py-12 md:px-14 md:py-14 border-t-2 md:border-t-0 md:border-l border-border-light bg-bg-alt flex flex-col justify-center">
            <p className="type-label text-accent mb-3.5">Other ways to vote</p>
            <p className="font-serif text-[1.15rem] leading-[1.45] max-w-[34ch] mb-6">
              Mail is one of the ways. There is also six days of advance
              voting, and election day itself.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button as="link" variant="ghost" href={ADVANCE_VOTING_PATH}>
                Advance voting
              </Button>
              <Button as="link" variant="ghost" href={KEY_DATES_PATH}>
                Election day countdown
              </Button>
              <Button as="link" variant="ghost" href={HOW_TO_VOTE_PATH}>
                How to vote
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const STEPS: { title: string; body: string }[] = [
  {
    title: "Request a package",
    body: "Through MyVote, or by calling 416-338-1111 and choosing option 5. You need to be an eligible Toronto voter; you do not need a reason. Applications close September 24 at 4:30 p.m.",
  },
  {
    title: "Wait for it to arrive",
    body: "Toronto Elections mails the package to the address on your application. Requesting one early is the whole trick — it leaves room for the post in both directions.",
  },
  {
    title: "Mark your ballot",
    body: "Mayor, the councillor for your ward, and a school board trustee, exactly as on an in-person ballot. Follow the instructions in the package for sealing it, which are there to keep your vote secret and your ballot valid.",
  },
  {
    title: "Return it by noon on October 14",
    body: "Use a yellow drop box in any ward, open from October 1, or the prepaid Canada Post envelope. It has to be in Toronto Elections' hands by the deadline — postmarks do not count.",
  },
];
