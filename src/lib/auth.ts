import { cache } from "react";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/api/client";
import { ACCESS_TOKEN_COOKIE } from "@/lib/oauth";

export interface YfUser {
  email: string;
  name: string | null;
  role: string | null;
  avatarUrl: string | null;
  admin: boolean;
}

// Reads the signed-in user's OAuth access token from the httpOnly cookie.
export async function getAccessTokenCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value;
}

// Resolves the current user from York Factory's /me endpoint using the access
// token cookie. Returns null when there's no token or the token is invalid /
// expired. React.cache dedupes this to a single /me call per server request
// (e.g. generateMetadata + the page component share one result). It is
// intentionally NOT cached across requests: /me is per-user authenticated data,
// so a shared TTL cache could serve one user's identity to another and would
// also let a revoked admin keep access until the entry expired.
export const getCurrentUser = cache(async (): Promise<YfUser | null> => {
  const token = await getAccessTokenCookie();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return {
        email: data.email,
        name: data.name ?? null,
        role: data.role ?? null,
        avatarUrl: data.avatar_url ?? null,
        admin: data.admin === true,
      };
    }

    // 401/403 means the token is genuinely invalid/expired → signed out (quiet).
    // Anything else means York Factory is unhealthy; log it so a transient
    // outage isn't silently misread as "every admin lost access."
    if (res.status !== 401 && res.status !== 403) {
      console.warn(
        `[auth] /me returned ${res.status}; treating user as signed out`,
      );
    }
    return null;
  } catch (err) {
    console.warn("[auth] /me request failed; treating user as signed out", err);
    return null;
  }
});
