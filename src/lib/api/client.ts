import { getAccessToken } from "@/lib/auth-token";

export const API_URL =
  process.env.YORK_FACTORY_API_URL ||
  "https://yorkfactory.buildcanada.com/api/v1";

export async function apiFetch<T>(
  path: string,
  options?: {
    revalidate?: number;
    params?: Record<string, string>;
    tags?: string[];
  },
): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  if (options?.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }

  const headers: Record<string, string> = {};
  const accessToken = getAccessToken();
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Admin (token) reads bypass the cache; public reads use ISR plus optional
  // cache tags so on-demand revalidation (e.g. a new endorsement) can target a
  // single memo via revalidateTag.
  const next: { revalidate: number; tags?: string[] } = {
    revalidate: accessToken ? 0 : (options?.revalidate ?? 60),
  };
  if (!accessToken && options?.tags && options.tags.length > 0) {
    next.tags = options.tags;
  }

  const res = await fetch(url.toString(), { headers, next });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}
