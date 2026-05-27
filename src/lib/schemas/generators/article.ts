import { stripNulls, toISO8601 } from "../utils";
import { generatePersonSchema, type PersonData } from "./person";

interface SiteConfigData {
  orgName: string;
  logoUrl?: string | null;
  siteUrl: string;
}

interface MemoData {
  title: string;
  slug: string;
  keyMessage1?: string | null;
  seoImage?: string | null;
  publishedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export function generateArticleSchema(
  memo: MemoData,
  author: PersonData,
  config: SiteConfigData
) {
  return stripNulls({
    "@type": "Article" as const,
    headline: memo.title,
    description: memo.keyMessage1,
    image: memo.seoImage,
    datePublished: toISO8601(memo.publishedAt ?? memo.createdAt),
    dateModified: toISO8601(memo.updatedAt),
    author: generatePersonSchema(author),
    publisher: stripNulls({
      "@type": "Organization" as const,
      name: config.orgName,
      logo: config.logoUrl
        ? { "@type": "ImageObject" as const, url: config.logoUrl }
        : undefined,
    }),
    mainEntityOfPage: {
      "@type": "WebPage" as const,
      "@id": `${config.siteUrl}/memos/${memo.slug}`,
    },
  });
}
