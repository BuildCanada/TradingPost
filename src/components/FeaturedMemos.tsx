"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import FeaturedCard from "@/components/FeaturedCard";
import PickCard from "@/components/PickCard";

interface Memo {
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

export default function FeaturedMemos({ heading }: { heading?: string }) {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    fetch("/api/memos")
      .then((r) => r.json())
      .then((data: Memo[]) => {
        data.sort((a, b) => {
          const da = new Date(a.publishedAt || a.createdAt).getTime();
          const db = new Date(b.publishedAt || b.createdAt).getTime();
          return db - da;
        });
        setMemos(data);
      });
  }, []);

  // Pick up to two featured memos
  const featuredMemos: Memo[] = [];
  const allFeatured = memos.filter((m) => m.featured);
  if (allFeatured.length >= 2) {
    featuredMemos.push(allFeatured[0], allFeatured[1]);
  } else if (allFeatured.length === 1) {
    featuredMemos.push(allFeatured[0]);
    const next = memos.find((m) => m.id !== allFeatured[0].id);
    if (next) featuredMemos.push(next);
  } else if (memos.length >= 2) {
    featuredMemos.push(memos[0], memos[1]);
  } else if (memos.length === 1) {
    featuredMemos.push(memos[0]);
  }

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

  // Auto-rotate between featured cards
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

  if (memos.length === 0) return null;

  return (
    <section className="px-5 pt-[26px] pb-[36px] border-b border-[var(--color-border)]">
      <div className="max-w-[1080px] mx-auto">
      <div className="flex items-center justify-between pb-1">
        <span className="type-label text-[var(--color-text-secondary)] block">
          {heading || "Featured + Latest"}
        </span>
        {heading && (
          <Link
            href="/memos"
            className="h-7 px-2.5 border border-[var(--color-border-light)] flex items-center type-label text-[var(--color-text-muted)] hover:text-[var(--color-dark)] hover:border-[var(--color-dark)] transition-colors"
          >
            See All Memos →
          </Link>
        )}
      </div>
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
  );
}
