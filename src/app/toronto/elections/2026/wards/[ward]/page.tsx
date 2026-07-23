import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import CountdownDays from "../../CountdownDays";
import { CandidateSiteLink } from "../../CandidateSiteLink";
import { WardMap, WardMapDefs } from "../../WardMap";
import {
  WARD_NUMBERS,
  getWards,
  getCouncillorCandidates,
  findWardIndex,
  initialsFor,
  nameKey,
  daysUntilElection,
  NOMINATION_CLOSE_LABEL,
  ELECTION_DAY_LABEL,
  type CouncillorTag,
} from "../../data";
import { WARD_SHAPES } from "../../wardGeo";

export function generateStaticParams() {
  return WARD_NUMBERS.map((n) => ({ ward: n }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ward: string }>;
}): Promise<Metadata> {
  const { ward } = await params;
  const idx = findWardIndex(ward);
  if (idx === -1) return { title: "Ward not found" };
  const w = WARD_SHAPES[idx];
  return {
    title: `Ward ${w.n} — ${w.name}`,
    description: `The council race in Ward ${w.n} (${w.name}) for Toronto's October 26, 2026 municipal election. See every candidate registered to represent it.`,
    alternates: { canonical: `/toronto/elections/2026/wards/${w.n}` },
    openGraph: {
      title: `Ward ${w.n} — ${w.name} — Toronto 2026 Election`,
      description: `Candidates for councillor in ${w.name}.`,
      type: "website",
    },
  };
}

const TAG_STYLES: Record<CouncillorTag, string> = {
  Incumbent: "border-accent text-accent",
  Challenger: "border-text-secondary text-dark",
  Registered: "border-border-light text-text-secondary",
};

