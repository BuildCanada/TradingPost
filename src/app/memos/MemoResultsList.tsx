"use client";

import { useMemo } from "react";
import SectionLabel from "@/components/SectionLabel";
import { useMemosFilter } from "./store";
import { MemoItem } from "./types";
import MemoListItem from "./MemoListItem";

export default function MemoResultsList({ memos }: { memos: MemoItem[] }) {
  const search = useMemosFilter((s) => s.search);
  const activeCategory = useMemosFilter((s) => s.activeCategory);
  const visibleCount = useMemosFilter((s) => s.visibleCount);
  const loadMore = useMemosFilter((s) => s.loadMore);

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

  return (
    <div className="animate-fade-in" style={{ animationDelay: "1.6s" }}>
      <section className="px-5 py-10 border-b border-border-light">
        <div className="max-w-[900px] mx-auto">
          <SectionLabel as="h2">
            {activeCategory
              ? `${activeCategory.replace(/-/g, " ")} Memos`
              : "All Memos"}
          </SectionLabel>
          {filtered.length === 0 && memos.length > 0 && (
            <p className="type-caption text-text-secondary py-4">
              No memos match your filters.
            </p>
          )}
          {filtered.length === 0 && memos.length === 0 && (
            <p className="type-caption text-text-secondary py-4">
              No memos yet.
            </p>
          )}
          <div className="grid grid-cols-1 min-[900px]:grid-cols-2 min-[900px]:gap-x-6">
            {filtered.slice(0, visibleCount).map((memo) => (
              <MemoListItem key={memo.id} memo={memo} />
            ))}
          </div>
          {visibleCount < filtered.length && (
            <button
              onClick={loadMore}
              className="mt-4 mx-auto flex items-center gap-2 h-9 px-4 border border-border-light rounded-full type-label text-text-secondary hover:text-dark hover:border-dark transition-colors"
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
  );
}
