import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PledgeButton } from "@/components/elections/PledgeButton";
import { ResidencyModal } from "@/components/elections/ResidencyModal";
import RaceList from "./RaceList";
import { getBramptonElection, NOMINATION_CLOSE_TIME } from "./data";

export const metadata: Metadata = {
  title: "Brampton 2026 Election",
  description:
    "Brampton elects its mayor, five city councillors, five regional councillors and its school board trustees on October 26, 2026. See every registered candidate, filtered by ward.",
  alternates: { canonical: "/elections/brampton/2026" },
  openGraph: {
    title: "Brampton 2026 Election — Build Canada",
    description:
      "Every race and every registered candidate in Brampton's 2026 municipal election.",
    type: "website",
  },
};

/** One number-plus-label cell in the stat band. */
function Stat({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={`px-8 py-7 ${className ?? ""}`}>
      <div className="font-sans font-semibold leading-none tracking-[-0.03em] tabular-nums text-[2.75rem]">
        {value}
      </div>
      <div className="type-label-sm !tracking-[0.1em] text-text-secondary mt-2.5">
        {label}
      </div>
    </div>
  );
}

export default async function Brampton2026ElectionPage() {
  const election = await getBramptonElection();

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip text-dark">
      <Suspense fallback={null}>
        <ResidencyModal election="brampton-2026" />
      </Suspense>

      {/* ── Breadcrumb ───────────────────────────────────────── */}
      <div className="px-6 md:px-14 py-5 border-b border-border-light type-label-sm !tracking-[0.1em] flex items-center gap-2.5">
        <Link
          href="/elections"
          className="text-text-secondary hover:text-accent transition-colors"
        >
          Elections
        </Link>
        <span className="text-border-light">/</span>
        <span>Brampton 2026</span>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="px-6 py-14 md:px-14 md:py-16 border-b-2 border-dark">
        <p className="type-label text-accent mb-5">
          Municipal Election · City of Brampton
        </p>
        <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(3rem,7vw,5.75rem)] max-w-[15ch] text-balance mb-7">
          Brampton 2026 Election
        </h1>
        <p className="font-serif text-[clamp(1.15rem,1.6vw,1.4rem)] leading-[1.5] max-w-[62ch]">
          On October&nbsp;26,&nbsp;2026 Brampton elects a mayor and, in each of
          its five districts, both a city councillor and a regional councillor —
          two seats per ballot, plus the school board trustees who share the same
          districts. Below is every race, with every candidate registered so far.
          Pick your ward to see just the races you vote in.
        </p>
        <PledgeButton
          election="brampton-2026"
          source="election-hero"
          className="group/btn mt-9 inline-flex items-center gap-3 type-button text-bg bg-dark px-5 py-4 transition-colors hover:bg-black cursor-pointer"
        >
          Pledge to vote
          <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
        </PledgeButton>
      </section>

      {election === null ? (
        <section className="px-6 py-16 md:px-14">
          <p className="font-serif text-[1.15rem] leading-[1.5] max-w-[56ch] text-dark/80">
            The candidate list is temporarily unavailable. It comes from the
            City of Brampton&rsquo;s registered-candidate listing — please check
            back shortly.
          </p>
        </section>
      ) : (
        <>
          {/* ── Stat band ────────────────────────────────────── */}
          <section className="grid grid-cols-2 md:grid-cols-4 border-b-2 border-dark">
            <Stat
              value={String(election.daysUntil)}
              label="Days until polls open"
              className="border-r border-b md:border-b-0 border-border-light"
            />
            <Stat
              value={String(election.candidateCount)}
              label="Registered candidates"
              className="border-b md:border-b-0 md:border-r border-border-light"
            />
            <Stat
              value={String(election.raceCount)}
              label="Races on the ballot"
              className="border-r border-border-light"
            />
            <div className="px-8 py-7">
              <div className="flex items-end h-[2.75rem]">
                <div className="font-sans font-semibold text-[1.6rem] leading-none tracking-[-0.03em]">
                  {election.electionDateLabel}
                </div>
              </div>
              <div className="type-label-sm !tracking-[0.1em] text-text-secondary mt-2.5">
                Election day
              </div>
            </div>
          </section>

          {/* ── Races ────────────────────────────────────────── */}
          <section className="border-b-2 border-dark">
            <div className="px-6 pt-12 pb-7 md:px-14">
              <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.75rem,3vw,2.25rem)] mb-2.5">
                Who&rsquo;s running
              </h2>
              <p className="font-serif text-[1.1rem] leading-[1.45] max-w-[58ch] text-dark/80">
                {election.nominationCloseLabel
                  ? `Nominations close ${election.nominationCloseLabel} at ${NOMINATION_CLOSE_TIME}, so the field is still growing.`
                  : "The field is still growing."}{" "}
                Brampton&rsquo;s ten wards are paired into five districts —
                voters in each district elect both a city and a regional
                councillor.
              </p>
            </div>

            <RaceList
              races={election.races}
              wards={election.wards}
              nominationCloseLabel={election.nominationCloseLabel}
            />
          </section>

          {/* ── Closing CTA ──────────────────────────────────── */}
          <section className="border-b-2 border-dark px-6 py-16 md:px-14 md:py-20 text-center flex flex-col items-center">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.035em] text-[clamp(1.9rem,4.5vw,3.25rem)] max-w-[24ch] text-balance mb-6">
              The Brampton you know is possible doesn&rsquo;t vote itself in.
            </h2>
            <p className="mb-9 font-serif text-[1.15rem] leading-[1.5] text-dark/75 max-w-[46ch]">
              Brampton votes {election.electionDateLabel}. Add your name — then
              bring someone with you.
            </p>
            <PledgeButton
              election="brampton-2026"
              source="election-landing"
              className="group/btn inline-flex items-center gap-3 type-button text-bg bg-accent px-7 py-4 transition-colors hover:bg-accent-hover cursor-pointer"
            >
              Pledge to vote
              <ArrowRight className="size-4 shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
            </PledgeButton>
          </section>

          {/* ── Source note ──────────────────────────────────── */}
          <section className="px-6 py-12 md:px-14 md:py-14">
            <p className="type-label-sm text-text-muted !tracking-[0.06em] max-w-[64ch] leading-[1.7]">
              Candidates come from the City of Brampton&rsquo;s official
              registered-candidate listing and are updated daily, so someone who
              filed today may not appear until tomorrow. Withdrawn candidates
              stay listed, as the city lists them. The field is not final until
              nominations close.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
