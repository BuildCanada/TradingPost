import { type FeedItem, feedImage, itemHref } from "@/components/feed/types";

export interface ContentFeedItem extends FeedItem {
  authorPhoto: string | null;
  featured: boolean;
}

export { feedImage, itemHref };

const INTERNAL_CONTENT_TYPES = new Set(["BLOG", "MEMO", "BUILDER"]);

export function contentItemTarget(item: ContentFeedItem): string | undefined {
  return INTERNAL_CONTENT_TYPES.has(item.type) ? undefined : "_blank";
}

export const FILTERS = ["All", "Memo", "Blog", "Builder", "X", "TikTok", "IG", "Substack"] as const;

export const TYPE_MAP: Record<string, string> = {
  All: "All",
  Memo: "MEMO",
  Blog: "BLOG",
  Builder: "BUILDER",
  X: "X",
  TikTok: "TIKTOK",
  IG: "IG",
  Substack: "SUBSTACK",
};

export const PLATFORM_HOVER_COLORS: Record<string, string> = {
  X: "#000000",
  TIKTOK: "#00f2ea",
  IG: "#E1306C",
  SUBSTACK: "#FF6719",
  YOUTUBE: "#FF0000",
  BLOG: "#932f2f",
  MEMO: "#1a1a2e",
  BUILDER: "#2d6a4f",
};

export const INVERT_ICON_ON_HOVER = new Set(["X", "IG"]);

export const POSTS_PER_PAGE = 10;
