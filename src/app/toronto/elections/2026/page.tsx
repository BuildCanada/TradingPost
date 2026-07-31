import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import CountdownDays from "./CountdownDays";
import { CandidateSiteLink } from "./CandidateSiteLink";
import { WardMapDefs } from "./WardMap";
import { WardCard } from "./WardCard";
import WardLookup from "./WardLookup";
import { PledgeButton } from "@/components/elections/PledgeButton";
import { ResidencyModal } from "@/components/elections/ResidencyModal";
import {
  getMayoralCandidates,
  getWards,
  daysUntilElection,
  daysUntil,
  initialsFor,
  nameKey,
  splitFrontRunners,
  FRONT_RUNNER_NOTE,
  ADVANCE_VOTE_START_ISO,
  ADVANCE_VOTE_LABEL,
  MAIL_IN_DEADLINE_ISO,
  MAIL_IN_DEADLINE_LABEL,
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
  const { frontRunners, field } = splitFrontRunners(mayoralCandidates);
  const initialAdvanceDays = daysUntil(ADVANCE_VOTE_START_ISO);
  const initialMailInDays = daysUntil(MAIL_IN_DEADLINE_ISO);

  return (
    <div className="theme-election bg-bg text-dark">
      <Suspense fallback={null}>
        <ResidencyModal election="toronto-2026" />
      </Suspense>
      <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="px-6 py-14 md:px-14 md:py-16 border-b-2 border-dark">

          <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(3rem,7vw,5.75rem)] max-w-[15ch] text-balance mb-7">
            The 2026 Toronto Municipal Election
          </h1>
          <p className="font-serif text-[clamp(1.15rem,1.6vw,1.4rem)] leading-[1.5] max-w-[62ch]">
            On October 26th, 2026, Toronto will elect its mayor and 25 city councillors.
            Explore who is running for mayor and for councillor in your ward.
          </p>
        </section>

        {/* ── Countdown + how to vote ──────────────────────────── */}
        <section className="grid md:grid-cols-[1.15fr_0.85fr_1fr] border-b-2 border-dark">
          <div className="px-6 py-12 md:px-14 md:py-14 flex flex-col justify-center">
            <div className="flex items-end gap-5 flex-wrap">
              <CountdownDays
                initialDays={initialDays}
                className="font-sans font-semibold leading-[0.8] tracking-[-0.05em] text-[clamp(5rem,13vw,11rem)] tabular-nums"
              />
              <span className="type-label !tracking-[0.12em] leading-[1.5] pb-3.5">
                Days until
                <br />
                polls open
              </span>
            </div>
          </div>
          <div className="px-6 py-12 md:px-14 md:py-14 border-t-2 md:border-t-0 md:border-l border-border-light flex flex-col justify-center gap-8">
            <div>
              <div className="flex items-end gap-3">
                <CountdownDays
                  initialDays={initialAdvanceDays}
                  targetIso={ADVANCE_VOTE_START_ISO}
                  className="font-sans font-semibold leading-[0.8] tracking-[-0.04em] text-[clamp(2.75rem,5.5vw,4rem)] tabular-nums"
                />
                <span className="type-label !tracking-[0.12em] leading-[1.4] pb-1">
                  Days until
                  <br />
                  advance polls
                </span>
              </div>
              <p className="mt-2.5 font-serif text-[1rem] leading-[1.4] text-accent">
                {ADVANCE_VOTE_LABEL}
              </p>
            </div>
            <div className="pt-7 border-t border-border-light">
              <div className="flex items-end gap-3">
                <CountdownDays
                  initialDays={initialMailInDays}
                  targetIso={MAIL_IN_DEADLINE_ISO}
                  className="font-sans font-semibold leading-[0.8] tracking-[-0.04em] text-[clamp(2.75rem,5.5vw,4rem)] tabular-nums"
                />
                <span className="type-label !tracking-[0.12em] leading-[1.4] pb-1">
                  Days to apply
                  <br />
                  to vote by mail
                </span>
              </div>
              <p className="mt-2.5 font-serif text-[1rem] leading-[1.4] text-accent">
                {MAIL_IN_DEADLINE_LABEL}, 4:30&nbsp;p.m.
              </p>
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
          <div className="px-6 pt-12 pb-8 md:px-14">
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(2rem,3.5vw,2.75rem)]">
              Candidates for Mayor
            </h2>
          </div>

          {frontRunners.length > 0 && (
            <>
              <div className="px-6 md:px-14 pb-6 border-t border-border-light pt-8">
                <p className="type-label text-accent mb-2.5">Front runners</p>
                <p className="font-serif text-[1.05rem] leading-[1.45] text-dark/80 max-w-[52ch]">
                  {FRONT_RUNNER_NOTE}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-px bg-border-light border-y-2 border-dark">
                {frontRunners.map((cand, i) => (
                  <div
                    key={`front-${cand.name}-${i}`}
                    className="bg-bg-alt flex items-center gap-6 sm:gap-7 px-6 md:px-14 py-9"
                  >
                    <div className="relative flex-none size-[clamp(104px,11vw,148px)] bg-dark overflow-hidden flex items-center justify-center font-sans font-medium text-[clamp(2rem,3vw,2.6rem)] tracking-[-0.03em] text-bg">
                      {cand.image ? (
                        <Image
                          src={cand.image}
                          alt={cand.name}
                          fill
                          sizes="148px"
                          className="object-cover object-center"
                          priority
                        />
                      ) : (
                        (cand.initials ?? initialsFor(cand.name))
                      )}
                    </div>
                    <div className="min-w-0 flex flex-col gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-sans font-medium text-[clamp(1.6rem,2.6vw,2.15rem)] tracking-[-0.03em] leading-[1.05]">
                          {cand.name}
                        </h3>
                        {cand.tag === "Incumbent" && (
                          <span className="inline-flex items-center type-label-sm !text-[10px] !leading-none !tracking-[0.12em] pl-2 pr-[calc(0.5rem-0.12em)] py-1.5 border border-accent text-accent">
                            {cand.tag}
                          </span>
                        )}
                      </div>
                      {cand.website ? (
                        <CandidateSiteLink
                          href={cand.website}
                          candidate={cand.name}
                          candidateKey={nameKey(cand.name)}
                          race="mayor"
                          tag={cand.tag}
                          className="group/btn self-start inline-flex items-center gap-1.5 type-label-sm text-accent hover:underline"
                        >
                          Campaign site
                          <ArrowUpRight className="size-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                        </CandidateSiteLink>
                      ) : (
                        <span className="type-label-sm text-text-secondary">
                          Profile to come
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="px-6 md:px-14 pt-8 pb-6 type-label text-text-secondary !tracking-[0.08em]">
                The rest of the field
              </p>
            </>
          )}

          <div className="grid grid-cols-[repeat(auto-fill,minmax(272px,1fr))] border-t border-l border-border-light">
            {field.map((cand, i) => (
              <div
                key={`${cand.name}-${i}`}
                className="bg-bg flex gap-4 items-center px-6 py-5 border-b border-r border-border-light"
              >
                <div className="flex-none size-12 bg-dark relative overflow-hidden flex items-center justify-center font-sans font-medium text-[1rem] tracking-[-0.02em] text-bg">
                  {cand.image ? (
                    <Image
                      src={cand.image}
                      alt={cand.name}
                      fill
                      sizes="48px"
                      className="object-cover object-center"
                    />
                  ) : (
                    (cand.initials ?? initialsFor(cand.name))
                  )}
                </div>
                <div className="min-w-0 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-sans font-medium text-[1.15rem] tracking-[-0.02em] leading-[1.15]">
                      {cand.name}
                    </h3>
                    {cand.tag === "Incumbent" && (
                      <span className="inline-flex items-center type-label-sm !text-[10px] !leading-none !tracking-[0.12em] pl-2 pr-[calc(0.5rem-0.12em)] py-1.5 border border-accent text-accent">
                        {cand.tag}
                      </span>
                    )}
                  </div>
                  {cand.website ? (
                    <CandidateSiteLink
                      href={cand.website}
                      candidate={cand.name}
                      candidateKey={nameKey(cand.name)}
                      race="mayor"
                      tag={cand.tag}
                      className="group/btn self-start inline-flex items-center gap-1.5 type-label-sm text-accent hover:underline"
                    >
                      Campaign site
                      <ArrowUpRight className="size-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </CandidateSiteLink>
                  ) : (
                    <span className="type-label-sm text-text-secondary">
                      Profile to come
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </section>

        {/* ── Wards ────────────────────────────────────────────── */}
        <section id="wards" className="border-b-2 border-dark scroll-mt-24">
          <div className="px-6 pt-12 pb-8 md:px-14 flex justify-between items-end gap-6 flex-wrap">
            <div>
              <p className="type-label text-accent mb-3.5">City Council</p>
              <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(2rem,3.5vw,2.75rem)] mb-2.5">
                Find your ward
              </h2>
              <p className="font-serif text-[1.1rem] leading-[1.45] max-w-[52ch] text-dark/80 mb-8">
                Twenty-five wards, twenty-five council races. Select a ward to
                see the candidates running to represent it.
              </p>
              <WardLookup wards={wards} />
            </div>
            <p className="type-label text-text-secondary pb-1.5 !tracking-[0.08em]">
              {wards.length} wards
            </p>
          </div>

          <WardMapDefs />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] border-t border-l border-border-light">
            {wards.map((ward) => (
              <WardCard
                key={ward.n}
                ward={ward}
                className="border-b border-r border-border-light"
              />
            ))}
          </div>
        </section>

        {/* ── Closing CTA (soft-linen band, full bleed) ────────── */}
        <section className="bg-bg text-dark px-6 py-20 md:px-14 md:py-28 text-center flex flex-col items-center">

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