export default async function WardDetailPage({
  params,
}: {
  params: Promise<{ ward: string }>;
}) {
  const { ward } = await params;
  const idx = findWardIndex(ward);
  if (idx === -1) notFound();

  const [wards, candidates] = await Promise.all([
    getWards(),
    getCouncillorCandidates(idx),
  ]);
  const w = wards[idx];
  const initialDays = daysUntilElection();

  const prev = wards[(idx + wards.length - 1) % wards.length];
  const next = wards[(idx + 1) % wards.length];

  return (
    <div className="theme-election bg-bg text-dark">
      <div className="mx-[10px] my-[10px] border-2 border-dark bg-bg overflow-x-clip">
        <WardMapDefs />

        {/* ── Breadcrumb ─────────────────────────────────────── */}
        <div className="px-6 md:px-14 py-5 border-b border-border-light type-label-sm !tracking-[0.1em] flex items-center gap-2.5">
          <Link
            href="/toronto/elections/2026#wards"
            className="text-text-secondary hover:text-accent transition-colors"
          >
            All wards
          </Link>
          <span className="text-border-light">/</span>
          <span>Ward {w.n}</span>
        </div>

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="grid md:grid-cols-[1fr_auto] gap-10 md:items-center px-6 py-12 md:px-14 md:py-14 border-b-2 border-dark">
          <div>
            <p className="type-label text-accent mb-5">
              City Council · Ward {w.n}
            </p>
            <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(2.75rem,6vw,5rem)] max-w-[16ch] text-balance mb-6">
              {w.name}
            </h1>
            <p className="font-serif text-[clamp(1.1rem,1.5vw,1.35rem)] leading-[1.5] max-w-[60ch]">
              One seat on Toronto city council, decided on
              October&nbsp;26,&nbsp;2026. Below are the candidates registered to
              represent {w.name} — the people who will set the direction on
              housing, transit and local growth for this part of the city.
            </p>
          </div>
          <WardMap
            activeWard={w.n}
            className="hidden md:block w-[260px] h-auto flex-none"
          />
        </section>

        {/* ── Key stats ──────────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-3 border-b-2 border-dark">
          <div className="px-8 py-7 border-r border-b md:border-b-0 border-border-light">
            <div className="font-sans font-semibold text-[2.75rem] leading-none tracking-[-0.03em] tabular-nums">
              {w.count}
            </div>
            <div className="type-label-sm !tracking-[0.1em] text-text-secondary mt-2.5">
              Candidates registered
            </div>
          </div>
          <div className="px-8 py-7 md:border-r border-b md:border-b-0 border-border-light">
            <CountdownDays
              initialDays={initialDays}
              className="font-sans font-semibold text-[2.75rem] leading-none tracking-[-0.03em] tabular-nums"
            />
            <div className="type-label-sm !tracking-[0.1em] text-text-secondary mt-2.5">
              Days until polls open
            </div>
          </div>
          <div className="px-8 py-7 col-span-2 md:col-span-1">
            <div className="font-sans font-medium text-[1.4rem] leading-[1.1] tracking-[-0.01em] pt-1.5 text-accent">
              {ELECTION_DAY_LABEL}
            </div>
            <div className="type-label-sm !tracking-[0.1em] text-text-secondary mt-3">
              Election day
            </div>
          </div>
        </section>

        {/* ── Candidates ─────────────────────────────────────── */}
        <section className="border-b-2 border-dark">
          <div className="px-6 md:px-14 pt-11 pb-2">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.75rem,3vw,2.5rem)]">
              Candidates for Councillor
            </h2>
          </div>
          <div>
            {candidates.length === 0 && (
              <p className="px-6 md:px-14 py-10 font-serif text-[1.08rem] leading-[1.45] text-dark/80 border-t border-border-light">
                No candidates have registered in {w.name} yet. Nominations close
                on {NOMINATION_CLOSE_LABEL} — check back as more candidates
                register.
              </p>
            )}
            {candidates.map((cand, i) => (
              <div
                key={`${cand.name}-${i}`}
                className="flex gap-5 sm:gap-7 items-center px-6 md:px-14 py-7 border-t border-border-light"
              >
                <div className="flex-none size-16 bg-dark relative overflow-hidden flex items-center justify-center font-sans font-medium text-[1.35rem] tracking-[-0.02em] text-bg">
                  {cand.image ? (
                    <Image
                      src={cand.image}
                      alt={cand.name}
                      fill
                      sizes="64px"
                      className="object-cover object-center"
                    />
                  ) : (
                    (cand.initials ?? initialsFor(cand.name))
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3.5 flex-wrap mb-2">
                    <h3 className="font-sans font-medium text-[1.5rem] tracking-[-0.02em] leading-[1.1]">
                      {cand.name}
                    </h3>
                    <span
                      className={`type-label-sm !text-[10px] !tracking-[0.12em] px-2 py-1 border ${TAG_STYLES[cand.tag]}`}
                    >
                      {cand.tag}
                    </span>
                  </div>
                  <p className="font-serif text-[1.08rem] leading-[1.45] text-dark/80 max-w-[64ch]">
                    {cand.bio}
                  </p>
                </div>
                {cand.website ? (
                  <CandidateSiteLink
                    href={cand.website}
                    candidate={cand.name}
                    candidateKey={nameKey(cand.name)}
                    race="councillor"
                    tag={cand.tag}
                    ward={w.n}
                    wardName={w.name}
                    className="group/btn hidden sm:inline-flex flex-none items-center gap-1.5 type-label-sm text-accent hover:underline"
                  >
                    Campaign site
                    <ArrowUpRight className="size-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </CandidateSiteLink>
                ) : (
                  <span className="hidden sm:block flex-none type-label-sm text-text-secondary">
                    Profile to come
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="px-6 md:px-14 py-4 type-label-sm text-text-muted border-t border-border-light">
            Registered candidates from the City Clerk&rsquo;s list. The field is
            not final until nominations close on {NOMINATION_CLOSE_LABEL}.
          </p>
        </section>

        {/* ── Prev / next ward ───────────────────────────────── */}
        <section className="grid grid-cols-2 border-b-2 border-dark">
          <Link
            href={`/toronto/elections/2026/wards/${prev.n}`}
            className="group px-6 md:px-14 py-7 border-r border-border-light transition-colors hover:bg-[#ebdfd4]"
          >
            <div className="type-label-sm !tracking-[0.1em] text-text-secondary mb-2 flex items-center gap-2">
              <ArrowLeft className="size-3.5" /> Ward {prev.n}
            </div>
            <div className="font-sans font-medium text-[1.25rem] tracking-[-0.015em]">
              {prev.name}
            </div>
          </Link>
          <Link
            href={`/toronto/elections/2026/wards/${next.n}`}
            className="group px-6 md:px-14 py-7 text-right transition-colors hover:bg-[#ebdfd4]"
          >
            <div className="type-label-sm !tracking-[0.1em] text-text-secondary mb-2 flex items-center justify-end gap-2">
              Ward {next.n} <ArrowRight className="size-3.5" />
            </div>
            <div className="font-sans font-medium text-[1.25rem] tracking-[-0.015em]">
              {next.name}
            </div>
          </Link>
        </section>

        {/* ── Footer band ────────────────────────────────────── */}
        <footer className="bg-dark text-bg px-6 py-12 md:px-14 flex justify-between gap-10 flex-wrap items-end">
          <p className="type-label-sm !tracking-[0.08em] text-charcoal-400 leading-[1.7]">
            Toronto 2026 Election Tracker
            <br />A Build Canada project
          </p>
          <Link
            href="/toronto/elections/2026#wards"
            className="type-label !tracking-[0.1em] text-bg border-b-2 border-charcoal-800 pb-1 hover:border-bg transition-colors"
          >
            Back to all wards
          </Link>
        </footer>
      </div>
    </div>
  );
}
