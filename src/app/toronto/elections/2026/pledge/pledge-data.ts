import { cache } from "react";
import { API_URL } from "@/lib/api/client";
import { nameFromSlug, tokenFromSlug } from "./pledge-slug";

interface SharedPledge {
  name: string | null;
  region: string;
  pledged_at: string;
}

/* Looks a pledge up in York Factory by the share token embedded in the URL.
   Returns null for unknown tokens or if York Factory is unreachable —
   callers fall back to deriving a name from the URL itself. */
const fetchPledge = cache(async (token: string): Promise<SharedPledge | null> => {
  try {
    const res = await fetch(
      `${API_URL}/elections/toronto-2026/pledges/${token}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as SharedPledge;
  } catch {
    return null;
  }
});

/* The name a shared pledge page displays: the server-verified pledge record
   when the slug carries a share token, else the exact-case ?n= query value
   (legacy links), else the title-cased slug. */
export async function resolvePledgeName(slug: string, n?: string) {
  const token = tokenFromSlug(slug);
  if (token) {
    const pledge = await fetchPledge(token);
    if (pledge?.name) return pledge.name.slice(0, 40);
  }
  const fromQuery = n?.trim();
  if (fromQuery) return fromQuery.slice(0, 40);
  return nameFromSlug(slug);
}
