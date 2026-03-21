"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlatformIcon } from "@/components/PlatformIcon";

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

const FILTERS = ["All", "Blog", "X", "TikTok", "IG", "Substack"] as const;

const SOCIAL_TYPES = new Set(["X", "TIKTOK", "IG"]);
const SOCIAL_FALLBACK_IMAGE = "/assets/logos/logo-standard.svg";

function feedImage(item: FeedItem): string | null {
  if (item.image) return item.image;
  if (SOCIAL_TYPES.has(item.type)) return SOCIAL_FALLBACK_IMAGE;
  return null;
}

const TYPE_MAP: Record<string, string> = {
  All: "All",
  Blog: "BLOG",
  X: "X",
  TikTok: "TIKTOK",
  IG: "IG",
  Substack: "SUBSTACK",
};

import SectionLabel from "@/components/SectionLabel";

function FeedHeader() {
  return (
    <section className="relative px-5 border-b border-[var(--color-border-light)] overflow-hidden">
      <Image
        src="/assets/images/build-canada-community-meetup.webp"
        alt="Audience at a Build Canada community meetup event"
        fill
        className="object-cover brightness-[0.35]"
        priority
      />
      <div className="relative max-w-[1080px] mx-auto py-[60px] md:pt-[140px] md:pb-[80px] lg:pt-[180px]">
        <SectionLabel className="text-white/60">Feed</SectionLabel>
        <h1 className="type-title mb-1 text-white">
          Builders Move Fast by Design.
        </h1>
        <p className="type-body text-white/70">
          Don&apos;t miss a beat. Check out Build Canada content below or follow us on your preferred socials channel.
        </p>
      </div>
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
    <section className="px-5 pt-[20px] pb-[30px] border-b border-[var(--color-border-light)]">
      <div className="max-w-[1080px] mx-auto flex gap-2 flex-wrap">
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
      </div>
    </section>
  );
}

