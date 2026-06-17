import { NextRequest, NextResponse } from "next/server";

const YF_OAUTH_URL = process.env.YF_OAUTH_URL || "http://localhost:3000";
const CLIENT_ID = process.env.YF_OAUTH_CLIENT_ID || "";
const CLIENT_SECRET = process.env.YF_OAUTH_CLIENT_SECRET || "";
const CALLBACK_URL =
  process.env.YF_OAUTH_CALLBACK_URL ||
  "http://localhost:5050/api/auth/callback";
const API_URL =
  process.env.YORK_FACTORY_API_URL ||
  "https://yorkfactory.buildcanada.com/api/v1";

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  refresh_token?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const siteUrl = new URL(request.url).origin;

  if (error) {
    return NextResponse.redirect(
      `${siteUrl}/?preview_error=oauth_denied`,
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${siteUrl}/?preview_error=invalid_callback`,
    );
  }

  const storedState = request.cookies.get("oauth_state")?.value;
  const redirectTo = request.cookies.get("oauth_redirect")?.value || "/memos";

  if (!storedState || state !== storedState) {
    return NextResponse.redirect(
      `${siteUrl}/?preview_error=state_mismatch`,
    );
  }

  const tokenRes = await fetch(`${YF_OAUTH_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: CALLBACK_URL,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }).toString(),
    cache: "no-store",
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      `${siteUrl}/?preview_error=token_exchange_failed`,
    );
  }

  const tokenData = (await tokenRes.json()) as TokenResponse;

  // Look up the user to learn whether they're an admin. Admin status is a
  // property of the user (surfaced by /me), not an OAuth scope — only admins
  // get draft preview. Non-admins still get a valid session (general login).
  let isAdmin = false;
  try {
    const meRes = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
      cache: "no-store",
    });
    if (meRes.ok) {
      isAdmin = (await meRes.json()).admin === true;
    }
  } catch {
    // Treat a failed lookup as non-admin; the API still enforces access server-side.
  }

  const isSecure = process.env.NODE_ENV === "production";
  const response = NextResponse.redirect(`${siteUrl}${redirectTo}`);

  response.cookies.delete("oauth_state");
  response.cookies.delete("oauth_redirect");

  const cookieOpts = {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax" as const,
    maxAge: tokenData.expires_in,
    path: "/",
  };
  response.cookies.set("yf_preview_token", tokenData.access_token, cookieOpts);
  response.cookies.set("yf_admin", String(isAdmin), cookieOpts);

  return response;
}
