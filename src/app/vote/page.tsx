import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActiveElections, type ActiveElection } from "./data";

export const metadata: Metadata = {
  title: "Elections",
  description:
    "Every election Build Canada is tracking — who is running, what they intend to build, and when the polls open.",
  alternates: { canonical: "/vote" },
  openGraph: {
    title: "Elections — Build Canada",
    description:
      "Every election Build Canada is tracking — who is running, what they intend to build, and when the polls open.",
    type: "website",
  },
};

/** One stat in a card's footer row. */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-sans font-medium text-[1.35rem] tracking-[-0.02em] leading-none tabular-nums">
        {value}
      </p>
      <p className="type-label-sm text-text-secondary !tracking-[0.06em] mt-2">
        {label}
      </p>
    </div>
  );
}

function ElectionCard({ election }: { election: ActiveElection }) {
  const stats = (
    <div className="mt-8 pt-6 border-t border-border-light flex flex-wrap gap-x-12 gap-y-6">
      <Stat label="Days until polls open" value={String(election.daysUntil)} />
      <Stat label="Election day" value={election.electionDateLabel} />
      {election.raceCount !== null && (
        <Stat
          label={election.raceCount === 1 ? "Race" : "Races on the ballot"}
          value={String(election.raceCount)}
        />
      )}
      {election.candidateCount !== null && (
        <Stat
          label="Registered candidates"
          value={String(election.candidateCount)}
        />
      )}
    </div>
  );

  const body = (
    <>
      <div className="flex justify-between items-start gap-6">
        <div>
          <p className="type-label text-accent mb-3.5">{election.eyebrow}</p>
          <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.85rem,3.5vw,2.6rem)] max-w-[24ch] text-balance">
            {election.name}
          </h2>
        </div>
        {election.href ? (
          <ArrowRight className="hidden sm:block size-6 flex-none mt-1 text-text-secondary transition-transform group-hover:translate-x-1" />
        ) : (
          <span className="hidden sm:block flex-none type-label-sm text-text-secondary mt-2">
            Coverage soon
          </span>
        )}
      </div>
      <p className="mt-4 font-serif text-[1.08rem] leading-[1.45] text-dark/80 max-w-[62ch]">
        {election.nominationCloseLabel
          ? `Nominations close ${election.nominationCloseLabel} — the field is not final until then.`
          : "Nomination dates have not been published yet."}
      </p>
      {stats}
    </>
  );

  if (!election.href) {
    return (
      <div className="bg-bg px-6 py-10 md:px-14 md:py-12 border-t border-border-light">
        {body}
      </div>
    );
  }

  return (
    <Link
      href={election.href}
      className="group bg-bg px-6 py-10 md:px-14 md:py-12 border-t border-border-light block transition-colors hover:bg-bg-alt"
    >
      {body}
    </Link>
  );
}

export default async function ElectionsPage() {
  const elections = await getActiveElections();

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip text-dark">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="px-6 py-14 md:px-14 md:py-16 border-b-2 border-dark">
        <p className="type-label text-accent mb-5">Elections</p>
        <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(3rem,7vw,5.75rem)] max-w-[16ch] text-balance mb-7">
          Every race we&rsquo;re tracking
        </h1>
        <p className="font-serif text-[clamp(1.15rem,1.6vw,1.4rem)] leading-[1.5] max-w-[62ch]">
          Elections are where the country decides what it will build next.
          Build&nbsp;Canada tracks the races that matter: who is running, what
          they intend to build, and when the polls open. Pick an election below
          to see the full field.
        </p>
      </section>

      {/* ── Active elections ─────────────────────────────────── */}
      <section className="border-b-2 border-dark">
        <div className="px-6 pt-12 pb-8 md:px-14 flex justify-between items-end gap-6 flex-wrap">
          <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.75rem,3vw,2.25rem)]">
            Active elections
          </h2>
          {elections.length > 0 && (
            <p className="type-label text-text-secondary pb-1.5 !tracking-[0.08em]">
              {elections.length}{" "}
              {elections.length === 1 ? "election" : "elections"} · upcoming
            </p>
          )}
        </div>

        {elections.length > 0 ? (
          elections.map((election) => (
            <ElectionCard key={election.slug} election={election} />
          ))
        ) : (
          <p className="px-6 md:px-14 pb-12 font-serif text-[1.1rem] leading-[1.5] text-dark/80 max-w-[56ch]">
            No elections are open right now. Check back when the next campaign
            begins — or read our memos in the meantime.
          </p>
        )}
      </section>

      {/* ── Closing note ─────────────────────────────────────── */}
      <section className="px-6 py-14 md:px-14 md:py-16">
        <p className="type-label-sm text-text-muted !tracking-[0.06em] max-w-[60ch]">
          Candidate rosters come from each jurisdiction&rsquo;s official
          registered-candidate list and refresh daily. Fields are not final
          until nominations close.
        </p>
      </section>
    </div>
  );
}
