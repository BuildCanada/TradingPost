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

/* Hourly, like the other pages with a countdown baked into the HTML: what a
   crawler sees is at most an hour stale and every reader with JS is corrected
   to the second on mount. */
export const revalidate = 3600;

const ADVANCE = votingPeriod("advance");

const CANONICAL = ADVANCE_VOTING_PATH;
const DESCRIPTION =
  "Advance voting in Toronto's 2026 municipal election runs Tuesday, October 6 to Sunday, October 11, 10 a.m. to 7 p.m. daily. No reason needed — here is where to go and what to bring.";

export const metadata: Metadata = {
  // Absolute because /toronto's layout appends "| Build Canada - Toronto".
  title: {
    absolute: "Advance Voting in Toronto: 2026 Dates and Places | Build Canada",
  },
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "Advance Voting in Toronto",
    description: DESCRIPTION,
    type: "website",
    url: CANONICAL,
  },
};

/* Advance voting owns these questions outright. The election-day page answers
   "when is the election" and the mail page answers "what are the mail
   deadlines" — none of the three repeat each other, because three pages
   competing for one query is worse than one page winning it. */
const FAQS: { question: string; answer: string }[] = [
  {
    question: "When is advance voting in Toronto?",
    answer:
      "Advance voting for Toronto's 2026 municipal election runs Tuesday, October 6 to Sunday, October 11, 2026, from 10 a.m. to 7 p.m. every day. That is six days, including both days of the weekend.",
  },
  {
    question: "Do I need a reason to vote early in Toronto?",
    answer:
      "No. Any eligible Toronto voter can vote during advance voting. There is no excuse to give, no form to fill in and no need to explain why you cannot make it on election day.",
  },
  {
    question: "Where do I go to vote early?",
    answer:
      "To your assigned advance voting place, which is printed on your voter information card and shown on the City's MyVote portal once you enter your address. Advance voting places are not the same as election-day ones and there are fewer of them, so look yours up rather than going to the place you voted at last time.",
  },
  {
    question: "Can I register to vote during advance voting?",
    answer:
      "Yes. If you are not on the voters' list you can add your name in person when you arrive at the advance voting place. Bring one piece of identification showing your name and your qualifying Toronto address.",
  },
  {
    question: "What time do advance voting places close?",
    answer:
      "7 p.m. on each of the six days, including the final day, Sunday, October 11. Election-day hours are different and longer: 10 a.m. to 8 p.m. on Monday, October 26.",
  },
  {
    question: "Is advance voting accessible?",
    answer:
      "Every advance voting place has a Voter Assist Terminal, which offers a touch screen, audio, a braille keypad, a sip-and-puff device and zoom. Curbside voting is available if you cannot enter the building, and you may bring someone to help you or ask an election official.",
  },
];

