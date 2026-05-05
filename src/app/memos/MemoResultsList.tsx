"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import SectionLabel from "@/components/SectionLabel";
import { useMemosFilter } from "./store";
import { MemoItem, formatDate, shortenName } from "./types";

function MemoGridRow({ memo, basePath }: { memo: MemoItem; basePath: string }) {
  const author = memo.author;
  const hasMedia = Boolean(author?.photo);
  return (
    <Link
      href={`${basePath}/${memo.slug}`}
      className="flex flex-col border-b border-r border-border-light group hover:bg-linen-50 transition-colors"
    >
      <div
        className={
          hasMedia
            ? "grid grid-cols-[7rem_1fr] wide:grid-cols-[6.125rem_1fr] flex-1"
            : "flex-1"
        }
      >
        {hasMedia && (
          <div className="relative overflow-hidden bg-border-light">
            {author?.photo && (
              <Image
                src={author.photo}
                alt={author.name}
                width={64}
                height={64}
                className="absolute inset-0 w-full h-full object-cover"
                unoptimized
              />
            )}
          </div>
        )}

        <div className="min-w-0 p-5">
          <h3 className="type-h4 group-hover:text-accent transition-colors line-clamp-1">
            {memo.title}
          </h3>
          <div className="mt-1">
            {author && (
              <>
                <p className="type-label text-text-secondary">
                  <span className="hidden wide:inline">{author.name}</span>
                  <span className="wide:hidden">{shortenName(author.name)}</span>
                </p>
                {author.title && (
                  <p className="type-label-sm text-text-secondary mt-0.5">
                    <span className="hidden wide:inline">{author.title}</span>
                    <span className="wide:hidden line-clamp-1">{author.title}</span>
                  </p>
                )}
              </>
            )}
            <p className="type-label-sm text-text-secondary mt-0.5">
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

export default function MemoResultsList({
  memos,
  basePath = "/memos",
  resultsLabel = "Memos",
}: {
  memos: MemoItem[];
  basePath?: string;
  resultsLabel?: string;
}) {
  const search = useMemosFilter((s) => s.search);
  const activeCategory = useMemosFilter((s) => s.activeCategory);
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
          m.author?.name.toLowerCase().includes(q) ||
          m.keyMessage1?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [memos, search, activeCategory]);

  const lowerLabel = resultsLabel.toLowerCase();

  return (
    <div className="animate-fade-in" style={{ animationDelay: "1.6s" }}>
      <section className="px-5 py-10 border-b border-border-light">
        <div className="max-w-[1080px] mx-auto">
          <SectionLabel as="h2" className={activeCategory ? "capitalize" : undefined}>
            {activeCategory
              ? `${activeCategory.replace(/-/g, " ")} ${resultsLabel}`
              : `All ${resultsLabel}`}
          </SectionLabel>
          {filtered.length === 0 && (
            <p className="type-body-sm text-text-secondary py-4">
              {memos.length === 0
                ? `No ${lowerLabel} yet.`
                : `No ${lowerLabel} match your filters.`}
            </p>
          )}
          <div className="grid grid-cols-1 wide:grid-cols-2 wide:gap-x-0 border-t border-l border-border-light mt-4">
            {filtered.map((memo) => (
              <MemoGridRow key={memo.id} memo={memo} basePath={basePath} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
