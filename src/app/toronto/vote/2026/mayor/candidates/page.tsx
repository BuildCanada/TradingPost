import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { IncumbentBadge } from "@/components/elections/ElectionLanding";
import { CandidateNameLink } from "@/components/elections/CandidateNameLink";
import CountdownDays from "@/components/elections/CountdownDays";
import { surveyRoster } from "@/lib/elections/candidate-answers";
import { daysUntil } from "@/lib/elections/dates";
import { rosterSurvey } from "@/lib/elections/survey-answers";
import { ANSWERS_WITHHELD } from "@/lib/elections/registry";
import type { CandidateView } from "@/lib/elections/election-data";
import { ELECTION, getToronto2026 } from "../../data";

/* Everyone running for mayor, on a page of their own.
 *
 * WHY IT EXISTS
 *   The roster lived on the landing page as a grid of portrait cards, and the
 *   field is now fifty-odd people: half a screen of the city's front page
 *   spent on a list whose reader either wants one name or wants all of them,
 *   and in both cases is better served somewhere they can look properly. The
 *   landing page's job is to point at races. This is the race.
 *
 *   It is also the page /mayor never was. That route is titled "Candidates for
 *   Mayor" and holds the questionnaire read across the field — thirty-odd
 *   questions by every column — which answers "what did they say" and never
 *   answers "who is running". A reader who wants the ballot got a grid.
 *
 * ANSWERED FIRST, AND SAID SO
 *   The field splits in two: the candidates who returned our questionnaire and
 *   the candidates who have not. That is the most useful sort available — it
 *   is the difference between a name and a position — and `surveyRoster`
 *   already orders it that way, so the page prints the boundary rather than
 *   leaving the reader to infer it from a missing link. Within each group,
 *   surname order, because the alternative is a ranking nobody asked us to
 *   make.
 *
 *   Withdrawn candidates keep a group at the foot rather than vanishing. Some
 *   clerks never drop them, they appear on lists elsewhere, and a reader who
 *   comes here holding a name needs to find out it is no longer a candidate.
 */

export const metadata: Metadata = {
  title: "Every candidate for Mayor of Toronto",
  description:
    "The full field for Mayor of Toronto in the October 26, 2026 election: every registered candidate, their campaign site, and whether they answered our questionnaire.",
  alternates: { canonical: `${ELECTION.basePath}/mayor/candidates` },
  openGraph: {
    title: "Every candidate for Mayor — Toronto 2026 Election",
    description:
      "The full field for Mayor of Toronto: who is running, and who has told us where they stand.",
    type: "website",
  },
};

