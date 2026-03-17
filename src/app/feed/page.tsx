"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface FeedItem {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  author: string | null;
  authorPhoto: string | null;
  image: string | null;
  body: string | null;
  url: string | null;
  featured: boolean;
  createdAt: string;
}

function itemHref(item: FeedItem): string | null {
  if (item.type === "BLOG") return `/feed/${item.id}`;
  return item.url || null;
}

function itemTarget(item: FeedItem): string | undefined {
  return item.type === "BLOG" ? undefined : "_blank";
}

const FILTERS = ["All", "X", "TikTok", "IG", "Substack"] as const;

const SOCIAL_TYPES = new Set(["X", "TIKTOK", "IG"]);
const SOCIAL_FALLBACK_IMAGE = "/assets/logos/Logo Standard.svg";

function feedImage(item: FeedItem): string | null {
  if (item.image) return item.image;
  if (SOCIAL_TYPES.has(item.type)) return SOCIAL_FALLBACK_IMAGE;
  return null;
}

const TYPE_MAP: Record<string, string> = {
  All: "All",
  X: "X",
  TikTok: "TIKTOK",
  IG: "IG",
  Substack: "SUBSTACK",
};

import SectionLabel from "@/components/SectionLabel";

function FeedHeader() {
  return (
    <section className="px-5 pt-[30px] pb-[34px] border-b border-[var(--color-border-light)]">
      <SectionLabel>Feed</SectionLabel>
      <h1 className="type-title mb-1">
        Builders Move Fast by Design.
      </h1>
      <p className="type-body text-[var(--color-text-secondary)]">
        Keep up with the times by following us on all socials
      </p>
    </section>
  );
}

function FilterChips({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (f: string) => void;
}) {
  return (
    <section className="px-5 pt-[20px] pb-[30px] border-b border-[var(--color-border-light)] flex gap-2 flex-wrap">
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onSelect(f)}
          className={`h-7 px-3.5 rounded-full type-label border transition-colors ${
            active === f
              ? "bg-[var(--color-dark)] text-[var(--color-bg)] border-[var(--color-dark)]"
              : "bg-transparent text-[var(--color-dark)] border-[var(--color-border-light)] hover:border-[var(--color-dark)]"
          }`}
        >
          {f}
        </button>
      ))}
    </section>
  );
}

function PlatformBadge({ type }: { type: string }) {
  const label = type === "SUBSTACK" ? "Substack" : type === "BLOG" ? "Blog" : type === "TIKTOK" ? "TikTok" : type === "IG" ? "IG" : type;
  const hasSocialIcon = ["X", "TIKTOK", "IG", "SUBSTACK", "YOUTUBE"].includes(type);
  const iconFile = type === "X" ? "Platform=X (Twitter), Color=Negative" : type === "TIKTOK" ? "Platform=TikTok, Color=Negative" : type === "IG" ? "Platform=Instagram, Color=Negative" : type === "SUBSTACK" ? "substack-icon (1)" : "Platform=YouTube, Color=Negative";
  return (
    <span className="bg-[var(--color-bg)]/80 text-[var(--color-dark)] px-1.5 py-0.5 rounded-sm flex items-center gap-1">
      {hasSocialIcon && (
        <Image
          src={`/assets/icons/${iconFile}.svg`}
          alt={type}
          width={10}
          height={10}
          className="brightness-0 opacity-70"
          unoptimized
        />
      )}
      <span className="type-label-sm">
        {label}
      </span>
    </span>
  );
}

function FeaturedPost({ item }: { item: FeedItem }) {
  const href = itemHref(item);
  const inner = (
    <div className="w-full h-[120px] bg-black rounded mb-2.5 relative overflow-hidden">
      {feedImage(item) && (
        <Image
          src={feedImage(item)!}
          alt={item.title || ""}
          fill
          className={feedImage(item) === SOCIAL_FALLBACK_IMAGE ? "object-contain p-6 opacity-80" : "object-cover opacity-60"}
        />
      )}
      <div className="absolute top-2 left-2">
        <PlatformBadge type={item.type} />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end p-3">
        <p className="text-white type-caption font-sans font-semibold leading-tight">
          {item.title}
        </p>
        {item.subtitle && (
          <p className="text-white/70 type-label-sm mt-0.5">{item.subtitle}</p>
        )}
      </div>
    </div>
  );
  if (!href) return inner;
  return (
    <Link href={href} target={itemTarget(item)} rel={item.type !== "BLOG" ? "noopener noreferrer" : undefined} className="block">
      {inner}
    </Link>
  );
}

