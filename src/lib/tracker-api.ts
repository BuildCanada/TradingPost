// Server-side fetcher for the Outcomes Tracker API.
//
// In production, the TradingPost Next app and the tracker Rails API share
// the buildcanada.com origin, so /tracker/api/* resolves directly. For local
// dev or preview deployments, set TRACKER_API_BASE (or the public variant)
// to override.
const API_BASE =
  process.env.TRACKER_API_BASE ||
  process.env.NEXT_PUBLIC_TRACKER_API_BASE ||
  "https://www.buildcanada.com";

export async function fetchApi<T>(path: string): Promise<T> {
  // Accept paths with or without the /tracker prefix; the API itself lives
  // under /tracker/api/* on buildcanada.com.
  let p = path;
  if (p.startsWith("/tracker")) {
    p = p.slice("/tracker".length);
  }

  const url = `${API_BASE}/tracker${p}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`API ${res.status}: ${url}`);
  return res.json();
}