export default function AdvanceVotingPage() {
  const now = new Date();
  const { siteUrl } = getSiteConfig();

  const jsonLd = buildGraph(
    generateFAQPageSchema(FAQS),
    generateBreadcrumbSchema(CANONICAL, "Advance Voting in Toronto", siteUrl),
    generateVotingEventSchema({
      name: "Advance voting — Toronto 2026 municipal election",
      description: ADVANCE.blurb,
      startDate: ADVANCE.opensAt ?? ADVANCE.closesAt,
      endDate: ADVANCE.closesAt,
      url: `${siteUrl}${CANONICAL}`,
      cityLabel: ELECTION.cityLabel,
      organizerName: "City of Toronto Elections",
      organizerUrl: SOURCE_URLS.city,
    }),
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
          <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(2.6rem,6vw,5rem)] max-w-[19ch] text-balance mb-7">
            Advance Voting in Toronto
          </h1>
          {/* The direct answer, first sentence — the snippet target. */}
          <p className="font-serif text-[clamp(1.15rem,1.6vw,1.4rem)] leading-[1.5] max-w-[62ch]">
            You can vote early in Toronto&rsquo;s 2026 municipal election from{" "}
            <strong className="font-semibold">
              Tuesday, October 6 to Sunday, October 11
            </strong>
            , {ADVANCE.hoursLabel}. Any eligible voter can use it &mdash; there
            is no reason to give and no form to fill in. Advance voting places
            are separate from election-day ones, so look yours up first.
          </p>

          <div className="mt-11 pt-10 border-t border-border-light">
            <PeriodCountdown period={ADVANCE} now={now} size="2xl" />
            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Button
                as="external-link"
                variant="auburn"
                href={MYVOTE_URL}
                className="px-7 py-4.5"
              >
                Find your advance voting place
              </Button>
              <p className="font-serif text-[1rem] leading-[1.4] text-text-secondary max-w-[32ch]">
                MyVote is the City&rsquo;s own lookup. Enter your address and it
                gives you the advance place assigned to it.
              </p>
            </div>
          </div>
        </section>

        {/* ── The six days ─────────────────────────────────────── */}
        <section id="days" className="border-b-2 border-dark scroll-mt-24">
          <div className="px-6 pt-12 pb-8 md:px-14">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.9rem,3.2vw,2.5rem)] mb-2.5">
              The six days
            </h2>
            <p className="font-serif text-[1.1rem] leading-[1.5] max-w-[58ch] text-text-secondary">
              Same hours every day, weekend included.
            </p>
          </div>
          <div className="px-6 md:px-14 pb-8 overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[28rem]">
              <caption className="sr-only">
                Advance voting days and hours for the 2026 Toronto municipal
                election
              </caption>
              <thead>
                <tr className="border-b border-dark">
                  <th scope="col" className="type-label py-3 pr-6 align-bottom">
                    Day
                  </th>
                  <th scope="col" className="type-label py-3 pr-6 align-bottom">
                    Hours
                  </th>
                  <th scope="col" className="type-label py-3 align-bottom">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {ADVANCE_DAYS.map((day) => (
                  <tr
                    key={day.label}
                    className="border-b border-border-light align-top"
                  >
                    <th
                      scope="row"
                      className="py-4 pr-6 font-serif font-normal text-[1.05rem] leading-[1.4] whitespace-nowrap"
                    >
                      {day.label}
                    </th>
                    <td className="py-4 pr-6 font-serif text-[1.05rem] leading-[1.4] text-accent whitespace-nowrap">
                      10 a.m. &ndash; 7 p.m.
                    </td>
                    <td className="py-4 font-serif text-[0.95rem] leading-[1.4] text-text-secondary">
                      {day.note ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* The one thing on this page that is easy to get wrong: the last
              advance day and the online registration deadline are the same
              instant, and only one of them can be fixed afterwards. */}
          <div className="px-6 md:px-14 pb-12">
            <div className="border border-dark bg-bg-alt px-5 py-5 sm:px-7">
              <p className="type-label text-accent mb-2">
                Two deadlines, one moment
              </p>
              <p className="font-serif text-[1.05rem] leading-[1.5] max-w-[62ch]">
                Advance voting closes at 7 p.m. on Sunday, October 11 &mdash;
                and 7 p.m. on October 11 is also the deadline to check or
                update the voters&rsquo; list online. Miss the second one and
                you can still add your name in person on election day. Miss the
                first and your only remaining option is October 26.
              </p>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section id="how" className="border-b-2 border-dark scroll-mt-24">
          <div className="px-6 pt-12 pb-8 md:px-14">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.9rem,3.2vw,2.5rem)]">
              What to know before you go
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 border-t border-border-light">
            {NOTES.map((note, i) => (
              <div
                key={note.heading}
                className={`px-6 py-9 md:px-14 border-b border-border-light ${
                  i % 2 === 1 ? "sm:border-l" : ""
                }`}
              >
                <h3 className="font-sans font-medium text-[1.1rem] leading-[1.3] tracking-[-0.02em] mb-2">
                  {note.heading}
                </h3>
                <p className="font-serif text-[1rem] leading-[1.5] text-text-secondary max-w-[46ch]">
                  {note.body}
                </p>
              </div>
            ))}
          </div>
          <div className="px-6 md:px-14 py-9 flex flex-wrap gap-3">
            <Button as="link" variant="ghost" href={HOW_TO_VOTE_PATH}>
              What ID to bring
            </Button>
            <Button
              as="external-link"
              variant="ghost"
              href={SOURCE_URLS.identification}
            >
              The City&rsquo;s accepted-ID list
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
            Dates, hours and accessibility services here are summarised from
            the City of Toronto&rsquo;s{" "}
            <a
              href={SOURCE_URLS.keyDates}
              className="underline hover:text-accent"
              target="_blank"
              rel="noopener noreferrer"
            >
              key dates
            </a>{" "}
            and{" "}
            <a
              href={SOURCE_URLS.votingOptions}
              className="underline hover:text-accent"
              target="_blank"
              rel="noopener noreferrer"
            >
              voting options
            </a>{" "}
            pages. Toronto Elections is the authority &mdash; where anything
            here disagrees with toronto.ca, believe toronto.ca.
          </p>
        </section>

        {/* ── Next steps ───────────────────────────────────────── */}
        <section className="grid md:grid-cols-2">
          <div className="px-6 py-12 md:px-14 md:py-14">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.75rem,3vw,2.35rem)] max-w-[24ch] text-balance mb-5">
              Voting early only helps if you know who you&rsquo;re voting for.
            </h2>
            <p className="font-serif text-[1.1rem] leading-[1.5] max-w-[46ch] mb-7">
              Six days of advance voting is six days to read up on the council
              race on your ballot &mdash; the one that decides what gets built
              on your street.
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
              Advance voting is one of the ways. There is also election day
              itself, and voting by mail &mdash; which has the earliest
              deadline of the three.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button as="link" variant="ghost" href={KEY_DATES_PATH}>
                Election day countdown
              </Button>
              <Button as="link" variant="ghost" href={VOTE_BY_MAIL_PATH}>
                Vote by mail
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* Spelled out rather than generated from the range: the weekend rows carry
   their own note, and six hand-written rows are clearer than a loop plus a
   lookup table for two of them. */
const ADVANCE_DAYS: { label: string; note?: string }[] = [
  { label: "Tuesday, October 6", note: "First day" },
  { label: "Wednesday, October 7" },
  { label: "Thursday, October 8" },
  { label: "Friday, October 9" },
  { label: "Saturday, October 10", note: "Kids Vote weekend" },
  {
    label: "Sunday, October 11",
    note: "Last day — closes 7 p.m., same moment as the online voters'-list deadline",
  },
];

const NOTES: { heading: string; body: string }[] = [
  {
    heading: "No reason required",
    body: "Advance voting is open to every eligible voter. You do not have to be away on election day or explain yourself to anyone.",
  },
  {
    heading: "Different places than election day",
    body: "There are fewer advance voting places and they are not the same buildings. Yours is on your voter information card and in MyVote — check before you travel.",
  },
  {
    heading: "You can register when you arrive",
    body: "Not on the voters' list? Add your name in person at the voting place. Bring one document showing your name and your Toronto address.",
  },
  {
    heading: "You vote once",
    body: "Advance voting is instead of election day, not as well as it. Once your ballot is cast you are done, and your name is marked off the list.",
  },
];
