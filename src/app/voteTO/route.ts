import type { NextRequest } from "next/server";
import { campaignRedirect } from "@/lib/campaign-redirect";

export function GET(request: NextRequest) {
  return campaignRedirect(request, "https://www.buildcanada.com/toronto/vote/2026/", {
    utm_source: "direct_mail",
    utm_medium: "offline",
    utm_campaign: "voteTO",
  });
}
