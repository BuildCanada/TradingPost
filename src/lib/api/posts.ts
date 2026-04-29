import { apiFetch } from "./client";
import type { YFPaginatedResponse, YFPost, YFPostDetail } from "./types";
import type { MemoItem } from "@/app/memos/types";

export interface PostDetail {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  seoImage: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function mapPost(p: YFPost): MemoItem {
  return {
    id: String(p.id),
    title: p.title,
    slug: p.slug,
    author: null,
    keyMessage1: p.summary,
    keyMessage2: null,
    keyMessage3: null,
    splashImage: null,
    seoImage: p.seo_image_url,
    category: "post",
    featured: false,
    publishedAt: p.published_at,
    createdAt: p.published_at ?? new Date().toISOString(),
  };
}

export async function fetchPosts(): Promise<MemoItem[]> {
  const all: YFPost[] = [];
  let page = 1;

  while (true) {
    const res = await apiFetch<YFPaginatedResponse<YFPost>>("/posts", {
      params: { page: String(page) },
      revalidate: 60,
    });
    all.push(...res.data);
    if (page >= res.pagination.pages) break;
    page++;
  }

  return all.map(mapPost);
}

export async function fetchPost(slug: string): Promise<PostDetail> {
  const p = await apiFetch<YFPostDetail>(`/posts/${slug}`, { revalidate: 300 });
  return {
    id: String(p.id),
    title: p.title,
    slug: p.slug,
    summary: p.summary,
    body: p.body,
    seoImage: p.seo_image_url,
    publishedAt: p.published_at,
    createdAt: p.published_at ?? new Date().toISOString(),
    updatedAt: p.published_at ?? new Date().toISOString(),
  };
}
