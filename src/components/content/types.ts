import { type FeedItem, feedImage, itemHref } from "@/components/feed/types";

export interface ContentFeedItem extends FeedItem {
  authorPhoto: string | null;
  featured: boolean;
}

export { feedImage, itemHref };

export function contentItemTarget(item: ContentFeedItem): string | undefined {
  return item.type === "BLOG" ? undefined : "_blank";
}

export const FILTERS = ["All", "Blog", "X", "TikTok", "IG", "Substack"] as const;

export const TYPE_MAP: Record<string, string> = {
  All: "All",
  Blog: "BLOG",
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
};

export const INVERT_ICON_ON_HOVER = new Set(["X", "IG"]);

export const POSTS_PER_PAGE = 10;