function PlatformBadge({ type }: { type: string }) {
  const label = type === "SUBSTACK" ? "Substack" : type === "BLOG" ? "Blog" : type === "TIKTOK" ? "TikTok" : type === "IG" ? "IG" : type;
  const hasSocialIcon = ["X", "TIKTOK", "IG", "SUBSTACK", "YOUTUBE"].includes(type);
  const iconFile = type === "X" ? "platform-x-twitter" : type === "TIKTOK" ? "platform-tiktok" : type === "IG" ? "platform-instagram" : type === "SUBSTACK" ? "substack-icon" : "platform-youtube";
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
    <div className="w-full min-h-[160px] bg-black rounded mb-2.5 relative overflow-hidden group">
      {feedImage(item) && (
        <Image
          src={feedImage(item)!}
          alt={item.title || ""}
          fill
          className={feedImage(item) === SOCIAL_FALLBACK_IMAGE ? "object-contain p-6 opacity-80" : "object-cover opacity-40 group-hover:opacity-50 transition-opacity"}
        />
      )}
      <div className="absolute top-2 left-2">
        <PlatformBadge type={item.type} />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <h3 className="type-heading text-white group-hover:text-[var(--color-bg)] transition-colors">
          {item.title}
        </h3>
        {item.subtitle && (
          <p className="type-caption text-white/80 mt-1 line-clamp-2">{item.subtitle}</p>
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
        <p className="text-white type-caption font-bold leading-tight line-clamp-2">
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

const PLATFORM_HOVER_COLORS: Record<string, string> = {
  X: "#000000",
  TIKTOK: "#00f2ea",
  IG: "#E1306C",
  SUBSTACK: "#FF6719",
  YOUTUBE: "#FF0000",
  BLOG: "var(--color-accent)",
};

// Platforms whose icons should invert to white on the colored hover background
const INVERT_ICON_ON_HOVER = new Set(["X", "IG"]);

function PostListRow({ item }: { item: FeedItem }) {
  const href = itemHref(item);
  const isSocial = item.type === "X" || item.type === "TIKTOK" || item.type === "IG";
  const SOCIAL_SUBTITLE: Record<string, string> = {
    X: "BUILD CANADA X",
    TIKTOK: "BUILD CANADA TIKTOK",
    IG: "BUILD CANADA INSTAGRAM",
  };
  const displaySubtitle = isSocial ? SOCIAL_SUBTITLE[item.type] : (item.subtitle || null);

  const inner = (
    <div className="group/row flex items-center gap-3 py-2.5 border-b border-[var(--color-border-light)] last:border-b-0 transition-colors">
      <div className={`w-[52px] h-[52px] rounded shrink-0 relative overflow-hidden ${feedImage(item) === SOCIAL_FALLBACK_IMAGE ? "bg-[var(--color-accent)]" : "bg-[var(--color-border-light)]"}`}>
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
        <p className="type-caption font-sans font-medium truncate transition-colors group-hover/row:text-[var(--color-accent)]">{item.title}</p>
        {displaySubtitle && (
          <p className="type-label-sm text-[var(--color-text-secondary)] truncate">{displaySubtitle}</p>
        )}
        {item.author && !isSocial && (
          <p className="type-label-sm text-[var(--color-text-muted)] mt-0.5">{item.author}</p>
        )}
      </div>
      <span
        className="border border-[var(--color-border-light)] rounded px-1.5 py-1 shrink-0 flex items-center justify-center transition-all duration-200 group-hover/row:border-[var(--_platform-color)] group-hover/row:bg-[var(--_platform-color)]"
        style={{ "--_platform-color": PLATFORM_HOVER_COLORS[item.type] || "var(--color-text-muted)" } as React.CSSProperties}
      >
        <span className={`transition-all duration-200 brightness-0 opacity-40 group-hover/row:opacity-100 ${INVERT_ICON_ON_HOVER.has(item.type) ? "group-hover/row:invert" : ""}`}>
          <PlatformIcon type={item.type} size={14} />
        </span>
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

const POSTS_PER_PAGE = 10;

function PaginationArrows({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-2 ml-auto">
      <button
        onClick={onPrev}
        disabled={page === 0}
        className="w-7 h-7 flex items-center justify-center rounded border border-[var(--color-border-light)] type-label-sm transition-colors hover:border-[var(--color-dark)] disabled:opacity-30 disabled:hover:border-[var(--color-border-light)]"
        aria-label="Previous page"
      >
        &#8592;
      </button>
      <span className="type-label-sm text-[var(--color-text-secondary)]">
        {page + 1}/{totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page === totalPages - 1}
        className="w-7 h-7 flex items-center justify-center rounded border border-[var(--color-border-light)] type-label-sm transition-colors hover:border-[var(--color-dark)] disabled:opacity-30 disabled:hover:border-[var(--color-border-light)]"
        aria-label="Next page"
      >
        &#8594;
      </button>
    </div>
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
  const [allPostsPage, setAllPostsPage] = useState(0);

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
      <div className="mx-[10px] my-[10px] border border-[var(--color-border-light)] bg-[var(--color-bg)]">
        <div className="px-5 py-16 text-center type-caption text-[var(--color-text-muted)]">
          Loading...
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-[10px] my-[10px] border border-[var(--color-border-light)] bg-[var(--color-bg)]">
        <FeedHeader />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="mx-[10px] my-[10px] border border-[var(--color-border-light)] bg-[var(--color-bg)]">
      <FeedHeader />
      <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <FilterChips active={activeFilter} onSelect={(f) => { setActiveFilter(f); setAllPostsPage(0); }} />
      </div>

      <div className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
        <section className="px-5 pt-[26px] pb-[36px] border-b border-[var(--color-border-light)]">
          <div className="max-w-[1080px] mx-auto">
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

            {/* All Posts (filtered + paginated) */}
            {filteredItems.length > 0 && (() => {
              const totalPages = Math.ceil(filteredItems.length / POSTS_PER_PAGE);
              const page = Math.min(allPostsPage, totalPages - 1);
              const pageItems = filteredItems.slice(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE);
              const onPrev = () => setAllPostsPage((p) => Math.max(0, p - 1));
              const onNext = () => setAllPostsPage((p) => Math.min(totalPages - 1, p + 1));
              return (
                <>
                  <div className="flex items-center">
                    <SectionLabel>All Posts</SectionLabel>
                    <PaginationArrows page={page} totalPages={totalPages} onPrev={onPrev} onNext={onNext} />
                  </div>
                  {pageItems.map((item) => (
                    <PostListRow key={item.id} item={item} />
                  ))}
                  <div className="flex items-center mt-3">
                    <div className="flex-1" />
                    <PaginationArrows page={page} totalPages={totalPages} onPrev={onPrev} onNext={onNext} />
                  </div>
                </>
              );
            })()}
          </div>
        </section>
      </div>
    </div>
  );
}
