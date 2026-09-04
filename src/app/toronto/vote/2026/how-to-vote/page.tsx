import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { getSiteConfig } from "@/lib/api";
import { buildGraph } from "@/lib/schemas/graph";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";
import { generateFAQPageSchema } from "@/lib/schemas/generators/faq-page";
import { ELECTION, KEY_DATES_PATH, MYVOTE_URL, SOURCE_URLS } from "../key-dates";
import {
  ACCEPTED_ID,
  BALLOT_RACES,
  ELIGIBILITY,
  ID_GOTCHAS,
  getVotingSteps,
} from "../voter-guide";
import VotingSteps from "./VotingSteps";

/* Hourly, matching the key-dates page. Nothing here counts down, but the
   "pick how you want to vote" step changes as the mail-in, advance-voting and
   online-registration deadlines pass — and two of those land at 4:30 p.m. and
   7 p.m., so a daily revalidate would leave the wrong copy up for most of a
   day. This bounds how stale the *crawled* copy can be; readers with JS get
   the steps re-derived from their own clock on mount, in VotingSteps. */
export const revalidate = 3600;

const CANONICAL = "/toronto/vote/2026/how-to-vote";
const DESCRIPTION =
  "A step-by-step guide to voting in Toronto's 2026 municipal election: who is eligible, how to check the voters' list on MyVote, the four ways to vote, and exactly what ID to bring.";

export const metadata: Metadata = {
  // Absolute because /toronto's layout appends "| Build Canada - Toronto".
  title: { absolute: "How to Vote in Toronto: 2026 Step-by-Step Guide | Build Canada" },
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "How to Vote in Toronto",
    description: DESCRIPTION,
    type: "website",
    url: CANONICAL,
  },
};

/* These questions are deliberately disjoint from the ones on
   /when-is-the-election. Both pages target the same election, so if they
   answered the same questions they would compete with each other in the index
   instead of covering the query space between them. That page owns "when";
   this one owns "who, what and how". */
const FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I vote in Toronto?",
    answer:
      "Check that you are eligible, look yourself up on the City's MyVote portal to confirm you are on the voters' list and find your voting place, choose whether to vote on election day, during advance voting, by mail, or by proxy, then bring one piece of ID showing your name and Toronto address. Toronto's 2026 election is Monday, October 26.",
  },
  {
    question: "Am I registered to vote in Toronto?",
    answer:
      "Enter your address on MyVote, the City of Toronto's voter lookup, and it will tell you whether you are on the voters' list. You can add or update your information there until October 11, 2026 at 7 p.m. If you miss that, you can still be added in person when you go to vote.",
  },
  {
    question: "What ID do I need to vote in Toronto?",
    answer:
      "One document showing your name and your qualifying Toronto address. Photo ID is not required — a utility bill, bank statement, lease, pay stub or property tax assessment all qualify on their own. A passport does not work, because it shows no address, and your voter information card is not accepted as identification either, so bring something from the City's list.",
  },
  {
    question: "Can I vote in Toronto if I rent?",
    answer:
      "Yes. Renting rather than owning makes no difference to your eligibility. A lease or rental agreement is also one of the documents accepted as proof of address at the polls.",
  },
  {
    question: "Can I vote in Toronto if I am not a Canadian citizen?",
    answer:
      "No. Ontario municipal elections require voters to be Canadian citizens, regardless of how long they have lived in Toronto or whether they pay property tax here.",
  },
  {
    question: "Can someone else vote for me in Toronto?",
    answer:
      "Yes, by proxy. You appoint another eligible Toronto voter, and the appointment form has to be certified by the City Clerk — from September 1 up to 4:30 p.m. on election day, though on election day itself only at Toronto City Hall. A person can normally act as proxy for one voter, or for more if they are immediate family.",
  },
  {
    question: "Where do I vote in Toronto?",
    answer:
      "At the voting place assigned to your address, which MyVote will show you once you enter it. Advance voting places are different from election-day ones and there are fewer of them, so check before you travel rather than assuming.",
  },
  {
    question: "Who am I actually voting for?",
    answer:
      "Three choices: mayor, the city councillor for your ward, and a school board trustee. Toronto has 25 wards and you vote in only one of them — the council race is usually the least-covered and most directly consequential vote on your ballot.",
  },
  {
    question: "Do I need to register in advance to vote in Toronto?",
    answer:
      "Registering in advance is easier but not required. The online deadline to add or update your voters'-list information is October 11, 2026 at 7 p.m., and after that you can still add your name in person during advance voting or on election day.",
  },
];