export default async function MayoralCandidatesPage() {
  const view = await getToronto2026();

  /* Same two-step the questionnaire grid uses: the roster names the field, and
     the survey fetch is keyed to it, so a response from someone who is not on
     the ballot cannot put a stranger on this page. */
  const named = surveyRoster(view.mayoral);
  const { answers } = await rosterSurvey(
    ELECTION.slug,
    new Set(named.map((candidate) => candidate.key)),
  );
  const roster = surveyRoster(view.mayoral, answers);

  /* One list, not two, while the answers are withheld — see
     `questionnaireHidden` in the registry. The split here is by whether a
     candidate wrote back, so with nothing to read back it collapses on its
     own: `answered` empties and the entire ballot lands under "Yet to
     respond", which is a scoreboard reading nil-all and every word of it our
     doing. Flat, the page is what it says it is — everyone running. */
  const withheld = ELECTION.questionnaireHidden ?? false;
  const answered = withheld ? [] : roster.filter((candidate) => candidate.answers);
  const quiet = withheld ? roster : roster.filter((candidate) => !candidate.answers);
  const withdrawn = view.mayoral.filter((candidate) => candidate.withdrawn);
  const sites = roster.filter((candidate) => candidate.website).length;

  return (
    <div className={`${ELECTION.themeClass ?? ""} bg-bg text-dark`}>
      <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
        {/* ── Breadcrumb ─────────────────────────────────────── */}
        <div className="px-6 md:px-14 py-4 border-b border-border-light type-label-sm !tracking-[0.1em] flex items-center gap-2.5">
          <Link
            href={ELECTION.basePath}
            className="text-text-secondary hover:text-accent transition-colors"
          >
            Toronto 2026
          </Link>
          <span className="text-border-light">/</span>
          <span>Candidates for Mayor</span>
        </div>

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="px-6 py-8 md:px-14 md:py-10 border-b-2 border-dark">
          <p className="type-label text-accent mb-3.5">City of Toronto</p>
          <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(2.25rem,4.5vw,3.75rem)] max-w-[16ch] text-balance mb-4">
            Everyone running for mayor
          </h1>
          <p className="font-serif text-[1.05rem] leading-[1.5] text-dark/85 max-w-[58ch] text-pretty">
            The one race every Toronto voter votes in, and the longest ballot in
            the city.{" "}
            {roster.length > 0 && answered.length > 0
              ? `${roster.length} candidates have registered; ${answered.length} of them have told us where they stand.`
              : `${roster.length} candidates have registered.`}
            {withheld ? ` ${ANSWERS_WITHHELD}` : ""}
          </p>
        </section>

        {/* ── Key stats ──────────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 border-b-2 border-dark">
          <Stat value={roster.length} label="On the ballot" />
          {/* A count of the answers, which at nil reads as the claim that
              nobody gave any. */}
          {!withheld && <Stat value={answered.length} label="Answered us" />}
          <Stat value={sites} label="With a campaign site" />
          <div className="px-6 py-4 md:px-14 border-b md:border-b-0 border-border-light">
            <CountdownDays
              initialDays={daysUntil(ELECTION.electionDateIso)}
              targetIso={ELECTION.electionDateIso}
              className="font-sans font-semibold text-[2rem] leading-none tracking-[-0.03em] tabular-nums"
            />
            <div className="type-label-sm !tracking-[0.1em] text-text-secondary mt-1.5">
              Days until polls open
            </div>
          </div>
        </section>

        {/* ── Answered ───────────────────────────────────────── */}
        {answered.length > 0 && (
          <section>
            <GroupHead
              eyebrow="On the record"
              title="Answered our questionnaire"
              blurb={`${answered.length} of the ${roster.length} candidates for mayor returned the questionnaire. Every answer is published, question by question.`}
              action={{
                label: "See how they answered",
                href: `${ELECTION.basePath}/mayor`,
              }}
            />
            <Roster candidates={answered} />
          </section>
        )}

        {/* ── Yet to respond, or simply the ballot ───────────── */}
        {quiet.length > 0 && (
          <section>
            <GroupHead
              eyebrow="Registered"
              title={withheld ? "On the ballot" : "Yet to respond"}
              blurb={
                withheld
                  ? `Every candidate registered for mayor, in surname order. ${ANSWERS_WITHHELD}`
                  : "On the ballot, and yet to tell us where they stand. We publish answers as they arrive, so this list shrinks through the campaign."
              }
            />
            <Roster candidates={quiet} />
          </section>
        )}

        {/* ── Withdrawn ──────────────────────────────────────── */}
        {withdrawn.length > 0 && (
          <section>
            <GroupHead
              eyebrow="No longer running"
              title="Withdrawn"
              blurb="Registered and since withdrawn. Kept here because the name still appears on lists elsewhere."
            />
            <Roster candidates={withdrawn} />
          </section>
        )}

        {/* ── Source note ────────────────────────────────────── */}
        <section className="px-6 md:px-14 py-4 border-t-2 border-dark">
          <p className="type-label-sm text-text-muted max-w-[80ch] text-pretty">
            Registered candidates from the City Clerk&rsquo;s official list,
            refreshed daily. The field is not final until nominations close
            {view.nominationCloseLabel
              ? ` on ${view.nominationCloseLabel}`
              : ""}
            .
          </p>
        </section>

        {/* ── Elsewhere ──────────────────────────────────────── */}
        <section className="border-t border-dark grid md:grid-cols-2">
          <Link
            href={`${ELECTION.basePath}/issues`}
            className="group px-6 md:px-14 py-6 flex items-center justify-between gap-4 transition-colors hover:bg-linen-50"
          >
            <span className="font-sans font-medium text-[1.15rem] tracking-[-0.015em]">
              Where the whole field stands
            </span>
            <ArrowRight className="size-4 flex-none text-text-secondary transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href={`${ELECTION.basePath}#wards`}
            className="group px-6 md:px-14 py-6 flex items-center gap-2.5 border-t md:border-t-0 md:border-l border-border-light transition-colors hover:bg-linen-50"
          >
            <ArrowLeft className="size-3.5 text-text-secondary" />
            <span className="font-sans font-medium text-[1.15rem] tracking-[-0.015em]">
              Find your ward
            </span>
          </Link>
        </section>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="px-6 py-4 md:px-14 border-r border-b md:border-b-0 border-border-light">
      <div className="font-sans font-semibold text-[2rem] leading-none tracking-[-0.03em] tabular-nums">
        {value}
      </div>
      <div className="type-label-sm !tracking-[0.1em] text-text-secondary mt-1.5">
        {label}
      </div>
    </div>
  );
}

