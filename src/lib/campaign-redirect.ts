import { type NextRequest, NextResponse } from "next/server";

type CampaignParams = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
};

// Redirects a printed vanity URL to its landing page, tagged with the campaign
// it came from. Keep every supplied value, including custom tracking fields and
// repeated parameters. Add attribution only when the vanity URL did not supply
// it.
export function campaignRedirect(
  request: NextRequest,
  destinationUrl: string,
  params: CampaignParams,
) {
  const destination = new URL(destinationUrl);
  destination.search = request.nextUrl.search;

  for (const [key, value] of Object.entries(params)) {
    if (!destination.searchParams.has(key)) {
      destination.searchParams.append(key, value);
    }
  }

  return NextResponse.redirect(destination, 307);
}
