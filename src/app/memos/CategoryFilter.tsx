"use client";

import { cn } from "@/lib/utils";
import SectionLabel from "@/components/SectionLabel";
import { useMemosFilter } from "./store";

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
          <div className="border-t border-l border-border-light mt-4 grid grid-cols-3 wide:grid-cols-5">
            {allCategories.map((cat) => {
              const isAll = cat === "All";
              const isActive = isAll ? activeCategory === null : activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(isAll ? null : activeCategory === cat ? null : cat)}
                  className={cn(
                    "border-b border-r border-border-light h-11 flex items-center justify-center type-label transition-colors",
                    isActive
                      ? "bg-dark text-bg"
                      : "bg-transparent text-dark hover:bg-accent hover:text-bg"
                  )}
                >
                  {cat.replace(/-/g, " ")}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
