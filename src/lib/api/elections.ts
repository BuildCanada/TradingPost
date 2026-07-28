// Elections — York Factory API client.
//
// The york_factory pipeline pulls each jurisdiction's registered-candidate
// feeds (e.g. the Toronto City Clerk's) and serves the assembled elections
// from GET /api/v1/elections (summaries) and GET /api/v1/elections/:slug
// (races + candidates). Both are fetched with ISR; callers decide what to do
// when the API is unreachable.

import { apiFetch } from "./client";
import type { YFListResponse } from "./types";

export type ApiSocialLink = { name: string; url: string };

export type ApiCandidate = {
  /** as published by the jurisdiction's clerk, "Last, First" */
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
  district_type: "at_large" | "ward" | "school_board_ward" | "riding" | "district";
  /** Lowest ward in the district (1 for "Wards 1, 5"); null when at-large.
   *  For ordering, never for display — it is not a ward number. */
  district_number: number | null;
  /** Display label for the district, e.g. "Wards 1, 5"; null when at-large. */
  district_name: string | null;
  /** Every ward the district covers, e.g. [1, 5]. Null for single-ward
   *  (Toronto-style) races, where district_number is the ward. */
  ward_numbers?: number[] | null;
  /** The body being elected to; null for mayor. Part of a race's identity:
   *  Brampton runs a city-council and a regional-council race in the same
   *  district, distinguished only by this. */
  office_body: string | null;
  candidates: ApiCandidate[];
};

export type ApiJurisdiction = { name: string; slug: string; level: string };

/** An election as it appears in the list endpoint — no races or candidates. */
export type ApiElectionSummary = {
  slug: string;
  name: string;
  kind: string;
  election_date: string;
  nomination_close_date: string | null;
  jurisdiction: ApiJurisdiction;
  updated_at?: string;
};

/** An election as it appears in the detail endpoint, with its full roster. */
export type ApiElection = ApiElectionSummary & {
  races: ApiRace[];
};

// The upstream feeds refresh daily, so hourly ISR is plenty. Next dedupes
// the fetch across the components that call this within one render.
const REVALIDATE_SECONDS = 3600;

/** Every election York Factory knows about, or an empty list when the API is
 *  unreachable. */
export async function fetchElections(): Promise<ApiElectionSummary[]> {
  try {
    const res = await apiFetch<YFListResponse<ApiElectionSummary>>("/elections", {
      revalidate: REVALIDATE_SECONDS,
    });
    return res.data;
  } catch (error) {
    console.error("[elections] list unavailable:", error);
    return [];
  }
}

/** One election with all races and candidates, or null when the API is
 *  unreachable. */
export async function fetchElection(slug: string): Promise<ApiElection | null> {
  try {
    return await apiFetch<ApiElection>(`/elections/${slug}`, {
      revalidate: REVALIDATE_SECONDS,
    });
  } catch (error) {
    console.error(`[elections] ${slug} unavailable:`, error);
    return null;
  }
}
