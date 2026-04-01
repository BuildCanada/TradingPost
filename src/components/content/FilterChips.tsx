"use client";

import { FILTERS } from "./types";

export function FilterChips({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (f: string) => void;
}) {
  return (
    <section className="px-5 pt-5 pb-8 border-b border-border-light">
      <div className="max-w-[1080px] mx-auto flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => onSelect(f)}
            className={`h-7 px-3.5 rounded-full type-label border transition-colors ${
              active === f
                ? "bg-dark text-bg border-dark"
                : "bg-transparent text-dark border-border-light hover:border-dark"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </section>
  );
}
