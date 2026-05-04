"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import FeaturedCard from "@/components/FeaturedCard";
import PickCard from "@/components/PickCard";
import { SectionHeader } from "@/components/ui/section-header";
import { LinkButton } from "@/components/ui/link-button";

interface Memo {
  id: string;
  title: string;
  slug: string;
  author: {
    name: string;
    photo: string | null;
  };
  keyMessage1: string | null;
  keyMessage2: string | null;
  keyMessage3: string | null;
  bannerImage: string | null;
  seoImage: string | null;
  category: string | null;
  featured: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export default function FeaturedMemos({ memos }: { memos: Memo[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

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
  const latestFour = memos.filter((m) => !featuredIds.has(m.id)).slice(0, 4);

  if (memos.length === 0) {
    return (
      <section className="px-5 py-12 border-b border-border-light">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeader label="Memos" />
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-12 border-b border-border-light">
      <div className="max-w-[1080px] mx-auto">
        <SectionHeader
          label="Memos"
          action={<LinkButton href="/memos" variant="primary">See All Memos</LinkButton>}
        />
        <div className="relative">
          {featuredMemos[0] && (
            <div
              className="transition-opacity duration-300"
              style={{ opacity: isFading ? 0 : 1 }}
            >
              <FeaturedCard memo={featuredMemos[activeIndex]} label="Featured" wide />
            </div>
          )}
          {hasTwoFeatured && (
            <div className="absolute top-4 right-4 z-20 flex gap-1.5">
               {[0, 1].map((i) => (
                 <button
                   key={i}
                   onClick={() => switchTo(i)}
                   className={cn(
                     "w-12 h-12 flex items-center justify-center cursor-pointer"
                   )}
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
        {latestFour.length > 0 && (
          <div className="grid grid-cols-1 cards:grid-cols-2 wide:grid-cols-4 gap-0 border-t border-border-light">
            {latestFour.map((m) => (
              <PickCard key={m.id} memo={m} />
            ))}
          </div>
        )}
        <LinkButton href="/memos" className="compact:hidden flex w-full justify-center mt-6">
          See All Memos
        </LinkButton>
      </div>
    </section>
  );
}
