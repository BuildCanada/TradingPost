import type { Metadata } from "next";
import { ElectionLanding } from "@/components/elections/ElectionLanding";
import { ELECTION, getHamilton2026 } from "./data";

export const metadata: Metadata = {
  title: "Hamilton 2026 Election",
  description:
    "Hamilton elects its mayor, fifteen ward councillors and its school board trustees on October 26, 2026. See every registered candidate, ward by ward.",
  alternates: { canonical: ELECTION.basePath },
  openGraph: {
    title: "Hamilton 2026 Election — Build Canada",
    description:
      "Tracking every race in Hamilton's 2026 municipal election: the candidates for mayor and the 15 council wards.",
    type: "website",
  },
};

export default async function Hamilton2026ElectionPage() {
  const view = await getHamilton2026();

  // No local fallback roster for Hamilton, so an API outage says so plainly
  // rather than rendering a page that looks like an empty field.
  if (view === null) {
    return (
      <div className="bg-bg text-dark">
        <div className="mx-[10px] my-[10px] border border-border-light bg-bg px-6 py-16 md:px-14">
          <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(2.5rem,6vw,4.5rem)] max-w-[15ch] text-balance mb-7">
            The 2026 Hamilton Municipal Election
          </h1>
          <p className="font-serif text-[1.15rem] leading-[1.5] max-w-[56ch] text-dark/80">
            The candidate list is temporarily unavailable. It comes from the
            City of Hamilton&rsquo;s registered-candidate listing — please check
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
        heroTitle: "The 2026 Hamilton Municipal Election",
        heroBlurb: (
          <>
            On October&nbsp;26, 2026, Hamilton will elect its mayor and fifteen
            ward councillors. Explore who is running for mayor and for
            councillor in your ward.
          </>
        ),
        wardsBlurb:
          "Fifteen wards, fifteen council races. Select a ward to see the candidates running to represent it, plus the school board trustees on the same ballot.",
        closingHeadline: (
          <>The Hamilton you know is possible doesn&rsquo;t vote itself in.</>
        ),
        closingBlurb: (
          <>
            Hamilton votes {ELECTION.voteDayLabel}. Add your name — then bring
            someone with you.
          </>
        ),
        sourceNote: (
          <>
            Candidates come from the City of Hamilton&rsquo;s official
            registered-candidate listing and are updated daily, so someone who
            filed today may not appear until tomorrow.
            {view.nominationCloseLabel
              ? ` The field is not final until nominations close on ${view.nominationCloseLabel}.`
              : " The field is not final until nominations close."}
          </>
        ),
      }}
    />
  );
}
