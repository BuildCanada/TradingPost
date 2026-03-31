"use client";

import { cn } from "@/lib/utils";
import { useMemosFilter } from "./store";

export default function CategoryFilter({
  categories,
}: {
  categories: string[];
}) {
  const activeCategory = useMemosFilter((s) => s.activeCategory);
  const setActiveCategory = useMemosFilter((s) => s.setActiveCategory);

  return (
    <div className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
      <div className="px-5 py-8 border-b border-border-light">
        <div className="max-w-[900px] mx-auto flex items-center gap-2 flex-wrap">
          <span className="type-label-sm text-text-secondary mr-1">
            Category
          </span>
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              "h-7 px-3.5 rounded-full type-label border transition-colors",
              activeCategory === null
                ? "bg-dark text-bg border-dark"
                : "bg-transparent text-dark border-border-light hover:border-dark"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setActiveCategory(activeCategory === cat ? null : cat)
              }
              className={cn(
                "h-7 px-3.5 rounded-full type-label border transition-colors",
                activeCategory === cat
                  ? "bg-dark text-bg border-dark"
                  : "bg-transparent text-dark border-border-light hover:border-dark"
              )}
            >
              {cat.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
