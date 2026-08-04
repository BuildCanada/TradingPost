import type { Metadata } from "next";
import { ElectionLanding } from "@/components/elections/ElectionLanding";
import { ELECTION, NOMINATION_CLOSE_TIME, getBrampton2026 } from "./data";

export const metadata: Metadata = {
  title: "Brampton 2026 Election",
  description:
    "Brampton elects its mayor, five city councillors, five regional councillors and its school board trustees on October 26, 2026. See every registered candidate, ward by ward.",
  alternates: { canonical: ELECTION.basePath },
  openGraph: {
    title: "Brampton 2026 Election — Build Canada",
    description:
      "Every race and every registered candidate in Brampton's 2026 municipal election.",
    type: "website",
  },
};

export default async function Brampton2026ElectionPage() {
  const view = await getBrampton2026();

  // No local fallback roster for Brampton, so an API outage says so plainly
  // rather than rendering a page that looks like an empty field.
  if (view === null) {
    return (
      <div className="bg-bg text-dark">
        <div className="mx-[10px] my-[10px] border border-border-light bg-bg px-6 py-16 md:px-14">
          <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(2.5rem,6vw,4.5rem)] max-w-[15ch] text-balance mb-7">
            The 2026 Brampton Municipal Election
          </h1>
          <p className="font-serif text-[1.15rem] leading-[1.5] max-w-[56ch] text-dark/80">
            The candidate list is temporarily unavailable. It comes from the
            City of Brampton&rsquo;s registered-candidate listing — please check
            back shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ElectionLanding
      election={ELECTION}
      view={view}
      content={{
        heroTitle: "The 2026 Brampton Municipal Election",
        heroBlurb: (
          <>
            On October&nbsp;26, 2026, Brampton elects a mayor and, in each of
            its five districts, both a city councillor and a regional councillor
            — two council seats on every ballot. Explore who is running for
            mayor and for council in your ward.
          </>
        ),
        wardsBlurb:
          "Ten wards, paired into five districts. Select your ward to see both council races you vote in, plus the school board trustees who share the district.",
        closingHeadline: (
          <>The Brampton you know is possible doesn&rsquo;t vote itself in.</>
        ),
        closingBlurb: (
          <>
            Brampton votes {ELECTION.voteDayLabel}. Add your name — then bring
            someone with you.
          </>
        ),
        sourceNote: (
          <>
            Candidates come from the City of Brampton&rsquo;s official
            registered-candidate listing and are updated daily, so someone who
            filed today may not appear until tomorrow. Withdrawn candidates stay
            listed, as the city lists them.
            {view.nominationCloseLabel
              ? ` The field is not final until nominations close on ${view.nominationCloseLabel} at ${NOMINATION_CLOSE_TIME}.`
              : " The field is not final until nominations close."}
          </>
        ),
      }}
    />
  );
}
