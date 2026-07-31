import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/lib/api/client";

// Thin proxy for york_factory's public ward lookup, so the browser never needs
// the API base URL and the response can be cached at our edge.
//
// The postal code is forwarded exactly as typed: york_factory normalizes it and
// distinguishes "not a postal code" from "not in our data", which we'd lose by
// validating here.
//
// Cache-Control comes from upstream rather than being set here. The TTL varies
// by outcome on purpose — a day for a resolved ward, an hour for an unknown
// postal code (a real new code may appear in a later import), no-store for an
// upstream data outage — and second-guessing it would cache the wrong things.
export async function GET(req: NextRequest) {
  const postalCode = req.nextUrl.searchParams.get("postal_code")?.trim();

  if (!postalCode) {
    return NextResponse.json(
      { error: "postal_code is required" },
      { status: 400 },
    );
  }

  const url = new URL(`${API_URL}/geo/ward_lookup`);
  url.searchParams.set("postal_code", postalCode);

  try {
    const res = await fetch(url, { cache: "no-store" });
    const body = await res.text();

    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": res.headers.get("Cache-Control") ?? "no-store",
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
