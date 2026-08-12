import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/lib/api/client";
import {
  DEFAULT_ELECTION_SLUG,
  getElection,
  isSupportedElection,
} from "@/lib/elections/registry";
import { normalizePostalCode } from "@/lib/elections/postal-code";
import { forwardedHubspotContext } from "@/lib/hubspot-context";

// Resident-survey submissions — same shape as /api/elections/pledge. Forwards
// to York Factory, which signs the email up as a subscriber and records one
// response per subscriber per survey per election (re-submitting replaces the
// answers).
//
// `election` is checked against the registry before it reaches the API, so a
// client can't aim this at an arbitrary slug. The answers themselves are
// passed through untouched: the question set is York Factory's, served from
// there and rendered by the survey page, so validating question ids in this
// proxy would only add a third copy of them to keep in step. York Factory
// applies structural limits (count, key and value length) and owns the
// question ids on both sides of the round trip.

const SLUG_PATTERN = /^[a-z0-9-]{1,100}$/;
const REGION_PATTERN = /^[a-z0-9-]{1,50}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      name,
      answers,
      survey_slug,
      survey_version,
      region,
      postal_code,
      election,
    } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Answers are required" },
        { status: 400 },
      );
    }

    if (election !== undefined && !isSupportedElection(election)) {
      return NextResponse.json({ error: "Unknown election" }, { status: 400 });
    }
    const electionSlug = isSupportedElection(election)
      ? election
      : DEFAULT_ELECTION_SLUG;
    const config = getElection(electionSlug);

    if (typeof survey_slug !== "string" || !SLUG_PATTERN.test(survey_slug)) {
      return NextResponse.json(
        { error: "A survey_slug is required" },
        { status: 400 },
      );
    }

    // A malformed region is dropped rather than rejected — the ward is a
    // nice-to-have for cutting results, not worth failing a completed survey
    // over. The postal code is kept on the response so it can be re-derived.
    const safeRegion =
      typeof region === "string" && REGION_PATTERN.test(region)
        ? region
        : undefined;

    const res = await fetch(
      `${API_URL}/elections/${electionSlug}/survey_responses`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: typeof name === "string" ? name.slice(0, 100) : undefined,
          answers,
          survey_slug,
          survey_version:
            typeof survey_version === "string" ? survey_version : undefined,
          region: safeRegion,
          postal_code: normalizePostalCode(postal_code),
          ...forwardedHubspotContext(body, req),
        }),
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.errors?.[0] || "Survey submission failed" },
        { status: res.status },
      );
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      election: config.slug,
      surveySlug: data.survey_slug ?? survey_slug,
      region: data.region ?? null,
      derivedRegion: data.derived_region ?? null,
      submittedAt: data.submitted_at ?? null,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
