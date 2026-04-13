import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { type ContentFeedItem, feedImage, itemHref, contentItemTarget } from "./types";
import { PlatformBadge } from "./PlatformBadge";

export function FeaturedPost({ item }: { item: ContentFeedItem }) {
  const href = itemHref(item);
  const img = feedImage(item);
  const hasRealImage = img && img !== "/assets/logos/logo-standard.svg";
  const isExternal = !["BLOG", "MEMO", "BUILDER"].includes(item.type);

  const ctaArrow = isExternal ? (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
    </svg>
  ) : (
    <svg className="w-4 h-4 transition-all group-hover/cta:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  const inner = (
    <div className="flex flex-col justify-end group relative overflow-hidden min-h-[320px] lg:min-h-[400px] border border-border-light">
      <div className="absolute inset-0 bg-dark">
        {img && (
          <Image
            src={img}
            alt=""
            fill
            className={cn(
              "object-cover transition-opacity duration-500",
              hasRealImage
                ? "opacity-40 group-hover:opacity-25"
                : "object-contain p-12 opacity-20"
            )}
            unoptimized
          />
        )}
      </div>
      <div className="absolute top-3 left-3 z-10">
        <PlatformBadge type={item.type} />
      </div>
      <div className="relative z-10 flex flex-col">
        <div className="p-8 lg:p-12 flex flex-col gap-4">
          <h3 className="font-display text-[1.75rem] lg:text-[2.25rem] font-normal leading-[1.15] text-bg group-hover:text-white transition-colors line-clamp-3">
            {item.title}
          </h3>
          {item.subtitle && (
            <p className="type-default text-bg/80 line-clamp-2 max-w-2xl">
              {item.subtitle}
            </p>
          )}
        </div>
        <div className="border-t border-white/20 px-8 lg:px-12 py-4 flex items-center gap-2 group/cta">
          <span className="font-label text-xs uppercase tracking-wider text-bg/70 transition-colors group-hover/cta:text-white">
            {isExternal ? "View Post" : "Read More"}
          </span>
          <span className="text-bg/70 transition-colors group-hover/cta:text-white">
            {ctaArrow}
          </span>
        </div>
      </div>
    </div>
  );

  if (!href) return inner;
  return (
    <Link
      href={href}
      target={contentItemTarget(item)}
      rel={contentItemTarget(item) ? "noopener noreferrer" : undefined}
      className="block"
    >
      {inner}
    </Link>
  );
}
