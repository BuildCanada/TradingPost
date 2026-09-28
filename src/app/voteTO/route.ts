import { type NextRequest, NextResponse } from "next/server";

const DESTINATION = "https://www.buildcanada.com/toronto/vote/2026/";
const CAMPAIGN_PARAMS = {
  utm_source: "direct_mail",
  utm_medium: "offline",
  utm_campaign: "voteTO",
} as const;

export function GET(request: NextRequest) {
  const destination = new URL(DESTINATION);
  destination.search = request.nextUrl.search;

  // Keep every supplied value, including custom tracking fields and repeated
  // parameters. Add attribution only when the mail URL did not supply it.
  for (const [key, value] of Object.entries(CAMPAIGN_PARAMS)) {
    if (!destination.searchParams.has(key)) {
      destination.searchParams.append(key, value);
    }
  }

  return NextResponse.redirect(destination, 307);
}
