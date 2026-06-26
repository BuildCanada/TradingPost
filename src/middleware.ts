import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearSessionCookies,
  refreshAccessToken,
  setSessionCookies,
} from "@/lib/oauth";

// Silently renews the session. When the short-lived access token cookie has
// expired but a refresh token is still present, exchange it for a new access
// token (and rotated refresh token). Runs only on routes that actually consume
// the token (memo pages for draft preview, and the identity proxy), never on
// static assets.
export async function middleware(request: NextRequest) {
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

export const config = {
  matcher: ["/memos/:path*", "/api/auth/me"],
};
