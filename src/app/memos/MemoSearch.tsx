"use client";

import SectionLabel from "@/components/SectionLabel";
import { useMemosFilter } from "./store";

export default function MemoSearch({ placeholder = "Search memos..." }: { placeholder?: string } = {}) {
  const search = useMemosFilter((s) => s.search);
  const setSearch = useMemosFilter((s) => s.setSearch);

  return (
    <div className="animate-fade-in" style={{ animationDelay: "1.2s" }}>
      <div className="px-5 py-10 border-b border-border-light">
        <div className="max-w-[1080px] mx-auto">
          <SectionLabel as="h2">Search</SectionLabel>
           <div className="h-12 border border-border-light flex items-center px-4 gap-3 mt-4 bg-bg">
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
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent font-mono text-base tracking-normal outline-none placeholder:text-text-secondary"
            />
            {search && (
               <button
                onClick={() => setSearch("")}
                className="shrink-0 min-w-[48px] min-h-[48px] flex items-center justify-center text-text-secondary hover:text-dark transition-colors"
                aria-label="Clear search"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M3 3l8 8M11 3l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
