import { BillSummary } from "@/app/bills/types";
import { env } from "@/app/bills/env";

export async function getBillsFromCivicsProject(): Promise<BillSummary[]> {
  const response = await fetch(
    `${env.CIVICS_PROJECT_BASE_URL}/canada/bills/45`,
    {
      // Used only by the sitemap, which doesn't need per-request freshness.
      next: { revalidate: 3600 },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CIVICS_PROJECT_API_KEY}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch bills from API");
  }
  const { data } = await response.json();
  return Array.isArray(data) ? (data as BillSummary[]) : (data?.bills ?? []);
}
