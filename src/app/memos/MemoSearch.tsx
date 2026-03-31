"use client";

import SectionLabel from "@/components/SectionLabel";
import { useMemosFilter } from "./store";

export default function MemoSearch() {
  const search = useMemosFilter((s) => s.search);
  const setSearch = useMemosFilter((s) => s.setSearch);

  return (
    <div className="animate-fade-in" style={{ animationDelay: "1.2s" }}>
      <div className="px-5 py-8 border-b border-border-light">
        <div className="max-w-[900px] mx-auto">
          <SectionLabel as="h2">Search</SectionLabel>
          <div className="h-[38px] border border-border-light rounded flex items-center px-3 gap-2 mt-1 bg-bg">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search memos..."
              className="flex-1 bg-transparent type-caption outline-none placeholder:text-text-secondary"
            />
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="shrink-0 text-text-secondary"
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
  );
}
