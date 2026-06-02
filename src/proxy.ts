import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPostHogServer } from "@/lib/posthog/server";

const FLAG = "dashboard";

// Gate the entire /dashboard section behind the `dashboard` PostHog flag.
// Running here (before the route renders) means a disabled flag never executes
// the dashboard pages — no york_factory fetch, no RSC payload, no title leak.
export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};

export async function proxy(req: NextRequest) {
  const posthog = getPostHogServer();

  // PostHog not configured (e.g. local dev without a token) → gate is open.
  if (!posthog) return NextResponse.next();

  const token = process.env.NEXT_PUBLIC_POSTHOG_TOKEN as string;
  const raw = req.cookies.get(`ph_${token}_posthog`)?.value;
  let distinctId: string | undefined;
  if (raw) {
    try {
      distinctId = JSON.parse(raw).distinct_id;
    } catch {
      // ignore malformed cookie
    }
  }
  // Throwaway id for cookieless visitors so "release to everyone" flags pass.
  // (Percentage rollouts need a stable id and can't be evaluated cookieless.)
  distinctId ||= randomUUID();

  const flags = await posthog.evaluateFlags(distinctId, { flagKeys: [FLAG] });
  if (flags.isEnabled(FLAG)) return NextResponse.next();

  // Flag off → render the app's not-found page (404) without touching the
  // dashboard routes. Rewriting to an unmatched path keeps the URL as-is.
  return NextResponse.rewrite(new URL("/dashboard-unavailable-404", req.url));
}
