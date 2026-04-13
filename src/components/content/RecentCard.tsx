import Image from "next/image";
import Link from "next/link";
import { type ContentFeedItem, feedImage, itemHref, contentItemTarget } from "./types";
import { PlatformBadge } from "./PlatformBadge";

export function RecentCard({ item }: { item: ContentFeedItem }) {
  const href = itemHref(item);
  const img = feedImage(item);
  const hasRealImage = img && img !== "/assets/logos/logo-standard.svg";

  const inner = (
    <div className="min-h-[200px] lg:min-h-[240px] bg-dark border border-border-light relative overflow-hidden group">
      {img && (
        <Image
          src={img}
          alt={item.title || ""}
          fill
          className={
            hasRealImage
              ? "object-cover opacity-40 group-hover:opacity-30 transition-opacity"
              : "object-contain p-8 opacity-30"
          }
          unoptimized
        />
      )}
      <div className="absolute top-3 left-3 z-10">
        <PlatformBadge type={item.type} />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end p-5 lg:p-6">
        <h3 className="font-display text-[1.125rem] lg:text-[1.25rem] font-normal leading-[1.2] text-bg group-hover:text-white transition-colors line-clamp-3">
          {item.title}
        </h3>
        {item.subtitle && (
          <p className="type-default text-bg/70 mt-1.5 line-clamp-2">
            {item.subtitle}
          </p>
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
      className="block"
    >
      {inner}
    </Link>
  );
}
