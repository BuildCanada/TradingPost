import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearSessionCookies,
  oauthConfig,
} from "@/lib/oauth";

export async function GET(request: NextRequest) {
  const { url, clientId, clientSecret } = oauthConfig();
  const siteUrl = new URL(request.url).origin;

  // Revoke both tokens server-side so logout isn't just a client-side cookie
  // drop — a leaked token shouldn't outlive the session.
  if (clientId && clientSecret) {
    const tokens = [
      request.cookies.get(ACCESS_TOKEN_COOKIE)?.value,
      request.cookies.get(REFRESH_TOKEN_COOKIE)?.value,
    ].filter(Boolean) as string[];

    await Promise.all(
      tokens.map((token) =>
        fetch(`${url}/oauth/revoke`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            token,
            client_id: clientId,
            client_secret: clientSecret,
          }).toString(),
          cache: "no-store",
        }).catch(() => {}),
      ),
    );
  }

  const response = NextResponse.redirect(`${siteUrl}/memos`);
  clearSessionCookies(response);

  return response;
}
