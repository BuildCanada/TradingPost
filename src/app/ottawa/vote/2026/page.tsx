import type { Metadata } from "next";
import { ElectionLanding } from "@/components/elections/ElectionLanding";
import { WardCard } from "@/components/elections/WardCard";
import { WardMap, WardMapDefs } from "@/components/elections/WardMap";
import CountdownDays from "@/components/elections/CountdownDays";
import { daysUntil } from "@/lib/elections/dates";
import { WARD_GEO } from "./wardGeo";
import { ELECTION, WARDS, getOttawa2026 } from "./data";

export const metadata: Metadata = {
  title: "Ottawa 2026 Election",
  description:
    "Ottawa elects its mayor and 24 ward councillors on October 26, 2026. Find your ward and, once nominations open, everyone running to represent it.",
  alternates: { canonical: ELECTION.basePath },
  openGraph: {
    title: "Ottawa 2026 Election — Build Canada",
    description:
      "Tracking Ottawa's 2026 municipal election: the race for mayor and all 24 council wards.",
    type: "website",
  },
};

export default async function Ottawa2026ElectionPage() {
  const view = await getOttawa2026();

  // Ottawa's ward boundaries are published; its candidate roster is not yet.
  // Rather than hide the page, show the wards the city has drawn and say
  // plainly that the field is still to come.
  if (view === null) return <PreRoster />;

  return (
    <ElectionLanding
      election={ELECTION}
      view={view}
      wardMapDefs={<WardMapDefs geo={WARD_GEO} />}
      renderWardMap={(ward) => (
        <WardMap
          geo={WARD_GEO}
          activeWard={ward.n}
          className="w-[92px] h-auto flex-none block"
        />
      )}
      content={{
        heroTitle: "The 2026 Ottawa Municipal Election",
        heroBlurb: (
          <>
            On October&nbsp;26, 2026, Ottawa will elect its mayor and 24 ward
            councillors. Explore who is running for mayor and for councillor in
            your ward.
          </>
        ),
        wardsBlurb:
          "Twenty-four wards, twenty-four council races. Select a ward to see the candidates running to represent it.",
        closingHeadline: (
          <>The Ottawa you know is possible doesn&rsquo;t vote itself in.</>
        ),
        closingBlurb: (
          <>
            Ottawa votes {ELECTION.voteDayLabel}. Add your name — then bring
            someone with you.
          </>
        ),
        sourceNote: (
          <>
            Candidates come from the City of Ottawa&rsquo;s official
            registered-candidate listing and are updated daily.
            {view.nominationCloseLabel
              ? ` The field is not final until nominations close on ${view.nominationCloseLabel}.`
              : " The field is not final until nominations close."}{" "}
            Ward boundaries are the City&rsquo;s own 2022–2026 wards.
          </>
        ),
      }}
    />
  );
}

/** The page before Ottawa's candidate roster is published: the countdown, the
 *  ward map, and an honest note about what isn't here yet. */
function PreRoster() {
  return (
    <div className="bg-bg text-dark">
      <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="px-6 py-14 md:px-14 md:py-16 border-b-2 border-dark">
          <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(3rem,7vw,5.75rem)] max-w-[15ch] text-balance mb-7">
            The 2026 Ottawa Municipal Election
          </h1>
          <p className="font-serif text-[clamp(1.15rem,1.6vw,1.4rem)] leading-[1.5] max-w-[62ch]">
            On October&nbsp;26, 2026, Ottawa will elect its mayor and 24 ward
            councillors. Nominations haven&rsquo;t opened yet — find your ward
            below, and we&rsquo;ll fill in the field as candidates register.
          </p>
        </section>

        {/* ── Countdown ────────────────────────────────────────── */}
        <section className="px-6 py-12 md:px-14 md:py-14 border-b-2 border-dark">
          <div className="flex items-end gap-5 flex-wrap">
            <CountdownDays
              initialDays={daysUntil(ELECTION.electionDateIso)}
              targetIso={ELECTION.electionDateIso}
              className="font-sans font-semibold leading-[0.8] tracking-[-0.05em] text-[clamp(5rem,13vw,11rem)] tabular-nums"
            />
            <span className="type-label !tracking-[0.12em] leading-[1.5] pb-3.5">
              Days until
              <br />
              polls open
            </span>
          </div>
          <p className="mt-7 pt-5 border-t border-border-light font-serif text-[1.05rem] leading-[1.4]">
            Polls open{" "}
            <span className="text-accent">{ELECTION.voteDayLabel},&nbsp;2026</span>
            , {ELECTION.pollHoursLabel}.
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
                Twenty-four wards, twenty-four council races. These are the
                City&rsquo;s 2022–2026 ward boundaries, the ones the 2026
                election will be run on.
              </p>
            </div>
            <p className="type-label text-text-secondary pb-1.5 !tracking-[0.08em]">
              {WARDS.length} wards
            </p>
          </div>

          <WardMapDefs geo={WARD_GEO} />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] border-t border-l border-border-light">
            {WARDS.map((ward) => (
              <WardCard
                key={ward.n}
                ward={ward}
                basePath={ELECTION.basePath}
                countLabel="Candidates to come"
                map={
                  <WardMap
                    geo={WARD_GEO}
                    activeWard={ward.n}
                    className="w-[92px] h-auto flex-none block"
                  />
                }
                className="border-b border-r border-border-light"
              />
            ))}
          </div>
        </section>

        {/* ── Source note ──────────────────────────────────────── */}
        <section className="px-6 py-14 md:px-14 md:py-16">
          <p className="type-label-sm text-text-muted !tracking-[0.06em] max-w-[60ch] leading-[1.7]">
            Ward boundaries are the City of Ottawa&rsquo;s published 2022–2026
            wards. The candidate list will follow the City Clerk&rsquo;s official
            registered-candidate listing once nominations open.
          </p>
        </section>
      </div>
    </div>
  );
}