export default function HowToVotePage() {
  const { siteUrl } = getSiteConfig();
  const votingSteps = getVotingSteps();

  const jsonLd = buildGraph(
    generateFAQPageSchema(FAQS),
    generateBreadcrumbSchema(CANONICAL, "How to Vote in Toronto", siteUrl),
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
            How to Vote in Toronto
          </h1>
          {/* Direct answer in the first sentence — the snippet target. */}
          <p className="font-serif text-[clamp(1.15rem,1.6vw,1.4rem)] leading-[1.5] max-w-[62ch]">
            To vote in Toronto&rsquo;s 2026 municipal election you need to be a
            Canadian citizen, 18 or older on{" "}
            <strong className="font-semibold">
              {ELECTION.voteDayLabel}, 2026
            </strong>
            , and living in Toronto or renting or owning property here. Check
            the voters&rsquo; list on MyVote, choose whether to vote on
            election day, early, by mail or by proxy, and bring one piece of ID
            with your name and Toronto address.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Button
              as="external-link"
              variant="auburn"
              href={MYVOTE_URL}
              className="px-7 py-4.5"
            >
              Check or register to vote
            </Button>
            <p className="font-serif text-[1rem] leading-[1.4] text-text-secondary max-w-[30ch]">
              MyVote is the City of Toronto&rsquo;s own voter lookup.
            </p>
          </div>
        </section>

        {/* ── The steps ────────────────────────────────────────── */}
        <section id="steps" className="border-b-2 border-dark scroll-mt-24">
          <div className="px-6 pt-12 pb-8 md:px-14">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.9rem,3.2vw,2.5rem)] mb-2.5">
              Voting in five steps
            </h2>
            <p className="font-serif text-[1.1rem] leading-[1.5] max-w-[58ch] text-text-secondary">
              Most of this takes about ten minutes, and step two does the
              heavy lifting.
            </p>
          </div>
          <VotingSteps initialSteps={votingSteps} />
        </section>

        {/* ── Eligibility ──────────────────────────────────────── */}
        <section id="eligibility" className="border-b-2 border-dark scroll-mt-24">
          <div className="px-6 pt-12 pb-8 md:px-14">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.9rem,3.2vw,2.5rem)] mb-2.5">
              Who can vote
            </h2>
            <p className="font-serif text-[1.1rem] leading-[1.5] max-w-[58ch] text-text-secondary">
              All four have to be true &mdash; this is an <em>and</em>, not an{" "}
              <em>or</em>.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 border-t border-border-light">
            {ELIGIBILITY.map((item, i) => (
              <div
                key={item.requirement}
                className={`px-6 py-9 md:px-14 border-b border-border-light ${
                  i % 2 === 1 ? "sm:border-l" : ""
                }`}
              >
                <h3 className="font-sans font-medium text-[1.1rem] leading-[1.3] tracking-[-0.02em] mb-2">
                  {item.requirement}
                </h3>
                <p className="font-serif text-[1rem] leading-[1.5] text-text-secondary max-w-[46ch]">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ID ───────────────────────────────────────────────── */}
        <section id="id" className="border-b-2 border-dark scroll-mt-24">
          <div className="px-6 pt-12 pb-8 md:px-14">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.9rem,3.2vw,2.5rem)] mb-2.5">
              What ID to bring
            </h2>
            <p className="font-serif text-[1.1rem] leading-[1.5] max-w-[58ch] text-text-secondary">
              One document, showing your name and your Toronto address. That is
              the whole requirement.
            </p>
          </div>

          {/* The corrections first — these are the reasons people get turned
              away, so they outrank the list itself. */}
          <div className="px-6 md:px-14 pb-10">
            <div className="border border-dark bg-bg-alt divide-y divide-border-light">
              {ID_GOTCHAS.map((g) => (
                <div key={g.claim} className="px-5 py-5 sm:px-7">
                  <p className="type-label text-accent mb-2">
                    Myth &mdash; &ldquo;{g.claim}&rdquo;
                  </p>
                  <p className="font-serif text-[1.05rem] leading-[1.5] max-w-[62ch]">
                    {g.truth}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-border-light">
            {ACCEPTED_ID.map((item) => (
              <div
                key={item.category}
                className="px-6 py-8 md:px-9 border-b border-border-light sm:[&:nth-child(2n)]:border-l lg:[&:nth-child(2n)]:border-l-0 lg:[&:not(:nth-child(3n+1))]:border-l"
              >
                <h3 className="type-label !tracking-[0.12em] text-accent mb-2.5">
                  {item.category}
                </h3>
                <p className="font-serif text-[1rem] leading-[1.5] text-text-secondary">
                  {item.examples}
                </p>
              </div>
            ))}
          </div>
          <div className="px-6 md:px-14 py-9">
            <Button
              as="external-link"
              variant="ghost"
              href={SOURCE_URLS.identification}
            >
              See the City&rsquo;s full list of accepted ID
            </Button>
          </div>
        </section>

        {/* ── What's on the ballot ─────────────────────────────── */}
        <section id="ballot" className="border-b-2 border-dark scroll-mt-24">
          <div className="px-6 pt-12 pb-8 md:px-14">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.9rem,3.2vw,2.5rem)] mb-2.5">
              What&rsquo;s on your ballot
            </h2>
            <p className="font-serif text-[1.1rem] leading-[1.5] max-w-[58ch] text-text-secondary">
              Three choices. Twenty-six mayor and council races run across the
              city, but you vote in exactly one of the council ones.
            </p>
          </div>
          <div className="grid md:grid-cols-3 border-t border-border-light">
            {BALLOT_RACES.map((race, i) => (
              <div
                key={race.office}
                className={`px-6 py-9 md:px-9 ${
                  i > 0
                    ? "border-t md:border-t-0 md:border-l border-border-light"
                    : ""
                }`}
              >
                <h3 className="font-sans font-medium text-[1.15rem] leading-[1.25] tracking-[-0.02em] mb-2.5">
                  {race.office}
                </h3>
                <p className="font-serif text-[1rem] leading-[1.5] text-text-secondary">
                  {race.detail}
                </p>
              </div>
            ))}
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
            Eligibility, identification and voters&rsquo;-list rules here are
            summarised from the City of Toronto&rsquo;s own pages on{" "}
            <a
              href={SOURCE_URLS.city}
              className="underline hover:text-accent"
              target="_blank"
              rel="noopener noreferrer"
            >
              elections
            </a>
            ,{" "}
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
            . Toronto Elections is the authority &mdash; where anything here
            disagrees with toronto.ca, believe toronto.ca.
          </p>
        </section>

        {/* ── Next steps ───────────────────────────────────────── */}
        <section className="grid md:grid-cols-2">
          <div className="px-6 py-12 md:px-14 md:py-14">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.75rem,3vw,2.35rem)] max-w-[24ch] text-balance mb-5">
              You know how. Now the harder question.
            </h2>
            <p className="font-serif text-[1.1rem] leading-[1.5] max-w-[46ch] mb-7">
              The council race on your ballot gets almost no coverage and
              decides most of what happens on your street. We track all 26.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button as="link" variant="ghost" href={ELECTION.basePath}>
                See who is running
              </Button>
              <Button as="link" variant="ghost" href={KEY_DATES_PATH}>
                Key dates and deadlines
              </Button>
            </div>
          </div>
          <div className="px-6 py-12 md:px-14 md:py-14 border-t-2 md:border-t-0 md:border-l border-border-light bg-bg-alt flex flex-col justify-center">
            <p className="type-label text-accent mb-3.5">Start here</p>
            <p className="font-serif text-[1.15rem] leading-[1.45] max-w-[34ch] mb-6">
              Everything above depends on being on the voters&rsquo; list.
              Checking takes under a minute on the City&rsquo;s portal.
            </p>
            <Button
              as="external-link"
              variant="auburn"
              href={MYVOTE_URL}
              className="self-start px-7 py-4.5"
            >
              Check your registration
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
