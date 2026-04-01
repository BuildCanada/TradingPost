import Image from "next/image";
import Link from "next/link";
import { type ContentFeedItem, feedImage, itemHref, contentItemTarget } from "./types";
import { PlatformBadge } from "./PlatformBadge";

export function FeaturedPost({ item }: { item: ContentFeedItem }) {
  const href = itemHref(item);
  const inner = (
    <div className="w-full min-h-[160px] bg-black rounded mb-2.5 relative overflow-hidden group">
      {feedImage(item) && (
        <Image
          src={feedImage(item)!}
          alt={item.title || ""}
          fill
          className={
            feedImage(item) === "/assets/logos/logo-standard.svg"
              ? "object-contain p-6 opacity-80"
              : "object-cover opacity-40 group-hover:opacity-50 transition-opacity"
          }
        />
      )}
      <div className="absolute top-2 left-2">
        <PlatformBadge type={item.type} />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <h3 className="type-heading text-white group-hover:text-bg transition-colors">
          {item.title}
        </h3>
        {item.subtitle && (
          <p className="type-caption text-white/80 mt-1 line-clamp-2">
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
      rel={item.type !== "BLOG" ? "noopener noreferrer" : undefined}
      className="block"
    >
      {inner}
    </Link>
  );
}
