"use client";

import { cn } from "@/lib/utils";
import { FILTERS } from "./types";

export function FilterChips({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (f: string) => void;
}) {
  return (
    <div className="px-5 py-10 border-b border-border-light">
      <div className="max-w-[1080px] mx-auto">
        <div
          role="group"
          aria-label="Filter content by platform"
          className="border-t border-l border-border-light grid grid-cols-3 wide:grid-cols-6"
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => onSelect(f)}
              aria-pressed={active === f}
              className={cn(
                "border-b border-r border-border-light h-12 flex items-center justify-center type-label cursor-pointer transition-colors",
                active === f
                  ? "bg-dark text-bg"
                  : "bg-transparent text-dark hover:bg-accent hover:text-bg"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
