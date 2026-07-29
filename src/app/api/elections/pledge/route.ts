import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/lib/api/client";
import {
  DEFAULT_ELECTION_SLUG,
  getElection,
  isSupportedElection,
  SUPPORTED_ELECTIONS,
} from "@/lib/elections/registry";
import { forwardedHubspotContext } from "@/lib/hubspot-context";

// "Pledge to vote" submissions — same low-friction pattern as /api/subscribe.
// Forwards {email, name, region, postal_code} to York Factory, which signs the
// email up as a subscriber and records one pledge per subscriber per election
// (re-pledging just refreshes it).
//
// `election` picks the election to pledge in and is checked against the
// registry before it reaches the API, so a client can't aim this at an
// arbitrary slug. Region is e.g. "ward-5" for ward-scoped pledge buttons and
// defaults to the election's jurisdiction ("toronto", "brampton", …).
//
// `election: "broad"` is the Canada-wide pledge from pages aimed at no single
// election. York Factory only records pledges per election, and it is the
// authority on who lives where — so we submit to each supported election in
// turn and keep the first that records a pledge. A pledger outside every
// supported jurisdiction is still subscribed by the first attempt; that comes
// back as success (election: null) rather than the outside-region bounce.

const REGION_PATTERN = /^[a-z0-9-]{1,50}$/;
const POSTAL_PATTERN = /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/;

// "M5V1A1" / "m5v 1a1" → "M5V 1A1"; anything malformed is dropped rather
// than stored dirty
function normalizePostalCode(raw: unknown): string | undefined {
  if (typeof raw !== "string" || !POSTAL_PATTERN.test(raw.trim())) {
    return undefined;
  }
  const compact = raw.trim().toUpperCase().replace(" ", "");
  return `${compact.slice(0, 3)} ${compact.slice(3)}`;
}

// The broad flow: try every supported election until one records a pledge.
// Jurisdictions are disjoint, so at most one will. Upstream upserts the same
// subscriber on each attempt, so the extra calls are idempotent.
async function broadPledge(
  body: Record<string, unknown>,
  req: NextRequest,
): Promise<NextResponse> {
  const { email, name, postal_code } = body;
  let firstError: { status: number; error: string } | null = null;
  let subscribedName: string | null = null;
  let subscribed = false;

  for (const config of Object.values(SUPPORTED_ELECTIONS)) {
    const res = await fetch(`${API_URL}/elections/${config.slug}/pledges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name: typeof name === "string" ? name.slice(0, 100) : undefined,
        region: config.jurisdictionSlug,
        postal_code: normalizePostalCode(postal_code),
        ...forwardedHubspotContext(body, req),
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      firstError ??= {
        status: res.status,
        error: errorData.errors?.[0] || "Pledge failed",
      };
      continue;
    }

    const data = await res.json();

    // Outside this jurisdiction (or the postal code couldn't be judged
    // against it) — the subscriber was still kept; try the next election.
    if (data.outside_region || data.outside_toronto) {
      subscribed = true;
      subscribedName ??= data.name ?? null;
      continue;
    }

    return NextResponse.json({
      success: true,
      election: config.slug,
      region: data.region,
      regionCount: data.region_count,
      shareToken: data.share_token ?? null,
      name: data.name ?? null,
    });
  }

  // No supported election matched. If any attempt at least subscribed them,
  // that's a broad-pledge success; otherwise report the first upstream error.
  if (subscribed) {
    return NextResponse.json({
      success: true,
      election: null,
      subscribed: true,
      name: subscribedName,
    });
  }
  return NextResponse.json(
    { error: firstError?.error ?? "Pledge failed" },
    { status: firstError?.status ?? 502 },
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, region, postal_code, election } = body;

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

    if (election === "broad") {
      return broadPledge(body, req);
    }

    // An omitted election means the Toronto flow, which shipped before this
    // was parameterized. A named one we don't support is a client error, not
    // something to quietly record as a Toronto pledge.
    if (election !== undefined && !isSupportedElection(election)) {
      return NextResponse.json({ error: "Unknown election" }, { status: 400 });
    }
    const electionSlug = isSupportedElection(election)
      ? election
      : DEFAULT_ELECTION_SLUG;
    const config = getElection(electionSlug);

    const safeRegion =
      typeof region === "string" && REGION_PATTERN.test(region)
        ? region
        : config.jurisdictionSlug;

    const res = await fetch(`${API_URL}/elections/${electionSlug}/pledges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name: typeof name === "string" ? name.slice(0, 100) : undefined,
        region: safeRegion,
        postal_code: normalizePostalCode(postal_code),
        ...forwardedHubspotContext(body, req),
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.errors?.[0] || "Pledge failed" },
        { status: res.status },
      );
    }

    const data = await res.json();

    // Outside the jurisdiction holding this election: York Factory kept the
    // newsletter subscriber but recorded no pledge. Tell the client to explain
    // and redirect them to explore, rather than to a (non-existent) shareable
    // pledge page. `outside_toronto` is the older field name, still sent for
    // Toronto — accept either so this works against both API versions.
    if (data.outside_region || data.outside_toronto) {
      return NextResponse.json({
        outsideRegion: true,
        // Retained for any client still reading the Toronto-specific flag.
        outsideToronto: Boolean(data.outside_toronto),
        regionName: data.region_name ?? config.regionLabel,
        // True when the postal code couldn't be judged (malformed, or not in
        // our postal table) rather than judged to be outside — the client asks
        // them to check what they typed instead of turning them away.
        unverifiedPostalCode: Boolean(data.unverified_postal_code),
        reason: data.reason ?? null,
        subscribed: data.subscribed ?? true,
        name: data.name ?? null,
      });
    }

    return NextResponse.json({
      success: true,
      region: data.region,
      regionCount: data.region_count,
      shareToken: data.share_token ?? null,
      name: data.name ?? null,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
