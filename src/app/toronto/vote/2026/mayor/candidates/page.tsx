import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { IncumbentBadge } from "@/components/elections/ElectionLanding";
import { CandidateNameLink } from "@/components/elections/CandidateNameLink";
import CountdownDays from "@/components/elections/CountdownDays";
import { surveyRoster } from "@/lib/elections/candidate-answers";
import { daysUntil } from "@/lib/elections/dates";
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
 * ONE LIST, IN SURNAME ORDER
 *   The field used to split in two — the candidates who returned our
 *   questionnaire and the candidates who had not — which is the most useful
 *   sort available while those answers are published. They are not, until the
 *   questionnaire launches, so the split would be a scoreboard reading nil-all
 *   and every word of it our doing. Flat, the page is what it says it is:
 *   everyone running, in surname order, because the alternative is a ranking
 *   nobody asked us to make.
 *
 *   Withdrawn candidates keep a group at the foot rather than vanishing. Some
 *   clerks never drop them, they appear on lists elsewhere, and a reader who
 *   comes here holding a name needs to find out it is no longer a candidate.
 */

export const metadata: Metadata = {
  title: "Every candidate for Mayor of Toronto",
  description:
    "The full field for Mayor of Toronto in the October 26, 2026 election: every registered candidate, in surname order, with their campaign site.",
  alternates: { canonical: `${ELECTION.basePath}/mayor/candidates` },
  openGraph: {
    title: "Every candidate for Mayor — Toronto 2026 Election",
    description:
      "The full field for Mayor of Toronto: everyone registered to run for the city's top job.",
    type: "website",
  },
};

export default async function MayoralCandidatesPage() {
  const view = await getToronto2026();

  /* The ballot, in surname order. `surveyRoster` with no answers to sort by is
     exactly that — it is the same call the ward pages make, and the ordering
     is the part of it this page still needs. */
  const roster = surveyRoster(view.mayoral);
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
            the city. {roster.length} candidates have registered.
          </p>
        </section>

        {/* ── Key stats ──────────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-3 border-b-2 border-dark">
          <Stat value={roster.length} label="On the ballot" />
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

        {/* ── The ballot ────────────────────────────────────── */}
        {roster.length > 0 && (
          <section>
            <GroupHead
              eyebrow="Registered"
              title="On the ballot"
              blurb="Every candidate registered for mayor, in surname order, with the way to their own campaign where they have published one."
            />
            <Roster candidates={roster} />
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
        {/* One way on, not two: the other was the field read question by
            question, which is switched off with the rest of the
            questionnaire. */}
        <section className="border-t border-dark">
          <Link
            href={`${ELECTION.basePath}#wards`}
            className="group px-6 md:px-14 py-6 flex items-center gap-2.5 transition-colors hover:bg-linen-50"
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
