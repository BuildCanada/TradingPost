"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import SectionLabel from "@/components/SectionLabel";
import { useMemosFilter } from "./store";
import { MemoItem, formatDate, shortenName } from "./types";

function MemoGridRow({ memo }: { memo: MemoItem }) {
  return (
    <Link
      href={`/memos/${memo.slug}`}
      className="flex flex-col border-b border-r border-border-light group hover:bg-linen-50 transition-colors"
    >
      <div className="flex items-start gap-4 p-5 flex-1">
        <div
          className="w-10 h-10 bg-border-light shrink-0 overflow-hidden mt-0.5"
          style={{ borderRadius: "2px" }}
        >
          {memo.author.photo && (
            <Image
              src={memo.author.photo}
              alt={memo.author.name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              unoptimized
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="type-h4 group-hover:text-accent transition-colors line-clamp-1">
            {memo.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="type-label text-text-secondary">
              <span className="hidden wide:inline">{memo.author.name}</span>
              <span className="wide:hidden">
                {shortenName(memo.author.name)}
              </span>
            </p>
            <span className="text-text-secondary">&middot;</span>
            <p className="type-label-sm text-text-secondary">
              {formatDate(memo.publishedAt, memo.createdAt)}
            </p>
          </div>
          <p className="type-default text-text-secondary mt-1.5 line-clamp-3">
            {memo.keyMessage1}
          </p>
        </div>
      </div>

      <div className="border-t border-border-light px-5 py-3 flex items-center gap-2 group/cta">
        <span className="type-label text-text-secondary group-hover/cta:text-accent transition-colors">
          Read More
        </span>
        <svg
          className="w-4 h-4 text-text-secondary group-hover/cta:text-accent group-hover/cta:translate-x-1 transition-all"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

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
          m.author.name.toLowerCase().includes(q) ||
          m.keyMessage1.toLowerCase().includes(q)
      );
    }

    return list;
  }, [memos, search, activeCategory]);

  return (
    <div className="animate-fade-in" style={{ animationDelay: "1.6s" }}>
      <section className="px-5 py-10 border-b border-border-light">
        <div className="max-w-[1080px] mx-auto">
          <SectionLabel as="h2">
            {activeCategory
              ? `${activeCategory.replace(/-/g, " ")} Memos`
              : "All Memos"}
          </SectionLabel>
          {filtered.length === 0 && (
            <p className="type-body-sm text-text-secondary py-4">
              {memos.length === 0
                ? "No memos yet."
                : "No memos match your filters."}
            </p>
          )}
          <div className="grid grid-cols-1 wide:grid-cols-2 wide:gap-x-0 border-t border-l border-border-light mt-4">
            {filtered.slice(0, visibleCount).map((memo) => (
              <MemoGridRow key={memo.id} memo={memo} />
            ))}
          </div>
          {visibleCount < filtered.length && (
            <button
              onClick={loadMore}
               className="mt-6 mx-auto flex items-center gap-2 h-12 px-6 border border-border-light type-label text-text-secondary hover:text-dark hover:border-dark transition-colors"
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
