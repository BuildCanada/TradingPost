import { cache } from "react";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/api/client";

export const ACCESS_TOKEN_COOKIE = "yf_access_token";

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
    if (!res.ok) return null;

    const data = await res.json();
    return {
      email: data.email,
      name: data.name ?? null,
      role: data.role ?? null,
      avatarUrl: data.avatar_url ?? null,
      admin: data.admin === true,
    };
  } catch {
    return null;
  }
});
