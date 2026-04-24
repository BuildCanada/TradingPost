"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import SectionLabel from "@/components/SectionLabel";
import FeaturedCard from "@/components/FeaturedCard";
import PickCard from "@/components/PickCard";
import { MemoItem } from "./types";

export default function FeaturedHero({
  memos,
  basePath,
}: {
  memos: MemoItem[];
  basePath?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

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

  if (memos.length === 0) return null;

  return (
    <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
      <section className="px-5 py-10 border-b border-border-light">
        <div className="max-w-[1080px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <SectionLabel as="h2">Featured + Latest</SectionLabel>
          </div>
          <div className="relative">
            {featuredMemos[0] && (
              <div
                className="transition-opacity duration-300"
                style={{ opacity: isFading ? 0 : 1 }}
              >
                <FeaturedCard
                  memo={featuredMemos[activeIndex]}
                  label="Featured"
                  wide
                  basePath={basePath}
                />
              </div>
            )}
            {hasTwoFeatured && (
              <div className="absolute top-4 right-4 z-20 flex gap-1.5">
                {[0, 1].map((i) => (
                  <button
                    key={i}
                    onClick={() => switchTo(i)}
                    className="w-12 h-12 flex items-center justify-center cursor-pointer"
                    aria-label={`Show featured memo ${i + 1}`}
                  >
                    <span
                      className={cn(
                        "block h-[3px] w-5 bg-bg transition-opacity duration-300",
                        activeIndex === i ? "opacity-90" : "opacity-35"
                      )}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          {latestSix.length > 0 && (
            <div className="grid grid-cols-1 cards:grid-cols-2 wide:grid-cols-3 gap-0 border-t border-border-light">
              {latestSix.map((m) => (
                <PickCard key={m.id} memo={m} basePath={basePath} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
