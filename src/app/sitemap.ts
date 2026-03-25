import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://buildcanada.ca";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/memos`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/content`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // Dynamic memo pages
  const memos = await prisma.memo.findMany({
    select: { slug: true, updatedAt: true },
  });

  const memoPages: MetadataRoute.Sitemap = memos.map((m) => ({
    url: `${baseUrl}/memos/${m.slug}`,
    lastModified: m.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Dynamic feed pages (only BLOG type — others redirect externally)
  const feedItems = await prisma.feedItem.findMany({
    where: { type: "BLOG" },
    select: { id: true, updatedAt: true },
  });

  const feedPages: MetadataRoute.Sitemap = feedItems.map((f) => ({
    url: `${baseUrl}/content/${f.id}`,
    lastModified: f.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...memoPages, ...feedPages];
}
