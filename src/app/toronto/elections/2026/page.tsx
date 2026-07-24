import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import CountdownDays from "./CountdownDays";
import { CandidateSiteLink } from "./CandidateSiteLink";
import { WardMap, WardMapDefs } from "./WardMap";
import { PledgeButton } from "../PledgeButton";
import { ResidencyModal } from "../ResidencyModal";
import {
  getMayoralCandidates,
  getWards,
  daysUntilElection,
  initialsFor,
  nameKey,
  NOMINATION_CLOSE_LABEL,
} from "./data";

export const metadata: Metadata = {
  title: "Toronto 2026 Election",
  description:
    "Toronto elects its mayor and 25 city councillors on October 26, 2026. Build Canada tracks every race: the candidates for mayor, what they intend to build, and who is running in your ward.",
  alternates: { canonical: "/toronto/elections/2026" },
  openGraph: {
    title: "Toronto 2026 Election — Build Canada",
    description:
      "Tracking every race in Toronto's 2026 municipal election: the candidates for mayor and the 25 council wards.",
    type: "website",
  },
};

export default async function Toronto2026ElectionPage() {
  const [mayoralCandidates, wards] = await Promise.all([
    getMayoralCandidates(),
    getWards(),
  ]);
  const initialDays = daysUntilElection();

  return (
    <div className="theme-election bg-bg text-dark">
      <Suspense fallback={null}>
        <ResidencyModal />
      </Suspense>
      <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="px-6 py-14 md:px-14 md:py-16 border-b-2 border-dark">
          <p className="type-label text-accent mb-5">
            Municipal Election · City of Toronto
          </p>
          <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(3rem,7vw,5.75rem)] max-w-[15ch] text-balance mb-7">
            Toronto 2026 Election
          </h1>
          <p className="font-serif text-[clamp(1.15rem,1.6vw,1.4rem)] leading-[1.5] max-w-[62ch]">
            Toronto elects its mayor and 25 city councillors on
            October&nbsp;26,&nbsp;2026 — the largest civic decision Canada makes
            this year. Build&nbsp;Canada is tracking every race: who is running,
            what they intend to build, and how each ward will shape the
            direction of the country&rsquo;s largest city. Meet the candidates
            for mayor below, then find your ward to see who is competing to
            represent it.
          </p>
        </section>

        {/* ── Countdown + how to vote ──────────────────────────── */}
        <section className="grid md:grid-cols-[1.35fr_1fr] border-b-2 border-dark">
          <div className="px-6 py-12 md:px-14 md:py-14 flex flex-col justify-center">
            <div className="flex items-end gap-5 flex-wrap">
              <CountdownDays initialDays={initialDays} />
              <span className="type-label !tracking-[0.12em] leading-[1.5] pb-3.5">
                Days until
                <br />
                polls open
              </span>
            </div>
          </div>
          <div className="px-6 py-12 md:px-14 md:py-14 border-t-2 md:border-t-0 md:border-l border-border-light bg-bg-alt flex flex-col justify-center">
            <p className="type-label text-accent mb-3.5">Ready to vote?</p>
            <p className="font-serif text-[1.15rem] leading-[1.45] max-w-[34ch] mb-6">
              Put your name on the record. Pledging takes ten seconds — and it&rsquo;s
              the first step to showing up on election day.
            </p>
            <PledgeButton
              source="election-ready-to-vote"
              className="group/btn self-start inline-flex items-center gap-3 type-button text-bg bg-dark px-5 py-4 transition-colors hover:bg-black cursor-pointer"
            >
              Pledge to vote
              <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
            </PledgeButton>
            <p className="mt-7 pt-5 border-t border-border-light font-serif text-[1.05rem] leading-[1.4]">
              Polls open{" "}
              <span className="text-accent">
                Monday, October&nbsp;26,&nbsp;2026
              </span>
              , 10:00&nbsp;a.m. to 8:00&nbsp;p.m.
            </p>
          </div>
        </section>

        {/* ── Candidates for mayor ─────────────────────────────── */}
        <section id="candidates" className="border-b-2 border-dark scroll-mt-24">
          <div className="px-6 pt-12 pb-8 md:px-14 flex justify-between items-end gap-6 flex-wrap">
            <div>
              <p className="type-label text-accent mb-3.5">The Mayoralty</p>
              <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(2rem,3.5vw,2.75rem)]">
                Candidates for Mayor
              </h2>
            </div>
            <p className="type-label text-text-secondary pb-1.5 !tracking-[0.08em]">
              {mayoralCandidates.length} declared · field open
            </p>
          </div>

          <div>
            {mayoralCandidates.map((cand, i) => (
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
                    {cand.tag === "Incumbent" && (
                      <span className="type-label-sm !text-[10px] !tracking-[0.12em] px-2 py-1 border border-accent text-accent">
                        {cand.tag}
                      </span>
                    )}
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
                    race="mayor"
                    tag={cand.tag}
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
            Registered candidates from the City Clerk&rsquo;s list; photographs
            and profiles are added as they become available. The field is not
            final until nominations close on {NOMINATION_CLOSE_LABEL}.
          </p>
        </section>

        {/* ── Wards ────────────────────────────────────────────── */}
        <section id="wards" className="border-b-2 border-dark scroll-mt-24">
          <div className="px-6 pt-12 pb-8 md:px-14 flex justify-between items-end gap-6 flex-wrap">
            <div>
              <p className="type-label text-accent mb-3.5">City Council</p>
              <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(2rem,3.5vw,2.75rem)] mb-2.5">
                Find your ward
              </h2>
              <p className="font-serif text-[1.1rem] leading-[1.45] max-w-[52ch] text-dark/80">
                Twenty-five wards, twenty-five council races. Select a ward to
                see the candidates running to represent it.
              </p>
            </div>
            <p className="type-label text-text-secondary pb-1.5 !tracking-[0.08em]">
              {wards.length} wards
            </p>
          </div>

          <WardMapDefs />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-px bg-border-light border-t border-border-light">
            {wards.map((ward) => (
              <Link
                key={ward.n}
                href={`/toronto/elections/2026/wards/${ward.n}`}
                className="group bg-bg px-6 pt-5 pb-5 flex flex-col gap-3 min-h-[172px] transition-colors hover:bg-linen-200"
              >
                <div className="flex justify-between items-start gap-3">
                  <span className="type-label text-accent pt-1 !tracking-[0.1em]">
                    Ward {ward.n}
                  </span>
                  <WardMap
                    activeWard={ward.n}
                    className="w-[92px] h-auto flex-none block"
                  />
                </div>
                <span className="font-sans font-medium text-[1.2rem] tracking-[-0.015em] leading-[1.15] flex-1">
                  {ward.name}
                </span>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="type-label-sm text-text-secondary !tracking-[0.06em]">
                    {ward.count} candidates
                  </span>
                  <ArrowRight className="size-4 text-text-secondary opacity-70 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Closing CTA (soft-linen band, full bleed) ────────── */}
        <section className="bg-bg text-dark px-6 py-20 md:px-14 md:py-28 text-center flex flex-col items-center">
          <p className="mb-8 font-serif italic text-[1.1rem] leading-[1.5] text-dark/60">
            &ldquo;We shall not err for want of boldness.&rdquo;
            <br className="sm:hidden" /> — Sir Wilfrid Laurier
          </p>
          <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.035em] text-[clamp(2rem,5vw,3.75rem)] max-w-[22ch] text-balance mb-6">
            The Toronto you know is possible doesn&rsquo;t vote itself in.
          </h2>
          <p className="mb-10 font-serif text-[1.15rem] leading-[1.5] text-dark/75 max-w-[46ch]">
            Toronto votes Monday, October 26. Add your name — then bring someone
            with you.
          </p>
          <PledgeButton
            source="election-landing"
            className="group/btn inline-flex items-center gap-3 type-button text-bg bg-accent px-7 py-4 transition-colors hover:bg-accent-hover cursor-pointer"
          >
            Pledge to vote
            <ArrowRight className="size-4 shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
          </PledgeButton>
          <p className="mt-14 pt-5 border-t border-dark/15 type-label-sm text-text-muted !tracking-[0.06em] max-w-[60ch]">
            Data shown is illustrative and for demonstration only. Official
            candidate lists are certified by the City Clerk after nomination
            day.
          </p>
        </section>
      </div>
    </div>
  );
}
