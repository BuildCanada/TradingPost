import { env } from "@/app/bills/env";
import { CANADIAN_PARLIAMENT_NUMBER } from "@/app/bills/consts/general";
import type { BillSummary } from "@/app/bills/types";

/**
 * The Civics Project list of every bill in the current Parliament.
 *
 * Shared by the /bills list page and the refresh sweep so both see the same
 * bills. Never throws — an outage yields an empty list, and the page falls back
 * to whatever is stored.
 *
 * Unlike its siblings in `server/`, this carries no `server-only` guard: it
 * reads a public API rather than the database, and the guard would make the
 * refresh sweep impossible to run outside a Next request (`pnpm sweep:bills`).
 */
export async function getApiBills(): Promise<BillSummary[]> {
  try {
    const response = await fetch(
      `${env.CIVICS_PROJECT_BASE_URL}/canada/bills/${CANADIAN_PARLIAMENT_NUMBER}`,
      {
        // Cache for 5 minutes in production, no cache in development
        ...(process.env.NODE_ENV === "production"
          ? { next: { revalidate: 300 } }
          : { cache: "no-store" }),
        headers: {
          "Content-Type": "application/json",
          Authorization: env.CIVICS_PROJECT_API_KEY
            ? `Bearer ${env.CIVICS_PROJECT_API_KEY}`
            : "",
        },
      },
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch bills from API: ${response.status} ${response.statusText}`,
      );
    }
    const { data } = await response.json();
    return Array.isArray(data) ? (data as BillSummary[]) : (data?.bills ?? []);
  } catch (error) {
    console.error("Error fetching API bills:", error);
    return [];
  }
}
