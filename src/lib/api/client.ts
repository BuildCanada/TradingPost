import { draftMode, cookies } from "next/headers";

import { PREVIEW_TOKEN_COOKIE } from "./preview";

export const API_URL =
  process.env.YORK_FACTORY_API_URL ||
  "https://yorkfactory.buildcanada.com/api/v1";

async function getDraftPreviewToken(): Promise<string | undefined> {
  try {
    const draft = await draftMode();
    if (!draft.isEnabled) return undefined;
    const cookieStore = await cookies();
    return cookieStore.get(PREVIEW_TOKEN_COOKIE)?.value;
  } catch {
    return undefined;
  }
}

export async function apiFetch<T>(
  path: string,
  options?: { revalidate?: number; params?: Record<string, string> },
): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  if (options?.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }

  const previewToken = await getDraftPreviewToken();
  if (previewToken) {
    url.searchParams.set("preview_token", previewToken);
  }

  const fetchOptions: RequestInit = previewToken
    ? { cache: "no-store" }
    : { next: { revalidate: options?.revalidate ?? 60 } };

  const res = await fetch(url.toString(), fetchOptions);

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}