function RecentCard({ item }: { item: FeedItem }) {
  const href = itemHref(item);
  const inner = (
    <div className="h-[90px] bg-[var(--color-border-light)] border border-[var(--color-border-light)] rounded relative overflow-hidden">
      {feedImage(item) && (
        <Image
          src={feedImage(item)!}
          alt={item.title || ""}
          fill
          className={feedImage(item) === SOCIAL_FALLBACK_IMAGE ? "object-contain p-4" : "object-cover"}
        />
      )}
      <div className="absolute top-1.5 left-1.5">
        <PlatformBadge type={item.type} />
      </div>
      <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-2">
        <p className="text-white type-label-sm font-medium leading-tight truncate">
          {item.title}
        </p>
      </div>
    </div>
  );
  if (!href) return inner;
  return (
    <Link href={href} target={itemTarget(item)} rel={item.type !== "BLOG" ? "noopener noreferrer" : undefined} className="block">
      {inner}
    </Link>
  );
}

function PostListRow({ item }: { item: FeedItem }) {
  const href = itemHref(item);
  const isSocial = item.type === "X" || item.type === "TIKTOK" || item.type === "IG";
  // For social posts, show body text as subtitle if no subtitle exists
  const displaySubtitle = item.subtitle || (isSocial && item.body) || null;

  const inner = (
    <div className="flex items-center gap-3 py-2.5 border-b border-[var(--color-border-light)] last:border-b-0">
      <div className="w-[52px] h-[52px] bg-[var(--color-border-light)] rounded shrink-0 relative overflow-hidden">
        {feedImage(item) && (
          <Image
            src={feedImage(item)!}
            alt={item.title || ""}
            fill
            className={feedImage(item) === SOCIAL_FALLBACK_IMAGE ? "object-contain p-2" : "object-cover"}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="type-caption font-sans font-medium truncate">{item.title}</p>
        {displaySubtitle && (
          <p className="type-label-sm text-[var(--color-text-secondary)] truncate">{displaySubtitle}</p>
        )}
        {item.author && !isSocial && (
          <p className="type-label-sm text-[var(--color-text-muted)] mt-0.5">{item.author}</p>
        )}
      </div>
      <span className="type-label-sm text-[var(--color-text-muted)] border border-[var(--color-border-light)] rounded px-1.5 py-0.5 shrink-0">
        {item.type}
      </span>
    </div>
  );
  if (!href) return inner;
  return (
    <Link href={href} target={itemTarget(item)} rel={item.type !== "BLOG" ? "noopener noreferrer" : undefined} className="block">
      {inner}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="px-5 py-16 text-center">
      <p className="type-caption text-[var(--color-text-muted)]">No posts yet.</p>
      <p className="type-label-sm text-[var(--color-text-muted)] mt-1">
        Add content via the CMS at /admin
      </p>
    </div>
  );
}

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/feed");
    const data: FeedItem[] = await res.json();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Featured item (CMS-selected)
  const featuredItem = items.find((i) => i.featured);

  // Recent: only BLOG and SUBSTACK, up to 4, exclude featured
  const recentItems = items
    .filter(
      (i) =>
        (i.type === "BLOG" || i.type === "SUBSTACK") &&
        i.id !== featuredItem?.id
    )
    .slice(0, 4);

  // All posts: apply filter, exclude featured and recent
  const excludeIds = new Set([
    ...(featuredItem ? [featuredItem.id] : []),
    ...recentItems.map((i) => i.id),
  ]);

  const filteredItems = items.filter((i) => {
    if (excludeIds.has(i.id)) return false;
    if (activeFilter === "All") return true;
    return i.type === TYPE_MAP[activeFilter];
  });

  if (loading) {
    return (
      <div className="px-5 py-16 text-center type-caption text-[var(--color-text-muted)]">
        Loading...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <FeedHeader />
        <EmptyState />
      </>
    );
  }

  return (
    <>
      <FeedHeader />
      <FilterChips active={activeFilter} onSelect={setActiveFilter} />

      <section className="px-5 pt-[26px] pb-[36px] border-b border-[var(--color-border-light)]">
        {/* Featured */}
        {featuredItem && (
          <>
            <SectionLabel>Featured</SectionLabel>
            <FeaturedPost item={featuredItem} />
          </>
        )}

        {/* Recent — Blog & Substack only */}
        {recentItems.length > 0 && (
          <>
            <SectionLabel>Recent</SectionLabel>
            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              {recentItems.map((item) => (
                <RecentCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}

        {/* All Posts (filtered) */}
        {filteredItems.length > 0 && (
          <>
            <SectionLabel>All Posts</SectionLabel>
            {filteredItems.map((item) => (
              <PostListRow key={item.id} item={item} />
            ))}
          </>
        )}
      </section>
    </>
  );
}
