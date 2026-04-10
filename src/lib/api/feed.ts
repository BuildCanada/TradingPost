import { apiFetch } from "./client";
import type { YFFeedItem, YFFeedItemDetail, YFPaginatedResponse } from "./types";
import type { FeedItem } from "@/components/feed/types";
import type { ContentFeedItem } from "@/components/content/types";

function mapFeedItem(f: YFFeedItem): ContentFeedItem {
  return {
    id: String(f.id),
    type: f.item_type.toUpperCase(),
    feedableType: f.feedable_type,
    title: f.title,
    subtitle: f.subtitle,
    author: f.author,
    accountHandle: f.account_handle ?? null,
    image: f.image_url,
    body: f.body ?? null,
    url: f.url,
    slug: f.slug,
    publishedAt: f.published_at,
    createdAt: f.published_at,
    authorPhoto: f.author_photo_url ?? null,
    featured: f.featured,
  };
}

function mapFeedItemToSimple(f: YFFeedItem): FeedItem {
  return {
    id: String(f.id),
    type: f.item_type.toUpperCase(),
    feedableType: f.feedable_type,
    title: f.title,
    subtitle: f.subtitle,
    author: f.author,
    accountHandle: f.account_handle ?? null,
    image: f.image_url,
    body: f.body ?? null,
    url: f.url,
    slug: f.slug,
    authorPhoto: f.author_photo_url ?? null,
    publishedAt: f.published_at,
    createdAt: f.published_at,
  };
}

export async function fetchFeedItems(params?: {
  type?: string;
  featured?: boolean;
  page?: number;
  perPage?: number;
}): Promise<ContentFeedItem[]> {
  const queryParams: Record<string, string> = {};
  if (params?.type) queryParams.type = params.type.toLowerCase();
  if (params?.featured) queryParams.featured = "true";
  if (params?.page) queryParams.page = String(params.page);
  queryParams.per_page = String(params?.perPage ?? 100);

  const res = await apiFetch<YFPaginatedResponse<YFFeedItem>>("/feed", {
    params: queryParams,
    revalidate: 120,
  });
  return res.data.map(mapFeedItem);
}

export async function fetchFeedItemsSimple(): Promise<FeedItem[]> {
  const res = await apiFetch<YFPaginatedResponse<YFFeedItem>>("/feed", {
    params: { per_page: "100" },
    revalidate: 120,
  });
  return res.data.map(mapFeedItemToSimple);
}

export async function fetchFeedPicks(
  types: string = "x,ig,substack,memo"
): Promise<FeedItem[]> {
  const res = await apiFetch<{ data: YFFeedItem[] }>("/feed/picks", {
    params: { types },
    revalidate: 120,
  });
  return res.data.map(mapFeedItemToSimple);
}

export async function fetchFeedItem(id: string): Promise<ContentFeedItem> {
  const f = await apiFetch<YFFeedItemDetail>(`/feed/${id}`, { revalidate: 300 });
  return {
    id: String(f.id),
    type: f.item_type.toUpperCase(),
    feedableType: f.feedable_type,
    title: f.title,
    subtitle: f.subtitle,
    author: f.author,
    accountHandle: f.account_handle ?? null,
    image: f.image_url,
    body: f.body,
    url: f.url,
    slug: f.slug,
    publishedAt: f.published_at,
    createdAt: f.published_at,
    authorPhoto: f.author_photo_url,
    featured: f.featured,
  };
}
