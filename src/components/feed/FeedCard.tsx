import Link from "next/link";
import Image from "next/image";
import { type FeedItem, feedImage, itemHref, stripHtml } from "./types";
import { FeedChevron } from "./FeedChevron";

const PLATFORM_ICONS: Record<string, string> = {
  X: "platform-x-twitter",
  TIKTOK: "platform-tiktok",
  IG: "platform-instagram",
  SUBSTACK: "substack-icon",
  YOUTUBE: "platform-youtube",
};

const PLATFORM_LABELS: Record<string, string> = {
  BLOG: "Blog",
  SUBSTACK: "Substack",
  TIKTOK: "TikTok",
  IG: "IG",
};

export function FeedCard({ item }: { item: FeedItem }) {
  const iconSlug = PLATFORM_ICONS[item.type];
  const label = PLATFORM_LABELS[item.type] || item.type;

  return (
    <Link
      href={itemHref(item)}
      target={item.type !== "BLOG" ? "_blank" : undefined}
      rel={item.type !== "BLOG" ? "noopener noreferrer" : undefined}
      className="border-b border-r border-border-light flex flex-col group overflow-hidden"
    >
      <div className="relative h-[100px] bg-dark">
        {feedImage(item) && (
          <Image
            src={feedImage(item)!}
            alt={item.title || ""}
            fill
            className={
              feedImage(item) === "/assets/logos/logo-standard.svg"
                ? "object-contain p-5 opacity-80 group-hover:opacity-95 transition-opacity"
                : "object-cover opacity-70 group-hover:opacity-85 transition-opacity"
            }
          />
        )}
        {iconSlug && (
          <span className="absolute top-2 left-2 bg-bg/80 px-1.5 py-0.5 flex items-center gap-1">
            <Image
              src={`/assets/icons/${iconSlug}.svg`}
              alt={item.type}
              width={10}
              height={10}
              className="brightness-0 opacity-70"
              unoptimized
            />
            <span className="type-label-sm text-dark">{label}</span>
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2.5 flex-1">
        {item.title && (
          <h3 className="type-h4 group-hover:text-accent transition-colors line-clamp-4">
            {item.title}
          </h3>
        )}
        {item.body && (
          <p className="type-default text-text-secondary line-clamp-2">
            {stripHtml(item.body)}
          </p>
        )}
      </div>

      <div className="px-4 py-2.5 flex items-center justify-end border-t border-border-light">
        <span className="inline-flex items-center gap-2 type-label px-3 py-1 border border-dark text-dark bg-bg group-hover:bg-dark group-hover:text-bg transition-colors">
          Read more
          <FeedChevron />
        </span>
      </div>
    </Link>
  );
}
