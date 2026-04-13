import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PlatformIcon, platformLabel } from "@/components/PlatformIcon";
import {
  type ContentFeedItem,
  feedImage,
  itemHref,
  contentItemTarget,
} from "./types";

const PLATFORM_HOVER_CLASSES: Record<string, string> = {
  X: "group-hover/card:border-[#000000] group-hover/card:bg-[#000000]",
  TIKTOK: "group-hover/card:border-[#00f2ea] group-hover/card:bg-[#00f2ea]",
  IG: "group-hover/card:border-[#E1306C] group-hover/card:bg-[#E1306C]",
  SUBSTACK: "group-hover/card:border-[#FF6719] group-hover/card:bg-[#FF6719]",
  YOUTUBE: "group-hover/card:border-[#FF0000] group-hover/card:bg-[#FF0000]",
  BLOG: "group-hover/card:border-[#932f2f] group-hover/card:bg-[#932f2f]",
  MEMO: "group-hover/card:border-[#1a1a2e] group-hover/card:bg-[#1a1a2e]",
  BUILDER: "group-hover/card:border-[#2d6a4f] group-hover/card:bg-[#2d6a4f]",
};

const isExternal = (item: ContentFeedItem) =>
  item.type === "X" || item.type === "TIKTOK" || item.type === "IG" || item.type === "SUBSTACK" || item.type === "YOUTUBE";

export function PostListRow({ item, gridItem = false }: { item: ContentFeedItem; gridItem?: boolean }) {
  const href = itemHref(item);
  const external = isExternal(item);
  const img = feedImage(item);
  const hasRealImage = img && img !== "/assets/logos/logo-standard.svg";
  const hoverClasses =
    PLATFORM_HOVER_CLASSES[item.type] ||
    "group-hover/card:border-[#888888] group-hover/card:bg-[#888888]";

  const imageBlock = hasRealImage ? (
    <div className="relative w-full h-40 bg-border-light overflow-hidden">
      <Image
        src={img!}
        alt={item.title || ""}
        fill
        className="object-cover transition-opacity duration-300 group-hover/card:opacity-80"
      />
    </div>
  ) : img ? (
    <div className="relative w-full h-40 bg-accent flex items-center justify-center">
      <Image
        src={img}
        alt=""
        width={48}
        height={48}
        className="object-contain opacity-60"
        unoptimized
      />
    </div>
  ) : null;

  const ctaLabel = external ? `View on ${platformLabel(item.type)}` : "Read More";
  const ctaArrow = external ? (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
    </svg>
  ) : (
    <svg className="w-4 h-4 transition-all group-hover/cta:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  const inner = (
    <div className={cn(
      "flex flex-col group/card h-full",
      gridItem ? "border-b border-r border-l border-border-light" : "border border-border-light"
    )}>
      {imageBlock}
      <div className="p-6 lg:p-8 flex flex-col gap-3 flex-1">
        <div className="min-w-0">
          <h3 className="font-display text-[1.125rem] lg:text-[1.25rem] font-normal leading-[1.2] tracking-normal group-hover/card:text-accent transition-colors line-clamp-2">
            {item.title}
          </h3>
          {item.subtitle && (
            <p className="type-default text-text-secondary mt-2 line-clamp-2">
              {item.subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 mt-auto">
          {item.authorPhoto && !external && (
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-border-light overflow-hidden shrink-0">
              <Image
                src={item.authorPhoto}
                alt={item.author || ""}
                width={48}
                height={48}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
          )}
          <div className="flex items-center gap-2 min-w-0">
            {item.author && !external && (
              <p className="font-display text-[0.875rem] lg:text-[1rem] font-normal leading-[1.4] truncate">
                {item.author}
              </p>
            )}
            <span
              className={cn(
                "border border-border-light px-1.5 py-1 shrink-0 flex items-center justify-center transition-all duration-200",
                hoverClasses
              )}
            >
              <span className="text-dark/40 transition-all duration-200 group-hover/card:text-white">
                <PlatformIcon type={item.type} size={12} />
              </span>
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-border-light px-8 lg:px-10 py-4 flex items-center gap-2 group/cta">
        <span className="font-label text-xs uppercase tracking-wider text-text-secondary transition-colors group-hover/cta:text-accent">
          {ctaLabel}
        </span>
        {ctaArrow && (
          <span className="text-text-secondary transition-colors group-hover/cta:text-accent">
            {ctaArrow}
          </span>
        )}
      </div>
    </div>
  );

  if (!href) return inner;
  return (
    <Link
      href={href}
      target={contentItemTarget(item)}
      rel={contentItemTarget(item) ? "noopener noreferrer" : undefined}
      className="block h-full"
    >
      {inner}
    </Link>
  );
}
