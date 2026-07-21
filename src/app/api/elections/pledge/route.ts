import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/lib/api/client";

// "Pledge to vote" submissions — same low-friction pattern as /api/subscribe.
// Forwards {email, name, region} to York Factory, which signs the email up
// as a subscriber and records one pledge per subscriber per election
// (re-pledging just refreshes it). Region is e.g. "ward-5" for ward-scoped
// pledge buttons; defaults to the city-wide "toronto".

const ELECTION_SLUG = "toronto-2026";
const REGION_PATTERN = /^[a-z0-9-]{1,50}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, region } = body;

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

    const safeRegion =
      typeof region === "string" && REGION_PATTERN.test(region)
        ? region
        : "toronto";

    const res = await fetch(`${API_URL}/elections/${ELECTION_SLUG}/pledges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name: typeof name === "string" ? name.slice(0, 100) : undefined,
        region: safeRegion,
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
    return NextResponse.json({
      success: true,
      region: data.region,
      regionCount: data.region_count,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
