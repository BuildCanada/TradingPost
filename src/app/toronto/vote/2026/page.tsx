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
import { SURVEY_PATH } from "../survey-questions/path";

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
           This grid used to carry six cards, and three of them pointed at
           things the reader could already see. The alignment survey is the
           closing call to action at the foot of the page; the mayoral
           questionnaire is linked from the "Candidates for Mayor" heading it
           belongs to; and "your ward" was a card whose whole function was to
           scroll you past itself to the ward grid two hundred pixels below.

           A card earns its place by going somewhere the page does not
           otherwise go. These three do. Everything else is reachable from the
           section that owns it, which is where a reader looks for it anyway. */
        explore: [
          {
            eyebrow: "The whole field",
            title: "Where the candidates stand",
            blurb:
              "One chart per question, each carrying every answer we received: where the people running to govern Toronto converge, and where they split.",
            href: `${ELECTION.basePath}/issues`,
          },
          {
            eyebrow: "Questionnaire",
            title: "The questions we asked",
            blurb:
              "The full question set every candidate received, with the reasoning behind each one.",
            href: SURVEY_PATH,
          },
          {
            eyebrow: "Turnout",
            title: "Pledge to vote",
            blurb:
              "Put your name on the record and share the stamp. It takes ten seconds, and it is the first step to showing up.",
            href: ELECTION.pledgePath,
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
