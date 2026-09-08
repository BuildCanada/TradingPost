import type { Metadata } from "next";
import { ElectionLanding } from "@/components/elections/ElectionLanding";
import { WardMap, WardMapDefs } from "@/components/elections/WardMap";
import { WARD_GEO } from "./wardGeo";
import { ELECTION, getToronto2026 } from "./data";
import {
  ADVANCE_VOTING_PATH,
  ELECTION_DAY,
  HOW_TO_VOTE_PATH,
  KEY_DATES_PATH,
  VOTE_BY_MAIL_PATH,
} from "./key-dates";

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
      mayorRosterPath={`${ELECTION.basePath}/mayor/candidates`}
      // Toronto publishes its poll hours, so the band's headline counter is
      // the live timer from the /toronto hero rather than a whole-day count.
      electionDay={ELECTION_DAY}
      surveyPath={`${ELECTION.basePath}/survey`}
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
            Toronto votes Monday, October 26. Answer the questions we put to the
            candidates and see which of them line up with you.
          </>
        ),
        /* WHAT IS ONLY HERE
           A card earns its place by going somewhere a reader would not
           otherwise get to, and by being the thing they came for. What is left
           is the two questionnaire reads — one race, then every race — with
           the survey between them; ElectionLanding supplies the mayoral card
           and the survey card itself.

           Everything else is reachable from the section that owns it, which is
           where a reader looks for it anyway: the question set is linked from
           the survey and from every questionnaire page, the pledge from the
           closing band, and the wards from the ward grid two hundred pixels
           below. */
        explore: [
          {
            eyebrow: "Every race",
            title: "Where the candidates stand",
            blurb:
              "Mayor and council together, question by question: where the field agrees, and where it splits.",
            href: `${ELECTION.basePath}/issues`,
          },
        ],
        guideLinks: [
          { label: "See all key dates", href: KEY_DATES_PATH },
          { label: "How to vote in Toronto", href: HOW_TO_VOTE_PATH },
          { label: "Advance voting", href: ADVANCE_VOTING_PATH },
          { label: "Vote by mail", href: VOTE_BY_MAIL_PATH },
        ],
        sourceNote:
          "Candidates come from the City Clerk's official registered-candidate list and refresh daily. The field is not final until nominations close.",
      }}
    />
  );
}
