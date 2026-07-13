import type { MetadataRoute } from "next";
import { fetchBuilders, fetchFeedItems, fetchMemos, fetchPosts, fetchTools } from "@/lib/api";
import { fetchApi } from "@/lib/tracker-api";
import type {
  CommitmentsResponse,
  DepartmentWithMinister,
} from "@/lib/commitment-types";
import { getBillsFromCivicsProject } from "@/app/bills/server/get-all-bills-from-civics-project";
import { getAllBillsFromDB } from "@/app/bills/server/get-all-bills-from-db";
import { buildAbsoluteUrl } from "@/app/bills/utils/basePath";
import { SECTIONS as ECONOMIC_SECTIONS } from "@/app/prosperity-dashboard/indicators";

function toValidDate(value?: Date | string): Date | undefined {
  if (!value) return undefined;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://buildcanada.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/memos`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/posts`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/prosperity-dashboard`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    ...ECONOMIC_SECTIONS.map((section) => ({
      url: `${baseUrl}/prosperity-dashboard/${section.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    { url: `${baseUrl}/prosperity-dashboard/canvas`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/tracker`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/tracker/commitments`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/tracker/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/builders`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: buildAbsoluteUrl(baseUrl), lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy-notice`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const tools = await fetchTools();
  const staticUrls = new Set(staticPages.map((p) => p.url));
  const redirectedPaths = new Set(["/great-canadian-builders", "/toronto"]);
  const projectPages: MetadataRoute.Sitemap = tools
    .map((t) => {
      if (!t.externalUrl) return null;
      let path: string | null = null;
      if (t.externalUrl.startsWith("/")) {
        path = t.externalUrl;
      } else if (t.externalUrl.startsWith(baseUrl)) {
        path = t.externalUrl.slice(baseUrl.length) || "/";
      }
      if (!path) return null;
      if (redirectedPaths.has(path)) return null;
      const url = path === "/" ? baseUrl : `${baseUrl}${path}`;
      if (staticUrls.has(url)) return null;
      return {
        url,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p != null);

  const builders = await fetchBuilders();
  const builderPages: MetadataRoute.Sitemap = builders.map((b) => ({
    url: `${baseUrl}/builders/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const memos = await fetchMemos();
  const memoPages: MetadataRoute.Sitemap = memos.map((m) => ({
    url: `${baseUrl}/memos/${m.slug}`,
    lastModified: m.publishedAt ? new Date(m.publishedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const posts = await fetchPosts();
  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${baseUrl}/posts/${p.slug}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Isolated in try/catch so an outage in the tracker API can't take down
  // the whole sitemap (same defensive pattern as the bills sources below).
  const [departments, commitmentsData] = await Promise.all([
    fetchApi<DepartmentWithMinister[]>("/api/v1/departments.json").catch(
      () => [] as DepartmentWithMinister[],
    ),
    fetchApi<CommitmentsResponse>("/api/v1/commitments.json?per_page=1000").catch(
      () => ({ commitments: [], meta: { total_count: 0, page: 1, per_page: 0 } }),
    ),
  ]);

  const ministryPages: MetadataRoute.Sitemap = departments.map((d) => ({
    url: `${baseUrl}/tracker/ministries/${d.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const commitmentPages: MetadataRoute.Sitemap = commitmentsData.commitments.map((c) => ({
    url: `${baseUrl}/tracker/commitments/${c.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const feedItems = await fetchFeedItems({ type: "blog" });
  const feedPages: MetadataRoute.Sitemap = feedItems.map((f) => ({
    url: `${baseUrl}/content/${f.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Bill detail pages — the union of bills resolvable by the detail route
  // (Civics Project API ∪ MongoDB), deduped by bill id. Isolated in try/catch
  // so an outage in the bills sources can't take down the whole sitemap.
  let billPages: MetadataRoute.Sitemap = [];
  try {
    const [apiBills, dbBills] = await Promise.all([
      getBillsFromCivicsProject().catch(() => []),
      getAllBillsFromDB().catch(() => []),
    ]);

    const lastModifiedById = new Map<string, Date | undefined>();
    for (const bill of apiBills) {
      if (bill.billID) {
        lastModifiedById.set(bill.billID, toValidDate(bill.lastUpdatedOn));
      }
    }
    for (const bill of dbBills) {
      if (bill.billId && !lastModifiedById.has(bill.billId)) {
        lastModifiedById.set(bill.billId, toValidDate(bill.lastUpdatedOn));
      }
    }

    billPages = [...lastModifiedById.entries()].map(([billId, lastModified]) => ({
      url: buildAbsoluteUrl(baseUrl, billId),
      lastModified: lastModified ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    billPages = [];
  }

  return [
    ...staticPages,
    ...projectPages,
    ...ministryPages,
    ...commitmentPages,
    ...builderPages,
    ...memoPages,
    ...postPages,
    ...feedPages,
    ...billPages,
  ];
}
