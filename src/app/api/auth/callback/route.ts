import { NextRequest, NextResponse } from "next/server";
import {
  oauthConfig,
  safeRedirectPath,
  setSessionCookies,
  type TokenResponse,
} from "@/lib/oauth";

export async function GET(request: NextRequest) {
  const { url, callbackUrl, clientId, clientSecret } = oauthConfig();
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Build redirects from the configured callback origin, not the inbound
  // request host. Behind the prod proxy `request.url`'s host is the internal
  // `localhost:5050`, which would send users to https://localhost:5050/...
  const siteUrl = new URL(callbackUrl).origin;

  if (error) {
    return NextResponse.redirect(`${siteUrl}/?preview_error=oauth_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${siteUrl}/?preview_error=invalid_callback`);
  }

  const storedState = request.cookies.get("oauth_state")?.value;
  const redirectTo = safeRedirectPath(
    request.cookies.get("oauth_redirect")?.value,
  );

  if (!storedState || state !== storedState) {
    return NextResponse.redirect(`${siteUrl}/?preview_error=state_mismatch`);
  }

  const tokenRes = await fetch(`${url}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
    cache: "no-store",
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      `${siteUrl}/?preview_error=token_exchange_failed`,
    );
  }

  const tokenData = (await tokenRes.json()) as TokenResponse;

  const response = NextResponse.redirect(`${siteUrl}${redirectTo}`);
  response.cookies.delete("oauth_state");
  response.cookies.delete("oauth_redirect");

  // Store the access token (+ refresh token for silent renewal). Identity and
  // admin status are resolved live from /me when needed (see lib/auth.ts) —
  // never baked into a cookie that could go stale.
  setSessionCookies(response, tokenData);

  return response;
}
