export interface FeedItem {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  author: string | null;
  image: string | null;
  body: string | null;
  url: string | null;
  createdAt: string;
}

export const SOCIAL_TYPES = new Set(["X", "TIKTOK", "IG", "YOUTUBE"]);
export const SOCIAL_FALLBACK_IMAGE = "/assets/logos/logo-standard.svg";

export function isValidImage(src: string | null): boolean {
  if (!src || src === "-") return false;
  return src.startsWith("/") || src.startsWith("http");
}

export function feedImage(item: FeedItem): string | null {
  if (isValidImage(item.image)) return item.image;
  if (SOCIAL_TYPES.has(item.type)) return SOCIAL_FALLBACK_IMAGE;
  return null;
}

export function itemHref(item: FeedItem): string {
  if (item.type === "BLOG") return `/content/${item.id}`;
  return item.url || "/content";
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

export function isIGVideo(item: FeedItem): boolean {
  return !!(item.url && (item.url.includes("/reel/") || item.url.includes("/tv/")));
}

export function formatFeedDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
