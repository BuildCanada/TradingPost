import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const YF_OAUTH_URL = process.env.YF_OAUTH_URL || "http://localhost:3000";
const CLIENT_ID = process.env.YF_OAUTH_CLIENT_ID || "";
const CALLBACK_URL =
  process.env.YF_OAUTH_CALLBACK_URL ||
  "http://localhost:5050/api/auth/callback";

export async function GET(request: NextRequest) {
  if (!CLIENT_ID) {
    return NextResponse.json(
      { error: "OAuth not configured" },
      { status: 503 },
    );
  }

  const state = randomBytes(16).toString("hex");
  const redirectTo =
    request.nextUrl.searchParams.get("redirect") || "/memos";

  const authorizeUrl = new URL(`${YF_OAUTH_URL}/oauth/authorize`);
  authorizeUrl.searchParams.set("client_id", CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", CALLBACK_URL);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "admin");
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
