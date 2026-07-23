import { apiFetch } from "./client";
import type { YFPaginatedResponse } from "./types";

interface YFBuilder {
  id: number;
  slug: string;
  title: string;
  byline: string | null;
  quote: string | null;
  image_url: string | null;
}

interface YFBuilderDetail extends YFBuilder {
  body: string | null;
  author: string | null;
  published_at: string | null;
}

export interface BuilderSerialized {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  quote: string | null;
  imageUrl: string | null;
}

export interface BuilderDetailSerialized extends BuilderSerialized {
  body: string | null;
  author: string | null;
  publishedAt: string | null;
}

function stripHtml(html: string | null): string | null {
  if (!html) return null;
  return html.replace(/<[^>]*>/g, "").trim();
}

function mapBuilder(b: YFBuilder): BuilderSerialized {
  return {
    id: String(b.id),
    slug: b.slug,
    name: b.title,
    tagline: b.byline,
    quote: stripHtml(b.quote),
    imageUrl: b.image_url,
  };
}

export async function fetchBuilders(): Promise<BuilderSerialized[]> {
  const all: YFBuilder[] = [];
  let page = 1;

  while (true) {
    const res = await apiFetch<YFPaginatedResponse<YFBuilder>>("/builders", {
      params: { page: String(page) },
      revalidate: 3600,
    });
    all.push(...res.data);
    if (page >= res.pagination.pages) break;
    page++;
  }

  return all.map(mapBuilder);
}

export async function fetchBuilder(slug: string): Promise<BuilderDetailSerialized> {
  const b = await apiFetch<YFBuilderDetail>(`/builders/${slug}`, { revalidate: 300 });
  return {
    ...mapBuilder(b),
    body: b.body,
    author: stripHtml(b.author),
    publishedAt: b.published_at,
  };
}
