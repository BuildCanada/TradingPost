import type { Metadata } from "next";
import { ElectionLanding } from "@/components/elections/ElectionLanding";
import { WardMap, WardMapDefs } from "@/components/elections/WardMap";
import { WARD_GEO } from "./wardGeo";
import { ELECTION, getToronto2026 } from "./data";

export const metadata: Metadata = {
  title: "Toronto 2026 Election",
  description:
    "Toronto elects its mayor and 25 city councillors on October 26, 2026. Build Canada tracks every race: the candidates for mayor, what they intend to build, and who is running in your ward.",
  alternates: { canonical: ELECTION.basePath },
  openGraph: {
    title: "Toronto 2026 Election — Build Canada",
    description:
      "Tracking every race in Toronto's 2026 municipal election: the candidates for mayor and the 25 council wards.",
    type: "website",
  },
};

export default async function Toronto2026ElectionPage() {
  const view = await getToronto2026();

  return (
    <ElectionLanding
      election={ELECTION}
      view={view}
      mayorSurveyPath={`${ELECTION.basePath}/mayor`}
      wardMapDefs={<WardMapDefs geo={WARD_GEO} />}
      renderWardMap={(ward) => (
        <WardMap
          geo={WARD_GEO}
          activeWard={ward.n}
          className="w-[92px] h-auto flex-none block"
        />
      )}
      content={{
        heroTitle: "The 2026 Toronto Municipal Election",
        heroBlurb: (
          <>
            On October 26th, 2026, Toronto will elect its mayor and 25 city
            councillors. Explore who is running for mayor and for councillor in
            your ward.
          </>
        ),
        wardsBlurb:
          "Twenty-five wards, twenty-five council races. Select a ward to see the candidates running to represent it.",
        closingHeadline: (
          <>The Toronto you know is possible doesn&rsquo;t vote itself in.</>
        ),
        closingBlurb: (
          <>
            Toronto votes Monday, October 26. Add your name — then bring someone
            with you.
          </>
        ),
        sourceNote:
          "Candidates come from the City Clerk's official registered-candidate list and refresh daily. The field is not final until nominations close.",
      }}
    />
  );
}
