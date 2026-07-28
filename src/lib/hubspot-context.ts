import type { NextRequest } from "next/server";

/* Signup context forwarded to York Factory, which passes it to HubSpot's
   Forms API (pageUri/pageName/hutk/ipAddress) so submissions attribute to
   the page and visitor. */

/** Capture the current page + HubSpot tracking cookie. Client components only. */
export function hubspotPageContext() {
  return {
    page_uri: window.location.href,
    page_name: document.title,
    hubspot_utk: document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/)?.[1],
  };
}

/** Sanitize the client-captured context and add the caller's IP. Server routes only. */
export function forwardedHubspotContext(
  body: Record<string, unknown>,
  req: NextRequest,
) {
  const str = (v: unknown, max: number) =>
    typeof v === "string" && v.length > 0 ? v.slice(0, max) : undefined;

  return {
    page_uri: str(body.page_uri, 2048),
    page_name: str(body.page_name, 512),
    hubspot_utk: str(body.hubspot_utk, 128),
    ip_address:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
  };
}
