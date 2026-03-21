"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import SectionLabel from "@/components/SectionLabel";
import FeaturedCard from "@/components/FeaturedCard";
import PickCard from "@/components/PickCard";

export interface MemoItem {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorImage: string | null;
  keyMessage1: string;
  keyMessage2: string | null;
  keyMessage3: string | null;
  splashImage: string | null;
  seoImage: string | null;
  category: string | null;
  featured: boolean;
  publishedAt: string | null;
  createdAt: string;
}

function formatDate(dateStr: string | null, fallback: string) {
  const d = new Date(dateStr || fallback);
  return d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function shortenName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function MemoCard({ memo }: { memo: MemoItem }) {
  return (
    <Link
      href={`/memos/${memo.slug}`}
      className="flex items-start gap-3 py-3.5 border-b border-[var(--color-border-light)] group"
    >
      {/* Author thumbnail */}
      <div className="w-10 h-10 rounded bg-[var(--color-border-light)] shrink-0 overflow-hidden mt-0.5">
        {memo.authorImage && (
          <Image
            src={memo.authorImage}
            alt={memo.author}
            width={40}
            height={40}
            className="w-full h-full object-cover"
            unoptimized
          />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3 className="type-heading !text-[18px] group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
          {memo.title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="type-label text-[var(--color-text-secondary)]">
            <span className="hidden min-[900px]:inline">{memo.author}</span>
            <span className="min-[900px]:hidden">{shortenName(memo.author)}</span>
          </p>
          <span className="text-[var(--color-text-secondary)]">&middot;</span>
          <p className="type-label-sm text-[var(--color-text-secondary)]">
            {formatDate(memo.publishedAt, memo.createdAt)}
          </p>
        </div>
        <p className="type-caption text-[var(--color-text-secondary)] mt-1 line-clamp-2">
          {memo.keyMessage1}
        </p>
      </div>

      {/* Arrow */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className="shrink-0 mt-1 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors"
      >
        <path
          d="M2 7h9M8 3l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}

export default function MemosListClient({ memos }: { memos: MemoItem[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const m of memos) {
      if (m.category) cats.add(m.category);
    }
    return Array.from(cats).sort();
  }, [memos]);

  const filtered = useMemo(() => {
    let list = [...memos];

    if (activeCategory) {
      list = list.filter((m) => m.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.author.toLowerCase().includes(q) ||
          m.keyMessage1.toLowerCase().includes(q)
      );
    }

    return list;
  }, [memos, search, activeCategory]);

  const [visibleCount, setVisibleCount] = useState(10);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Pick up to two featured memos
  const featuredMemos: MemoItem[] = useMemo(() => {
    const result: MemoItem[] = [];
    const allFeatured = memos.filter((m) => m.featured);
    if (allFeatured.length >= 2) {
      result.push(allFeatured[0], allFeatured[1]);
    } else if (allFeatured.length === 1) {
      result.push(allFeatured[0]);
      const next = memos.find((m) => m.id !== allFeatured[0].id);
      if (next) result.push(next);
    } else if (memos.length >= 2) {
      result.push(memos[0], memos[1]);
    } else if (memos.length === 1) {
      result.push(memos[0]);
    }
    return result;
  }, [memos]);

  const hasTwoFeatured = featuredMemos.length === 2;

  const switchTo = useCallback(
    (index: number) => {
      if (index === activeIndex || !hasTwoFeatured) return;
      setIsFading(true);
      setTimeout(() => {
        setActiveIndex(index);
        setIsFading(false);
      }, 300);
    },
    [activeIndex, hasTwoFeatured]
  );

  useEffect(() => {
    if (!hasTwoFeatured) return;
    const timer = setInterval(() => {
      switchTo(activeIndex === 0 ? 1 : 0);
    }, 10000);
    return () => clearInterval(timer);
  }, [hasTwoFeatured, activeIndex, switchTo]);

  const featuredIds = new Set(featuredMemos.map((m) => m.id));
  const latestSix = memos.filter((m) => !featuredIds.has(m.id)).slice(0, 6);
  const firstThree = latestSix.slice(0, 3);
  const secondThree = latestSix.slice(3, 6);

  return (
    <>
      {/* Featured + Latest */}
      {memos.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <section className="px-5 pt-[26px] pb-[36px] border-b border-[var(--color-border-light)]">
            <div className="max-w-[1080px] mx-auto">
              <SectionLabel>Featured + Latest</SectionLabel>
              <div className="grid grid-cols-1 cards:grid-cols-[1.5fr_1fr] wide:grid-cols-[1.5fr_1fr_1fr] gap-2.5 mt-1">
                <div className="relative h-full">
                  {featuredMemos[0] && (
                    <div
                      className="transition-opacity duration-300 h-full"
                      style={{ opacity: isFading ? 0 : 1 }}
                    >
                      <FeaturedCard memo={featuredMemos[activeIndex]} label="Featured" />
                    </div>
                  )}
                  {hasTwoFeatured && (
                    <div className="absolute top-3 right-3 z-20 flex gap-1.5">
                      {[0, 1].map((i) => (
                        <button
                          key={i}
                          onClick={() => switchTo(i)}
                          className="h-[3px] w-5 rounded-full transition-opacity duration-300"
                          style={{
                            backgroundColor: "var(--color-bg)",
                            opacity: activeIndex === i ? 0.9 : 0.35,
                          }}
                          aria-label={`Show featured memo ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2.5">
                  {firstThree.map((m) => (
                    <PickCard key={m.id} memo={m} />
                  ))}
                  {Array.from({ length: Math.max(0, 3 - firstThree.length) }).map((_, i) => (
                    <div key={i} className="flex-1 border border-[var(--color-border-light)] rounded-[3px] min-h-[58px]" />
                  ))}
                </div>
                <div className="hidden wide:flex flex-col gap-2.5">
                  {secondThree.map((m) => (
                    <PickCard key={m.id} memo={m} />
                  ))}
                  {Array.from({ length: Math.max(0, 3 - secondThree.length) }).map((_, i) => (
                    <div key={i} className="flex-1 border border-[var(--color-border-light)] rounded-[3px] min-h-[58px]" />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Category filter */}
      <div className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
        <div className="px-5 pt-[22px] pb-[32px] border-b border-[var(--color-border-light)]">
          <div className="max-w-[900px] mx-auto flex items-center gap-2 flex-wrap">
            <span className="type-label-sm text-[var(--color-text-muted)] mr-1">
              Category
            </span>
            <button
              onClick={() => setActiveCategory(null)}
              className={`h-7 px-3.5 rounded-full type-label border transition-colors ${
                activeCategory === null
                  ? "bg-[var(--color-dark)] text-[var(--color-bg)] border-[var(--color-dark)]"
                  : "bg-transparent text-[var(--color-dark)] border-[var(--color-border-light)] hover:border-[var(--color-dark)]"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setActiveCategory(activeCategory === cat ? null : cat)
                }
                className={`h-7 px-3.5 rounded-full type-label border transition-colors ${
                  activeCategory === cat
                    ? "bg-[var(--color-dark)] text-[var(--color-bg)] border-[var(--color-dark)]"
                    : "bg-transparent text-[var(--color-dark)] border-[var(--color-border-light)] hover:border-[var(--color-dark)]"
                }`}
              >
                {cat.replace(/-/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="animate-fade-in" style={{ animationDelay: "1.2s" }}>
        <div className="px-5 pt-[24px] pb-[34px] border-b border-[var(--color-border-light)]">
          <div className="max-w-[900px] mx-auto">
            <SectionLabel>Search</SectionLabel>
            <div className="h-[38px] border border-[var(--color-border-light)] rounded flex items-center px-3 gap-2 mt-1 bg-[#fafafa]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search memos..."
                className="flex-1 bg-transparent type-caption outline-none placeholder:text-[var(--color-text-muted)]"
              />
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="shrink-0 text-[var(--color-text-muted)]"
              >
                <circle
                  cx="6"
                  cy="6"
                  r="4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M9.5 9.5L13 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Article Feed */}
      <div className="animate-fade-in" style={{ animationDelay: "1.6s" }}>
        <section className="px-5 pt-[24px] pb-[34px] border-b border-[var(--color-border-light)]">
          <div className="max-w-[900px] mx-auto">
            <SectionLabel>
              {activeCategory
                ? `${activeCategory.replace(/-/g, " ")} Memos`
                : "All Memos"}
            </SectionLabel>
            {filtered.length === 0 && memos.length > 0 && (
              <p className="type-caption text-[var(--color-text-muted)] py-4">
                No memos match your filters.
              </p>
            )}
            {filtered.length === 0 && memos.length === 0 && (
              <p className="type-caption text-[var(--color-text-muted)] py-4">
                No memos yet.
              </p>
            )}
            <div className="grid grid-cols-1 min-[900px]:grid-cols-2 min-[900px]:gap-x-6">
              {filtered.slice(0, visibleCount).map((memo) => (
                <MemoCard key={memo.id} memo={memo} />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <button
                onClick={() => setVisibleCount((c) => c + 10)}
                className="mt-4 mx-auto flex items-center gap-2 h-9 px-4 border border-[var(--color-border-light)] rounded-full type-label text-[var(--color-text-secondary)] hover:text-[var(--color-dark)] hover:border-[var(--color-dark)] transition-colors"
              >
                Show More
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="shrink-0"
                >
                  <path
                    d="M3 5.5l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
