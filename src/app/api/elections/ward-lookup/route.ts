import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/lib/api/client";
import type { WardLookupResponse } from "@/lib/elections/ward-lookup";

// Thin caching proxy for york_factory's public ward lookup, so the browser never
// needs the API base URL and a postal code is only ever resolved upstream once.
//
// Caching is decided here rather than forwarded from upstream: york_factory
// currently answers every lookup `no-store`, which made each keystroke-submit a
// two-hop origin round trip for an answer that depends only on the postal code
// and changes at most once per boundary import. TTL varies by outcome — see
// CACHE_SECONDS.

/** Full postal codes only; a bare FSA can't resolve to one ward. */
const POSTAL_CODE = /^([A-Za-z]\d[A-Za-z])[\s-]*(\d[A-Za-z]\d)$/;

// Seconds to cache each outcome. Malformed input is a pure function of the
// string, so it never expires; a resolved ward holds for a day. An unrecognized
// code gets an hour, because a real new code may appear in a later import. An
// upstream data outage isn't cached at all — it's a state to retry, not an
// answer.
const CACHE_SECONDS: Record<string, number> = {
  malformed_postal_code: 31_536_000,
  resolved: 86_400,
  outside_boundary: 86_400,
  unknown_postal_code: 3_600,
  boundary_data_unavailable: 0,
};

/**
 * Canonicalize to "M4C 1S9" so spacing and casing variants of one code share a
 * cache entry. Anything that isn't a full postal code is forwarded as typed:
 * york_factory is what distinguishes "not a postal code" from "not in our
 * data", and validating here would lose that.
 */
function cacheKeyFor(typed: string): string {
  const match = typed.match(POSTAL_CODE);
  return match ? `${match[1]} ${match[2]}`.toUpperCase() : typed;
}

export async function GET(req: NextRequest) {
  const postalCode = req.nextUrl.searchParams.get("postal_code")?.trim();

  if (!postalCode) {
    return NextResponse.json(
      { error: "postal_code is required" },
      { status: 400 },
    );
  }

  const url = new URL(`${API_URL}/geo/ward_lookup`);
  url.searchParams.set("postal_code", cacheKeyFor(postalCode));

  try {
    // Next's data cache keys on the URL, so the second visitor to type a given
    // postal code is served without touching york_factory even if the CDN in
    // front of us missed. Held for the longest TTL any outcome uses; the
    // Cache-Control below is what actually shortens the volatile ones.
    const res = await fetch(url, { next: { revalidate: 86_400 } });
    const body = await res.text();

    let maxAge = 0;
    if (res.ok) {
      try {
        const reason = (JSON.parse(body) as WardLookupResponse).reason;
        maxAge = CACHE_SECONDS[reason] ?? 0;
      } catch {
        // An unparseable 200 is an upstream problem, not an answer to keep.
      }
    }

    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": maxAge
          ? `public, max-age=60, s-maxage=${maxAge}, stale-while-revalidate=${maxAge}`
          : "no-store",
      },
    });
  } catch (error) {
    // A network failure reaching york_factory is ours, not a lookup outcome, so
    // it stays a 5xx rather than borrowing the boundary_data_unavailable reason.
    console.error("[ward-lookup] upstream unreachable:", error);
    return NextResponse.json(
      { error: "Ward lookup is unavailable" },
      { status: 502 },
    );
  }
}
