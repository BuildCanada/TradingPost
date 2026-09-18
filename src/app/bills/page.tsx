import { BillSummary } from "./types";
import BillExplorer from "./BillExplorer";
import { getAllBillsFromDB } from "@/app/bills/server/get-all-bills-from-db";
import { getApiBills } from "@/app/bills/server/get-api-bills";
import { mergeBillLists } from "@/app/bills/utils/merge-bill";
import { fromBuildCanadaDbBill } from "@/app/bills/utils/billConverters";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { env } from "@/app/bills/env";
import { buildRelativePath } from "@/app/bills/utils/basePath";
import { BUILD_CANADA_TWITTER_HANDLE, PROJECT_NAME } from "@/app/bills/consts/general";
import FAQModalTrigger from "./FAQModalTrigger";
import { PageHeader } from "@/components/ui/page-header";

type HomeSearchParams = { cache?: string };

// Force runtime generation (avoid build-time pre-render) and cache in-memory.
export const dynamic = "auto";
// Next.js requires route segment configs to be literal values (not imported constants)
export const revalidate = 120; // seconds - cache page data

export async function generateMetadata(): Promise<Metadata> {
  const title = "Home";
  const description =
    "Understand Canadian federal bills with builder-first analysis.";
  const h = headers();
  const headerList = await h;
  const host =
    headerList.get("x-forwarded-host") || headerList.get("host") || "";
  const proto = (headerList.get("x-forwarded-proto") || "https").split(",")[0];
  const baseUrl =
    env.NEXT_PUBLIC_APP_URL ||
    (host ? `${proto}://${host}` : "http://localhost:3000");
  const pagePath = buildRelativePath();
  const pageUrl = `${baseUrl}${pagePath}`;
  const ogPath = buildRelativePath("opengraph-image");
  const ogImageUrl = `${baseUrl}${ogPath}`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: PROJECT_NAME,
      description,
      url: pageUrl,
      siteName: PROJECT_NAME,
      type: "website",
      images: [
        { url: ogImageUrl, width: 1200, height: 630, alt: PROJECT_NAME },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: PROJECT_NAME,
      description,
      creator: BUILD_CANADA_TWITTER_HANDLE,
      site: BUILD_CANADA_TWITTER_HANDLE,
      images: [ogImageUrl],
    },
    other: {
      "twitter:card": "summary_large_image",
      "twitter:title": PROJECT_NAME,
      "twitter:description": description,
      "twitter:image": ogImageUrl,
      "twitter:image:alt": PROJECT_NAME,
      "twitter:creator": BUILD_CANADA_TWITTER_HANDLE,
      "twitter:site": BUILD_CANADA_TWITTER_HANDLE,
      "twitter:url": pageUrl,
    },
  };
}

const shouldUseLocalCache = process.env.NODE_ENV === "production";
let mergedBillsCache: { data: BillSummary[]; expiresAt: number } | null = null;

async function getMergedBills(): Promise<BillSummary[]> {
  const uri = env.MONGO_URI || "";
  const hasValidMongoUri =
    uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://");
  // The API and DB reads are independent — run them concurrently instead of
  // waterfalling so page latency is the slower of the two, not the sum.
  const [apiBills, dbBills] = await Promise.all([
    getApiBills(),
    hasValidMongoUri ? getAllBillsFromDB() : Promise.resolve([]),
  ]);

  return mergeBillLists(apiBills, dbBills.map(fromBuildCanadaDbBill));
}

function clearMergedBillsCache(): void {
  mergedBillsCache = null;
}

async function getMergedBillsCached(): Promise<BillSummary[]> {
  if (!shouldUseLocalCache) {
    // Avoid stale data while iterating locally; always hit the backing store.
    mergedBillsCache = null;
    return getMergedBills();
  }

  const now = Date.now();
  const ttlMs = 300 * 1000; // 5 minutes
  if (mergedBillsCache && mergedBillsCache.expiresAt > now) {
    return mergedBillsCache.data;
  }
  const data = await getMergedBills();
  mergedBillsCache = { data, expiresAt: now + ttlMs };
  return data;
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<HomeSearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  if (resolvedSearchParams?.cache === "clear") {
    clearMergedBillsCache(); // Allow manual cache busting with ?cache=clear
  }
  const bills = await getMergedBillsCached();
  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      <PageHeader
        title={<>Bills &mdash; The 45th Parliament</>}
        description="Every federal bill before the House and the Senate, summarized and weighed against a pro-growth standard."
        action={<FAQModalTrigger />}
      />
      <BillExplorer bills={bills} />
    </div>
  );
}
