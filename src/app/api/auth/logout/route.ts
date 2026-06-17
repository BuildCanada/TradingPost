import { NextRequest, NextResponse } from "next/server";

const YF_OAUTH_URL = process.env.YF_OAUTH_URL || "http://localhost:3000";
const CLIENT_ID = process.env.YF_OAUTH_CLIENT_ID || "";
const CLIENT_SECRET = process.env.YF_OAUTH_CLIENT_SECRET || "";

export async function GET(request: NextRequest) {
  const siteUrl = new URL(request.url).origin;

  // Revoke Doorkeeper token if present
  const accessToken = request.cookies.get("yf_access_token")?.value;
  if (accessToken && CLIENT_ID && CLIENT_SECRET) {
    await fetch(`${YF_OAUTH_URL}/oauth/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        token: accessToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }).toString(),
      cache: "no-store",
    }).catch(() => {});
  }

  const response = NextResponse.redirect(`${siteUrl}/memos`);
  response.cookies.delete("yf_access_token");

  return response;
}
