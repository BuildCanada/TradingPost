import { NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";

// Resolves a required OAuth env var. In production we refuse to fall back to a
// localhost default — a missing var should fail loudly rather than silently
// send auth codes to a non-existent local callback.
function resolve(name: string, devFallback: string): string {
  const value = process.env[name];
  if (value) return value;
  if (isProd) {
    throw new Error(
      `Missing required OAuth env var ${name}; refusing to fall back to a localhost default in production.`,
    );
  }
  return devFallback;
}

export function oauthConfig() {
  return {
    url: resolve("YF_OAUTH_URL", "http://localhost:3000"),
    callbackUrl: resolve(
      "YF_OAUTH_CALLBACK_URL",
      "http://localhost:5050/api/auth/callback",
    ),
    clientId: process.env.YF_OAUTH_CLIENT_ID ?? "",
    clientSecret: process.env.YF_OAUTH_CLIENT_SECRET ?? "",
  };
}

export const ACCESS_TOKEN_COOKIE = "yf_access_token";
export const REFRESH_TOKEN_COOKIE = "yf_refresh_token";

// Refresh tokens outlive the short access token so middleware can renew the
// session silently. 30 days bounds how long an idle session can be revived.
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  refresh_token?: string;
}

// Only allow same-site, path-absolute redirects. Rejects absolute URLs and
// protocol-relative values like "//evil.com" that browsers treat as external.
export function safeRedirectPath(input: string | null | undefined): string {
  return input && /^\/(?!\/)/.test(input) ? input : "/memos";
}

// Persists session tokens as httpOnly cookies. The access token cookie expires
// with the token; the refresh token lives longer so it can renew the session.
export function setSessionCookies(
  response: NextResponse,
  tokenData: TokenResponse,
): void {
  const secure = isProd;
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokenData.access_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: tokenData.expires_in,
    path: "/",
  });
  if (tokenData.refresh_token) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, tokenData.refresh_token, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: "/",
    });
  }
}

export function clearSessionCookies(response: NextResponse): void {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
}

// Exchanges a refresh token for a fresh access token (and, with rotation, a new
// refresh token). Returns null on any failure so callers fail closed.
export async function refreshAccessToken(
  refreshToken: string,
): Promise<TokenResponse | null> {
  const { url, clientId, clientSecret } = oauthConfig();
  if (!clientId || !clientSecret) return null;

  try {
    const res = await fetch(`${url}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as TokenResponse;
  } catch {
    return null;
  }
}
