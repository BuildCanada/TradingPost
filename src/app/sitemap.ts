import type { MetadataRoute } from "next";
import { fetchBuilders, fetchFeedItems, fetchMemos } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://buildcanada.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/memos`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/content`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/builders`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy-notice`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

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

  const feedItems = await fetchFeedItems({ type: "blog" });
  const feedPages: MetadataRoute.Sitemap = feedItems.map((f) => ({
    url: `${baseUrl}/content/${f.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...builderPages, ...memoPages, ...feedPages];
}
