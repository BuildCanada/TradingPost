import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPostHogServer } from "@/lib/posthog/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearSessionCookies,
  refreshAccessToken,
  setSessionCookies,
} from "@/lib/oauth";
import {
  EMAIL_COOKIE,
  EMAIL_PARAMS,
  STEP_2_PATH,
} from "@/app/toronto/volunteer/build-the-vote";

const FLAG = "dashboard";

// Next 16 allows a single proxy (formerly "middleware") entrypoint, so this file
// owns four unrelated concerns, dispatched by path:
//   - /dashboard/*                         → gate the section behind the `dashboard` PostHog flag
//   - /memos/*, /posts/*, /builders/*      → serve markdown to LLM agents (.md suffix or Accept header)
//   - /memos/*, /api/auth/me               → silently renew an expired OAuth session
//   - /toronto/volunteer/step-2            → move the volunteer's email out of the URL
export const config = {
  matcher: [
    "/memos/:path*",
    "/polls/:path*",
    "/posts/:path*",
    "/builders/:path*",
    "/api/auth/me",
    "/dashboard",
    "/dashboard/:path*",
    "/toronto/volunteer/step-2",
    "/toronto/volunteer/step-2/",
  ],
};

// Detail pages of these content types have a markdown representation for LLM
// agents, served by src/app/md/[...path]/route.ts. Single-segment slugs only.
const MARKDOWN_CONTENT = /^\/(memos|polls|posts|builders)\/([^/]+?)(\.md)?$/;

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.replace(/\/$/, "") === STEP_2_PATH) {
    return stripVolunteerEmail(req);
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return gateDashboard(req);
  }

  const markdown = resolveMarkdownRewrite(req);
  if (markdown) return markdown;

  if (pathname.startsWith("/memos/") || pathname === "/polls" || pathname.startsWith("/polls/") || pathname === "/api/auth/me") {
    return renewSession(req);
  }
  return NextResponse.next();
}

// CJPAC's step 1 form sends volunteers to step 2 with their email in the query
// string, so step 2's hidden email field can tie the two submissions together.
// Left there, every analytics tag and pixel in the root layout would record it
// with the page URL. So before any HTML is served, the email moves into a
// short-lived cookie scoped to this one page, and the browser is sent to the
// same URL without it. Other parameters (utm_*) survive the hop.
function stripVolunteerEmail(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  const email = EMAIL_PARAMS.map((p) => url.searchParams.get(p)).find(Boolean);
  if (!email) return NextResponse.next();

  for (const p of EMAIL_PARAMS) url.searchParams.delete(p);
  const response = NextResponse.redirect(url, 303);
  response.cookies.set(EMAIL_COOKIE, email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: STEP_2_PATH,
    maxAge: 60 * 30,
  });
  // The redirect itself carries the email in its request URL; keep it out of
  // any shared cache.
  response.headers.set("Cache-Control", "no-store");
  return response;
}

// Rewrites both public markdown shapes to the internal /md route:
//   /memos/foo.md                                  → /md/memos/foo
//   /memos/foo + `Accept: text/markdown` header    → /md/memos/foo
//
// Caching note: the markdown responses emit `Vary: Accept`, but Next owns the
// Vary header on HTML page routes and drops any Accept we append (verified on
// `next start`), so the HTML variant can't advertise the negotiation. In
// practice this is safe: spec-compliant caches key the markdown responses on
// Accept, and caches that ignore Vary (e.g. Cloudflare's free tier) don't
// cache text/html by default. The explicit .md URL is the canonical
// mechanism; Accept negotiation is best-effort.
function resolveMarkdownRewrite(req: NextRequest): NextResponse | null {
  const match = req.nextUrl.pathname.match(MARKDOWN_CONTENT);
  if (!match) return null;

  const [, type, slug, mdSuffix] = match;
  if (type === "polls" && ["methodology", "privacy-policy"].includes(slug)) return null;
  const wantsMarkdown =
    Boolean(mdSuffix) || (req.headers.get("accept") ?? "").includes("text/markdown");
  if (!wantsMarkdown) return null;

  return NextResponse.rewrite(new URL(`/md/${type}/${slug}`, req.url));
}

// Gate the entire /dashboard section behind the `dashboard` PostHog flag.
// Running here (before the route renders) means a disabled flag never executes
// the dashboard pages — no york_factory fetch, no RSC payload, no title leak.
async function gateDashboard(req: NextRequest) {
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

// Silently renews the session. When the short-lived access token cookie has
// expired but a refresh token is still present, exchange it for a new access
// token (and rotated refresh token). Runs only on routes that actually consume
// the token (memo pages for draft preview, and the identity proxy), never on
// static assets.
async function renewSession(request: NextRequest) {
  const hasAccess = request.cookies.has(ACCESS_TOKEN_COOKIE);
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (hasAccess || !refreshToken) return NextResponse.next();

  const tokenData = await refreshAccessToken(refreshToken);

  if (!tokenData) {
    // Refresh token is dead/revoked — clear it so we stop retrying every request.
    const response = NextResponse.next();
    clearSessionCookies(response);
    return response;
  }

  // Make the fresh token visible to the current request (so this very render /
  // API call already sees the renewed session)…
  request.cookies.set(ACCESS_TOKEN_COOKIE, tokenData.access_token);
  const response = NextResponse.next({ request: { headers: request.headers } });
  // …and persist it on the browser for subsequent requests.
  setSessionCookies(response, tokenData);
  return response;
}
