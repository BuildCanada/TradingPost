export const API_URL =
  process.env.YORK_FACTORY_API_URL ||
  "https://yorkfactory.buildcanada.com/api/v1";

export async function apiFetch<T>(
  path: string,
  options?: {
    revalidate?: number;
    params?: Record<string, string>;
    previewToken?: string;
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
  if (options?.previewToken) {
    headers["Authorization"] = `Bearer ${options.previewToken}`;
  }

  const res = await fetch(url.toString(), {
    headers,
    next: options?.previewToken
      ? { revalidate: 0 }
      : { revalidate: options?.revalidate ?? 60 },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}
