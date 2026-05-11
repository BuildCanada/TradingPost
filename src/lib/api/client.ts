export const API_URL =
  process.env.YORK_FACTORY_API_URL ||
  "https://yorkfactory.buildcanada.com/api/v1";

export const API_ORIGIN = (() => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return "";
  }
})();

export async function apiFetch<T>(
  path: string,
  options?: { revalidate?: number; params?: Record<string, string>; tags?: string[] },
): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  if (options?.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }

  const next: { revalidate: number; tags?: string[] } = {
    revalidate: options?.revalidate ?? 60,
  };
  if (options?.tags && options.tags.length > 0) next.tags = options.tags;

  const res = await fetch(url.toString(), { next });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}

export interface ApiPostError extends Error {
  status: number;
  body: unknown;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  let parsed: unknown = null;
  try {
    parsed = await res.json();
  } catch {
    // non-JSON body — leave parsed as null
  }

  if (!res.ok) {
    const err = new Error(`API error ${res.status}: ${path}`) as ApiPostError;
    err.status = res.status;
    err.body = parsed;
    throw err;
  }

  return parsed as T;
}
