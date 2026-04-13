"use client";

import { cn } from "@/lib/utils";
import SectionLabel from "@/components/SectionLabel";
import { useMemosFilter } from "./store";

function updateUrl(category: string | null) {
  const url = new URL(window.location.href);
  if (category) {
    url.searchParams.set("category", category);
  } else {
    url.searchParams.delete("category");
  }
  window.history.replaceState(null, "", url.toString());
}

export default function CategoryFilter({
  categories,
}: {
  categories: string[];
}) {
  const activeCategory = useMemosFilter((s) => s.activeCategory);
  const setActiveCategory = useMemosFilter((s) => s.setActiveCategory);

  const allCategories = ["All", ...categories];

  return (
    <div className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
      <div className="px-5 py-10 border-b border-border-light">
        <div className="max-w-[1080px] mx-auto">
          <SectionLabel as="h2">Category</SectionLabel>
          <div role="group" aria-label="Filter memos by category" className="border-t border-l border-border-light mt-4 grid grid-cols-3 wide:grid-cols-5">
            {allCategories.map((cat) => {
              const isAll = cat === "All";
              const isActive = isAll ? activeCategory === null : activeCategory === cat;
              const display = cat.replace(/-/g, " ");
              return (
                <button
                  key={cat}
                  onClick={() => {
                    const next = isAll ? null : activeCategory === cat ? null : cat;
                    setActiveCategory(next);
                    updateUrl(next);
                  }}
                  aria-pressed={isActive}
                  aria-label={isAll ? "Show all categories" : `Filter by ${display}`}
                  className={cn(
                    "border-b border-r border-border-light h-12 flex items-center justify-center type-label cursor-pointer transition-colors",
                    isActive
                      ? "bg-dark text-bg"
                      : "bg-transparent text-dark hover:bg-accent hover:text-bg"
                  )}
                >
                  {display}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
