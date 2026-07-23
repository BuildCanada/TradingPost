import { getAccessTokenCookie, getCurrentUser } from "@/lib/auth";
import { setAccessToken } from "@/lib/auth-token";

// Draft preview is gated on the signed-in user actually being an admin (live
// from /me), never on a baked cookie. When they are, we hand apiFetch the
// access token so it fetches drafts; otherwise the request store stays empty
// and only published content is returned. Returns the token so callers can
// branch on "preview mode" (e.g. render a draft banner or the admin 404).
export async function primeAdminPreviewToken(): Promise<string | undefined> {
  const user = await getCurrentUser();
  const token = user?.admin ? await getAccessTokenCookie() : undefined;
  setAccessToken(token);
  return token;
}

// A record is a draft when it has no publish date, or one scheduled in the
// future. The preview banner is for genuine drafts only — not every record an
// admin happens to be viewing.
export function isDraft(publishedAt: string | null | undefined): boolean {
  return !publishedAt || new Date(publishedAt) > new Date();
}
