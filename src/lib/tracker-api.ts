// Server-side fetcher for the Outcomes Tracker API.
//
// Two layouts are supported:
//
// 1. buildcanada.com (default): the Rails API is mounted under /tracker, and
//    commitments/departments use a /api/v1 prefix. Call sites pass paths like
//    "/api/v1/commitments.json" and we prepend "/tracker".
//
// 2. Standalone host (TRACKER_API_BASE set, e.g. the nelson deploy): commitments
//    and departments are served at the root (/commitments.json,
//    /departments.json) while dashboard/burndown still live under /api/*. We
//    strip the /api/v1 prefix on those two endpoints and skip the /tracker
//    prepend.
const EXPLICIT_BASE = process.env.TRACKER_API_BASE;

const API_BASE = EXPLICIT_BASE || "https://www.buildcanada.com";

function resolvePath(path: string): string {
  let p = path;
  if (p.startsWith("/tracker")) {
    p = p.slice("/tracker".length);
  }

  if (EXPLICIT_BASE) {
    // Standalone host: commitments/departments are at the root, no /api/v1.
    p = p.replace(/^\/api\/v1\/(commitments|departments)\.json/, "/$1.json");
    return p;
  }

  return `/tracker${p}`;
}

export async function fetchApi<T>(path: string): Promise<T> {
  const url = `${API_BASE}${resolvePath(path)}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`API ${res.status}: ${url}`);
  return res.json();
}
