import type { MetadataRoute } from "next";
import { fetchBuilders, fetchFeedItems, fetchMemos, fetchTools } from "@/lib/api";
import { fetchApi } from "@/lib/tracker-api";
import type {
  CommitmentsResponse,
  DepartmentWithMinister,
} from "@/lib/commitment-types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://buildcanada.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/memos`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/tracker`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/tracker/commitments`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/tracker/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/builders`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
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

  const [departments, commitmentsData] = await Promise.all([
    fetchApi<DepartmentWithMinister[]>("/api/v1/departments.json"),
    fetchApi<CommitmentsResponse>("/api/v1/commitments.json?per_page=1000"),
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

  return [
    ...staticPages,
    ...projectPages,
    ...ministryPages,
    ...commitmentPages,
    ...builderPages,
    ...memoPages,
    ...feedPages,
  ];
}
