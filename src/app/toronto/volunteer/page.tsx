import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ELECTION, ELECTION_DAY, HOW_TO_VOTE_PATH } from "../vote/2026/key-dates";
import { PeriodCountdown } from "../vote/2026/PeriodCountdown";
import { FormstackForm } from "./FormstackForm";
import {
  CJPAC_URL,
  CONSENT,
  PARTNER_SOURCE,
  STEP_1,
  TRAINING_DATES,
  VOLUNTEER_PATH,
} from "./build-the-vote";

/* Hourly, like the other pages with an election-day countdown: the server's
   reading is the number crawlers and no-JS readers see, and the client
   corrects it to the second on mount. */
export const revalidate = 3600;

const DESCRIPTION =
  "The Toronto you know is possible doesn't vote itself in. Give two hours on October 26 to help a candidate who shares your values win their race.";

export const metadata: Metadata = {
  title: "Build the Vote: Volunteer on Election Day",
  description: DESCRIPTION,
  alternates: { canonical: VOLUNTEER_PATH },
  openGraph: {
    title: "Build the Vote: volunteer on Toronto's Election Day",
    description:
      "Give two hours on October 26 to help a candidate who shares your values win their race. No experience needed.",
    type: "website",
    url: VOLUNTEER_PATH,
  },
};

const ISSUES = [
  {
    title: "Housing",
    body: "How many new homes get approved across every part of the city, and how long approvals take.",
  },
  {
    title: "Transit",
    body: "How frequent and reliable service is, and how quickly new lines move from plan to construction.",
  },
  {
    title: "Delivering projects",
    body: "Whether major projects are completed on schedule and on budget, with cost and timeline data published openly.",
  },
  {
    title: "Value for money",
    body: "How clearly city spending is tied to measurable results that improve daily life.",
  },
];

/* 2022 results, from the City of Toronto's official returns. */
const MARGINS = [
  { votes: 94, race: "Ward 5", detail: "city council race." },
  { votes: 63, race: "Ward 18", detail: "school board race." },
  {
    votes: 1,
    race: "Ward 1",
    detail: "TCDSB trustee race, out of more than 4,000 cast.",
  },
];

const STEPS = [
  {
    title: "Sign up to volunteer on Election Day",
    body: "It takes about a minute.",
  },
  {
    title: "A volunteer coordinator calls you",
    body: "They’ll match you with a candidate who shares your values, in a race where your time makes a difference.",
  },
  {
    title: "Show up on October 26",
    body: "Join your candidate’s team for as little as two hours and help win a close race.",
  },
];

const SHIFT = [
  { title: "Check in", body: "Meet the campaign team and get a quick briefing." },
  {
    title: "Get your list",
    body: "Names of supporters the campaign has already identified who haven’t voted yet.",
  },
  {
    title: "Knock or call",
    body: "Remind them to vote and make sure they know where their polling station is.",
  },
  {
    title: "Check back in",
    body: "Report back, and take another list if you have time to stay.",
  },
];

const linkClass = "underline underline-offset-2 hover:text-accent";

const FAQS: { question: string; answer: React.ReactNode }[] = [
  {
    question: "Do I need any experience?",
    answer:
      "No. Your coordinator will match you with a role that suits you, and the Zoom trainings cover everything you need to know.",
  },
  {
    question: "How much time does it take?",
    answer:
      "As little as two hours on October 26. If you can give more, campaigns will gladly take it, but every shift counts.",
  },
  {
    question: "I haven’t decided which candidate to support.",
    answer: (
      <>
        That&rsquo;s fine.{" "}
        <a href={`${ELECTION.basePath}/survey`} className={linkClass}>
          Take the voter survey
        </a>{" "}
        to see which candidates line up with you, and your coordinator will
        help you find a race where your help counts.
      </>
    ),
  },
  {
    question: "Will I still have time to vote?",
    answer: (
      <>
        Yes. Polls are open 10&nbsp;a.m. to 8&nbsp;p.m., and your shift is
        about two hours.{" "}
        <a href={HOW_TO_VOTE_PATH} className={linkClass}>
          Here&rsquo;s how to vote in Toronto.
        </a>
      </>
    ),
  },
  {
    question: "Can I help before Election Day?",
    answer:
      "Yes. Tell your coordinator when they call and they can connect you with your campaign sooner.",
  },
];

