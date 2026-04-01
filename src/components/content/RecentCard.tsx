import Image from "next/image";
import Link from "next/link";
import { type ContentFeedItem, feedImage, itemHref, contentItemTarget } from "./types";
import { PlatformBadge } from "./PlatformBadge";

export function RecentCard({ item }: { item: ContentFeedItem }) {
  const href = itemHref(item);
  const inner = (
    <div className="h-[90px] bg-border-light border border-border-light relative overflow-hidden">
      {feedImage(item) && (
        <Image
          src={feedImage(item)!}
          alt={item.title || ""}
          fill
          className={
            feedImage(item) === "/assets/logos/logo-standard.svg"
              ? "object-contain p-4"
              : "object-cover"
          }
        />
      )}
      <div className="absolute top-1.5 left-1.5">
        <PlatformBadge type={item.type} />
      </div>
      <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-2">
        <p className="text-white type-caption font-bold leading-tight line-clamp-2">
          {item.title}
        </p>
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
