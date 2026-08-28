import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WardDetail } from "@/components/elections/WardDetail";
import { WardMap, WardMapDefs } from "@/components/elections/WardMap";
import {
  byCandidateKey,
  candidateAnswers,
} from "@/lib/elections/candidate-answers";
import {
  CANDIDATE_QUESTIONNAIRE_SLUG,
  fetchCandidateResponses,
} from "@/lib/elections/candidate-responses";
import { fetchSurvey } from "@/lib/elections/survey";
import { ELECTION, WARD_NUMBERS, getToronto2026, getToronto2026Ward } from "../../data";
import { WARD_GEO, WARD_SHAPES } from "../../wardGeo";

/**
 * Published questionnaire answers for this ward's candidates, keyed by
 * `nameKey` so a roster card can find its own.
 *
 * Both halves come from York Factory and both are publish-gated, so an empty
 * result is the normal case for most of the campaign — not a failure. The
 * questionnaire is a nice-to-have on this page besides: if York Factory is
 * unreachable the ward still has to render its roster, so a failed fetch costs
 * the answers rather than the page. That is the opposite of the survey page,
 * where a missing survey means there is nothing to show at all.
 *
 * Answers we cannot match to a candidate on this ward's roster are dropped.
 * The join is on name, and a response we cannot place is one we must not
 * attribute.
 */
async function wardSurveyAnswers(candidateKeys: Set<string>) {
  try {
    // Every response, not just this ward's: the counts beside each answer are
    // the whole field's split ("21 of 30 said this too"), which a ward of one
    // or two respondents cannot supply. The ward narrows who gets a card, not
    // what they are measured against.
    const [survey, responses] = await Promise.all([
      fetchSurvey(ELECTION.slug, CANDIDATE_QUESTIONNAIRE_SLUG),
      fetchCandidateResponses(ELECTION.slug),
    ]);
    const entries = candidateAnswers(survey, responses).filter((entry) =>
      candidateKeys.has(entry.key),
    );
    return byCandidateKey(entries);
  } catch {
    return {};
  }
}

export function generateStaticParams() {
  return WARD_NUMBERS.map((n) => ({ ward: n }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ward: string }>;
}): Promise<Metadata> {
  const { ward } = await params;
  const w = WARD_SHAPES.find((shape) => parseInt(shape.n, 10) === parseInt(ward, 10));
  if (!w) return { title: "Ward not found" };
  return {
    title: `Ward ${w.n} — ${w.name}`,
    description: `The council race in Ward ${w.n} (${w.name}) for Toronto's October 26, 2026 municipal election. See every candidate registered to represent it.`,
    alternates: { canonical: `${ELECTION.basePath}/wards/${w.n}` },
    openGraph: {
      title: `Ward ${w.n} — ${w.name} — Toronto 2026 Election`,
      description: `Candidates for councillor in ${w.name}.`,
      type: "website",
    },
  };
}

export default async function WardDetailPage({
  params,
}: {
  params: Promise<{ ward: string }>;
}) {
  const { ward } = await params;
  const [data, view] = await Promise.all([
    getToronto2026Ward(ward),
    getToronto2026(),
  ]);
  if (!data) notFound();

  const candidateKeys = new Set(
    data.councilRaces.flatMap((race) => race.candidates.map((c) => c.key)),
  );
  const surveyAnswers = await wardSurveyAnswers(candidateKeys);

  return (
    <WardDetail
      election={ELECTION}
      data={data}
      nominationCloseLabel={view.nominationCloseLabel}
      surveyAnswers={surveyAnswers}
      wardMapDefs={<WardMapDefs geo={WARD_GEO} />}
      wardMap={
        <WardMap
          geo={WARD_GEO}
          activeWard={data.ward.n}
          className="hidden md:block w-[260px] h-auto flex-none"
        />
      }
    />
  );
}
