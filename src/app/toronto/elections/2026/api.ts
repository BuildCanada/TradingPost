// Toronto 2026 election — York Factory API client.
//
// The york_factory pipeline pulls the City Clerk's registered-candidate JSON
// feeds daily and serves the assembled election (races + candidates) from
// GET /api/v1/elections/toronto-2026. This module fetches it with ISR;
// callers fall back to the hand-maintained data in ./candidates when the API
// is unreachable.

import { apiFetch } from "@/lib/api/client";

export type ApiSocialLink = { name: string; url: string };

export type ApiCandidate = {
  /** as published by the City Clerk, "Last, First" */
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  status: "active" | "withdrawn";
  nomination_date: string | null;
  withdrawn_date: string | null;
  website: string | null;
  social_links: ApiSocialLink[];
  /** admin-reviewed portrait served from York Factory storage */
  photo_url: string | null;
  photo_attribution: string | null;
};

export type ApiRace = {
  office_type: "mayor" | "councillor" | "trustee" | "mp" | "mpp";
  district_type: string;
  district_number: number | null;
  district_name: string | null;
  office_body: string | null;
  candidates: ApiCandidate[];
};

export type ApiElection = {
  slug: string;
  name: string;
  kind: string;
  election_date: string;
  nomination_close_date: string | null;
  jurisdiction: { name: string; slug: string; level: string };
  races: ApiRace[];
};

const ELECTION_SLUG = "toronto-2026";
// The upstream feeds refresh daily, so hourly ISR is plenty. Next dedupes
// the fetch across the components that call this within one render.
const REVALIDATE_SECONDS = 3600;

/**
 * The toronto-2026 election with all races and candidates, or null when the
 * API is unreachable.
 */
export async function fetchToronto2026(): Promise<ApiElection | null> {
  try {
    return await apiFetch<ApiElection>(`/elections/${ELECTION_SLUG}`, {
      revalidate: REVALIDATE_SECONDS,
    });
  } catch (error) {
    console.error("[elections] API unavailable, using local candidate data:", error);
    return null;
  }
}