const h2Class =
  "font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.9rem,3.2vw,2.5rem)] max-w-[24ch] text-balance";
const ledeClass =
  "font-serif text-[1.1rem] leading-[1.5] max-w-[58ch] text-text-secondary";

export default function VolunteerPage() {
  const now = new Date();

  return (
    <div className={`${ELECTION.themeClass ?? ""} bg-bg text-dark`}>
      <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="grid lg:grid-cols-[1.5fr_1fr] border-b-2 border-dark">
          <div className="px-6 py-14 md:px-14 md:py-20">
            <p className="type-label text-accent mb-5">
              Build the Vote &middot; {ELECTION.voteDayLabel}
            </p>
            <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(2.6rem,6vw,5rem)] max-w-[16ch] text-balance mb-7">
              The Toronto you know is possible doesn&rsquo;t{" "}
              <span className="text-accent">vote itself in.</span>
            </h1>
            <p className="font-serif text-[clamp(1.15rem,1.6vw,1.4rem)] leading-[1.5] max-w-[52ch]">
              Big issues that matter are all on the ballot. Give two hours on
              Election Day to help a candidate who shares your values win
              their race.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Button
                as="link"
                variant="auburn"
                href="#signup"
                className="px-7 py-4.5"
              >
                Sign up to volunteer
              </Button>
              <p className="font-serif text-[1rem] leading-[1.4] text-text-secondary max-w-[30ch]">
                Takes about a minute. No experience needed.
              </p>
            </div>
          </div>
          <div className="px-6 py-10 md:px-14 border-t lg:border-t-0 lg:border-l border-border-light bg-bg-alt flex flex-col justify-center gap-5">
            <PeriodCountdown period={ELECTION_DAY} now={now} size="lg" />
            <p className="font-serif text-[1rem] leading-[1.4] text-text-secondary border-t border-border-light pt-4">
              Polls are open {ELECTION_DAY.hoursLabel} on{" "}
              {ELECTION.voteDayLabel}.
            </p>
          </div>
        </section>

        {/* ── What's at stake ──────────────────────────────────── */}
        <section className="border-b-2 border-dark">
          <div className="px-6 pt-12 pb-8 md:px-14">
            <p className="type-label text-accent mb-3.5">What&rsquo;s at stake</p>
            <h2 className={`${h2Class} mb-2.5`}>
              What the next council will decide.
            </h2>
            <p className={ledeClass}>
              Some of the questions facing whoever wins on October&nbsp;26.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 border-t border-border-light">
            {ISSUES.map((issue, i) => (
              <div
                key={issue.title}
                className="px-6 py-9 md:px-9 border-b last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0 border-border-light md:[&:nth-child(2n)]:border-l lg:[&:not(:first-child)]:border-l"
              >
                <p className="type-label text-accent mb-3">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-sans font-medium text-[1.15rem] leading-[1.25] tracking-[-0.02em] mb-2.5">
                  {issue.title}
                </h3>
                <p className="font-serif text-[1rem] leading-[1.5] text-text-secondary">
                  {issue.body}
                </p>
              </div>
            ))}
          </div>
          <div className="px-6 md:px-14 py-9 border-t border-border-light">
            <Button as="link" variant="ghost" href={`${ELECTION.basePath}/issues`}>
              See where the candidates stand
            </Button>
          </div>
        </section>

        {/* ── Turnout and margins ──────────────────────────────── */}
        <section className="border-b-2 border-dark">
          <div className="px-6 pt-12 pb-8 md:px-14">
            <p className="font-sans font-semibold leading-[0.95] tracking-[-0.04em] text-[clamp(2.6rem,7vw,4.5rem)] text-accent">
              Fewer than 3 in 10
            </p>
            <p className="font-serif text-[clamp(1.15rem,1.6vw,1.4rem)] leading-[1.5] mt-3 mb-10 max-w-[44ch]">
              eligible Torontonians voted in the last municipal election.
            </p>
            <h2 className={`${h2Class} mb-2.5`}>
              When turnout is this low, a handful of votes decides who wins.
            </h2>
            <p className={ledeClass}>
              Every one of these 2022 races could have gone the other way.
            </p>
          </div>
          <div className="grid md:grid-cols-3 border-t border-border-light">
            {MARGINS.map((m, i) => (
              <div
                key={m.race + m.detail}
                className={`px-6 py-9 md:px-9 ${
                  i > 0
                    ? "border-t md:border-t-0 md:border-l border-border-light"
                    : ""
                }`}
              >
                <p className="font-sans font-semibold leading-none tracking-[-0.04em] text-[3.25rem] tabular-nums">
                  {m.votes}
                  <span className="type-label text-text-secondary ml-2 tracking-[0.14em]">
                    {m.votes === 1 ? "vote" : "votes"}
                  </span>
                </p>
                <p className="font-serif text-[1rem] leading-[1.5] text-text-secondary mt-3">
                  decided the{" "}
                  <strong className="font-semibold text-dark">{m.race}</strong>{" "}
                  {m.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How Election Day volunteering works ──────────────── */}
        <section className="grid md:grid-cols-[1.2fr_1fr] border-b-2 border-dark bg-bg-alt">
          <div className="px-6 py-12 md:px-14 md:py-16">
            <p className="type-label text-accent mb-3.5">
              How Election Day volunteering works
            </p>
            <h2 className={`${h2Class} mb-5`}>
              Elections are won in the last mile.
            </h2>
            <p className="font-serif text-[1.1rem] leading-[1.5] max-w-[54ch]">
              Campaigns have spent months finding the people who support them.
              On Election Day, volunteers go back to those supporters and make
              sure they actually vote. It&rsquo;s the most direct way to turn
              what you believe into a result.
            </p>
          </div>
          <div className="px-6 pb-12 md:px-14 md:py-16 flex items-center">
            <p className="border-l-[3px] border-accent pl-5 font-serif text-[1.3rem] leading-[1.45] max-w-[34ch]">
              You won&rsquo;t be debating strangers. You&rsquo;ll be reminding
              people who already support your candidate to get to the polls.
            </p>
          </div>
        </section>

        {/* ── Three steps ──────────────────────────────────────── */}
        <section className="border-b-2 border-dark">
          <div className="px-6 pt-12 pb-8 md:px-14">
            <p className="type-label text-accent mb-3.5">Three simple steps</p>
            <h2 className={h2Class}>Here&rsquo;s how it works.</h2>
          </div>
          <ol className="grid md:grid-cols-3 border-t border-border-light">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className={`px-6 py-9 md:px-9 ${
                  i > 0
                    ? "border-t md:border-t-0 md:border-l border-border-light"
                    : ""
                }`}
              >
                <p className="font-sans font-medium text-[1.5rem] tracking-[-0.03em] text-accent mb-4">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-sans font-medium text-[1.25rem] leading-[1.25] tracking-[-0.02em] mb-2.5 max-w-[20ch]">
                  {step.title}
                </h3>
                <p className="font-serif text-[1rem] leading-[1.5] text-text-secondary">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
          <div className="px-6 md:px-14 py-9 border-t border-border-light">
            <Button as="link" variant="auburn" href="#signup" className="px-7 py-4.5">
              Sign up to volunteer
            </Button>
          </div>
        </section>

        {/* ── A typical shift ──────────────────────────────────── */}
        <section className="border-b-2 border-dark">
          <div className="px-6 pt-12 pb-8 md:px-14">
            <p className="type-label text-accent mb-3.5">
              What a typical shift looks like
            </p>
            <h2 className={`${h2Class} mb-2.5`}>
              About two hours, as part of a team.
            </h2>
            <p className={ledeClass}>You won&rsquo;t be on your own.</p>
          </div>
          <ol className="grid md:grid-cols-2 lg:grid-cols-4 border-t border-border-light">
            {SHIFT.map((step) => (
              <li
                key={step.title}
                className="px-6 py-8 md:px-9 border-b last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0 border-border-light md:[&:nth-child(2n)]:border-l lg:[&:not(:first-child)]:border-l"
              >
                <h3 className="font-sans font-medium text-[1.1rem] leading-[1.3] tracking-[-0.02em] mb-2">
                  {step.title}
                </h3>
                <p className="font-serif text-[1rem] leading-[1.5] text-text-secondary">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
          <div className="px-6 md:px-14 py-10 border-t border-border-light">
            <div className="border border-dark bg-bg-alt px-5 py-6 sm:px-7">
              <p className="type-label text-accent mb-2">
                Free training before Election Day
              </p>
              <p className="font-serif text-[1.05rem] leading-[1.5] max-w-[62ch]">
                Short Zoom sessions on canvassing and get-out-the-vote basics
                on {TRAINING_DATES}. The link arrives by email when you sign
                up.
              </p>
            </div>
          </div>
        </section>

        {/* ── Sign-up ──────────────────────────────────────────── */}
        <section
          id="signup"
          className="grid lg:grid-cols-[1fr_1.2fr] border-b-2 border-dark scroll-mt-24"
        >
          <div className="px-6 py-12 md:px-14 md:py-16 bg-[#003086] text-linen-100">
            <p className="type-label text-auburn-200 mb-3.5">Build the Vote</p>
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.035em] text-[clamp(2rem,4vw,3.25rem)] max-w-[16ch] text-balance mb-5">
              Can Toronto count on you on October&nbsp;26?
            </h2>
            <p className="font-serif text-[1.15rem] leading-[1.5] max-w-[40ch] text-linen-100/85">
              Sign up and a volunteer coordinator will call to match you with
              a candidate who shares your values.
            </p>
          </div>
          <div className="px-6 py-12 md:px-14 md:py-16">
            <FormstackForm
              slug={STEP_1.slug}
              fill={{ [STEP_1.fields.utmSource]: PARTNER_SOURCE }}
              check={[STEP_1.fields.emailOptIn]}
              hide={[
                STEP_1.fields.utmSource,
                STEP_1.fields.emailOptIn,
                STEP_1.fields.consent,
              ]}
            />
            <p className="font-serif text-[0.95rem] leading-[1.5] text-text-secondary mt-6 max-w-[56ch]">
              {CONSENT}
            </p>
            <p className="font-serif text-[0.95rem] leading-[1.5] text-text-secondary mt-3 max-w-[56ch]">
              Sign-ups are handled by our volunteer partner,{" "}
              <a
                href={CJPAC_URL}
                className={linkClass}
                target="_blank"
                rel="noopener noreferrer"
              >
                CJPAC
              </a>
              , a non-partisan organization that coordinates Election Day
              volunteers and does not endorse any party or candidate.
            </p>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section className="border-b-2 border-dark">
          <div className="px-6 pt-12 pb-8 md:px-14">
            <h2 className={h2Class}>Questions</h2>
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
        </section>

        {/* ── Closing (Toronto-blue band, full bleed) ──────────── */}
        <section className="bg-[#003086] text-bg px-6 py-20 md:px-14 md:py-24 text-center flex flex-col items-center">
          <p className="mb-8 font-serif italic text-[1.1rem] leading-[1.5] text-bg/70">
            &ldquo;Whatever our errors are otherwise, we shall not err for want of
            boldness.&rdquo;
            <br className="sm:hidden" /> &mdash; Sir Wilfrid Laurier
          </p>
          <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.035em] text-[clamp(2rem,5vw,3.75rem)] max-w-[22ch] text-balance text-linen-100 mb-10">
            Two hours. A close race. Your call.
          </h2>
          <a
            href="#signup"
            className="group/btn inline-flex items-center gap-3 type-button text-accent bg-bg px-7 py-4 transition-colors hover:bg-linen-100"
          >
            Sign up to volunteer
          </a>
          <div className="mt-14 max-w-[60ch] space-y-2 font-serif text-[0.9rem] leading-[1.5] text-bg/60">
            <p>
              Build the Vote is a Build Canada&nbsp;&ndash; Toronto volunteer
              program. Volunteers choose the candidates they support.
            </p>
            <p>
              Turnout and race margins are from official City of Toronto 2022
              municipal election results.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
