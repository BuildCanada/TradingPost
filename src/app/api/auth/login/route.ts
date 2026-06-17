import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { oauthConfig, safeRedirectPath } from "@/lib/oauth";

export async function GET(request: NextRequest) {
  const { url, callbackUrl, clientId } = oauthConfig();

  if (!clientId) {
    return NextResponse.json({ error: "OAuth not configured" }, { status: 503 });
  }

  const state = randomBytes(16).toString("hex");
  const redirectTo = safeRedirectPath(
    request.nextUrl.searchParams.get("redirect"),
  );

  const authorizeUrl = new URL(`${url}/oauth/authorize`);
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", callbackUrl);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("state", state);

  const isSecure = process.env.NODE_ENV === "production";
  const response = NextResponse.redirect(authorizeUrl.toString());

  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });
  response.cookies.set("oauth_redirect", redirectTo, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  return response;
}