function GroupHead({
  eyebrow,
  title,
  blurb,
  action,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="px-6 md:px-14 pt-9 pb-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div>
        <p className="type-label text-accent mb-2.5">{eyebrow}</p>
        <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.6rem,2.6vw,2.1rem)] mb-2">
          {title}
        </h2>
        <p className="font-serif text-[1.02rem] leading-[1.45] max-w-[56ch] text-dark/80 text-pretty">
          {blurb}
        </p>
      </div>
      {action && (
        <Link
          href={action.href}
          className="group/answers type-label-sm text-accent hover:underline inline-flex items-center gap-1.5 pb-1.5"
        >
          {action.label}
          <ArrowRight className="size-3.5 transition-transform group-hover/answers:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/** The field as a grid of rows.
 *
 *  A row, not the landing page's card: fifty-three of anything is a list, and
 *  the portrait was the tallest thing on a tile whose text is a name and a
 *  link. Kept small it still does the one job a portrait does here — making a
 *  name a person — without setting the height of the page. */
function Roster({ candidates }: { candidates: CandidateView[] }) {
  return (
    <ul className="m-0 p-0 list-none mx-6 md:mx-14 mb-2 grid grid-cols-1 border-t border-l border-border-light cards:grid-cols-2 xl:grid-cols-3">
      {candidates.map((candidate) => (
        <li
          key={candidate.key}
          className={`flex items-center gap-3.5 border-b border-r border-border-light px-4 py-3.5 ${
            candidate.withdrawn ? "opacity-55" : ""
          }`}
        >
          <span
            aria-hidden="true"
            className="relative flex-none size-10 overflow-hidden bg-dark flex items-center justify-center font-sans font-medium text-[0.85rem] tracking-[-0.02em] text-bg"
          >
            {candidate.image ? (
              <Image
                src={candidate.image}
                alt=""
                fill
                sizes="40px"
                className="object-cover object-center"
              />
            ) : (
              candidate.initials
            )}
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-baseline gap-2 flex-wrap">
              <span
                className={`font-sans font-medium text-[1.02rem] tracking-[-0.02em] leading-[1.2] ${
                  candidate.withdrawn ? "line-through decoration-1" : ""
                }`}
              >
                {/* The name is the link — to our page for this candidate,
                    which carries the campaign site that used to sit on a
                    second line under every name here. */}
                <CandidateNameLink
                  candidate={candidate}
                  election={ELECTION.slug}
                  race="mayor"
                />
              </span>
              {candidate.tag === "Incumbent" && <IncumbentBadge />}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
