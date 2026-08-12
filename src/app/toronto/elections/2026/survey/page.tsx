import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DEFAULT_ELECTION_SLUG } from "@/lib/elections/registry";
import {
  CITY_PRIORITIES_SLUG,
  fetchSurvey,
  type Survey,
} from "@/lib/elections/survey";

import SurveyClient from "./SurveyClient";

// The questions come from York Factory, so this page is only as available as
// that API — mitigated by the five-minute ISR cache in fetchSurvey, which keeps
// serving the last good copy through a blip. A cold cache plus an outage is a
// 404 rather than a half-rendered form: a survey with no questions is worse
// than an honest miss, and keeping a hard-coded copy here to fall back on is
// the drift this move was meant to end.
async function loadSurvey(): Promise<Survey | null> {
  try {
    return await fetchSurvey(DEFAULT_ELECTION_SLUG, CITY_PRIORITIES_SLUG);
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const survey = await loadSurvey();
  const title = survey?.meta.title ?? "Toronto Priorities Survey";
  const description =
    survey?.meta.intro ??
    "Tell us what matters most in your ward ahead of Toronto's October 26, 2026 municipal election.";

  return {
    title: `${title} — Toronto 2026`,
    description,
    alternates: { canonical: "/toronto/elections/2026/survey" },
    openGraph: {
      title: `${title} — Toronto 2026 | Build Canada`,
      description,
      type: "website",
    },
  };
}

export default async function SurveyPage() {
  const survey = await loadSurvey();
  if (!survey || survey.steps.length === 0) notFound();

  return <SurveyClient survey={survey} />;
}
