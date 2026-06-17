import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const YF_OAUTH_URL = process.env.YF_OAUTH_URL || "http://localhost:3000";
const CLIENT_ID = process.env.YF_OAUTH_CLIENT_ID || "";
const CLIENT_SECRET = process.env.YF_OAUTH_CLIENT_SECRET || "";
const CALLBACK_URL =
  process.env.YF_OAUTH_CALLBACK_URL ||
  "http://localhost:5050/api/auth/callback";

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
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

  if (!tokenData.scope?.split(" ").includes("admin")) {
    return NextResponse.redirect(
      `${siteUrl}/?preview_error=insufficient_scope`,
    );
  }

  // Enable Next.js Draft Mode (sets __prerender_bypass cookie)
  (await draftMode()).enable();

  const isSecure = process.env.NODE_ENV === "production";
  const response = NextResponse.redirect(`${siteUrl}${redirectTo}`);

  response.cookies.delete("oauth_state");
  response.cookies.delete("oauth_redirect");

  response.cookies.set("yf_preview_token", tokenData.access_token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: tokenData.expires_in,
    path: "/",
  });

  return response;
}
