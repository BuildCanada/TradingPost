import Image from "next/image";
import Link from "next/link";
import { PlatformIcon } from "@/components/PlatformIcon";
import {
  type ContentFeedItem,
  feedImage,
  itemHref,
  contentItemTarget,
  INVERT_ICON_ON_HOVER,
} from "./types";

const PLATFORM_HOVER_CLASSES: Record<string, string> = {
  X: "group-hover/row:border-[#000000] group-hover/row:bg-[#000000]",
  TIKTOK: "group-hover/row:border-[#00f2ea] group-hover/row:bg-[#00f2ea]",
  IG: "group-hover/row:border-[#E1306C] group-hover/row:bg-[#E1306C]",
  SUBSTACK: "group-hover/row:border-[#FF6719] group-hover/row:bg-[#FF6719]",
  YOUTUBE: "group-hover/row:border-[#FF0000] group-hover/row:bg-[#FF0000]",
  BLOG: "group-hover/row:border-[#932f2f] group-hover/row:bg-[#932f2f]",
};

export function PostListRow({ item }: { item: ContentFeedItem }) {
  const href = itemHref(item);
  const isSocial =
    item.type === "X" || item.type === "TIKTOK" || item.type === "IG";
  const SOCIAL_SUBTITLE: Record<string, string> = {
    X: "BUILD CANADA X",
    TIKTOK: "BUILD CANADA TIKTOK",
    IG: "BUILD CANADA INSTAGRAM",
  };
  const displaySubtitle = isSocial
    ? SOCIAL_SUBTITLE[item.type]
    : item.subtitle || null;
  const hoverClasses =
    PLATFORM_HOVER_CLASSES[item.type] ||
    "group-hover/row:border-[#888888] group-hover/row:bg-[#888888]";

  const inner = (
    <div className="group/row flex items-center gap-3 py-2.5 border-b border-border-light last:border-b-0 transition-colors">
      <div
        className={`w-[52px] h-[52px] rounded shrink-0 relative overflow-hidden ${
          feedImage(item) === "/assets/logos/logo-standard.svg"
            ? "bg-accent"
            : "bg-border-light"
        }`}
      >
        {feedImage(item) && (
          <Image
            src={feedImage(item)!}
            alt={item.title || ""}
            fill
            className={
              feedImage(item) === "/assets/logos/logo-standard.svg"
                ? "object-contain p-2"
                : "object-cover"
            }
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="type-caption font-display font-medium truncate transition-colors group-hover/row:text-accent">
          {item.title}
        </p>
        {displaySubtitle && (
          <p className="type-label-sm text-text-secondary truncate">
            {displaySubtitle}
          </p>
        )}
        {item.author && !isSocial && (
          <p className="type-label-sm text-text-muted mt-0.5">{item.author}</p>
        )}
      </div>
      <span
        className={`border border-border-light rounded px-1.5 py-1 shrink-0 flex items-center justify-center transition-all duration-200 ${hoverClasses}`}
      >
        <span
          className={`transition-all duration-200 brightness-0 opacity-40 group-hover/row:opacity-100 ${INVERT_ICON_ON_HOVER.has(item.type) ? "group-hover/row:invert" : ""}`}
        >
          <PlatformIcon type={item.type} size={14} />
        </span>
      </span>
    </div>
  );
  if (!href) return inner;
  return (
    <Link
      href={href}
      target={contentItemTarget(item)}
      rel={item.type !== "BLOG" ? "noopener noreferrer" : undefined}
      className="block"
    >
      {inner}
    </Link>
  );
}
