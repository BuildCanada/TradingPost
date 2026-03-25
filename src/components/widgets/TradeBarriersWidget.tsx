"use client";

import { useState } from "react";
import { WidgetProps } from "./types";

const statuses = [
  { label: "Fully Implemented", count: 11, color: "#16a34a" },
  { label: "Partially Implemented", count: 5, color: "#65a30d" },
  { label: "Agreement Reached", count: 4, color: "#0ea5e9" },
  { label: "Under Negotiation", count: 8, color: "#eab308" },
  { label: "Awaiting Sponsorship", count: 0, color: "#d1d5db" },
  { label: "Deferred", count: 6, color: "#6b7280" },
];

const total = statuses.reduce((sum, s) => sum + s.count, 0);

export default function TradeBarriersWidget({ project }: WidgetProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="p-5 h-full flex flex-col justify-center gap-3">
      {/* Header */}
      <div>
        <span className="type-label font-bold text-[10px] text-[var(--color-text-secondary)]">
          {project.title}
        </span>
        <p className="type-caption text-[var(--color-text-secondary)] mt-0.5">
          Tracking 34 interprovincial trade barrier agreements.
        </p>
      </div>

      {/* Stacked horizontal bar */}
      <div>
        <div className="flex h-[22px] w-full overflow-hidden relative">
          {statuses
            .filter((s) => s.count > 0)
            .map((s) => (
              <div
                key={s.label}
                className="h-full transition-all duration-300 relative"
                style={{
                  width: `${(s.count / total) * 100}%`,
                  backgroundColor: s.color,
                }}
                onMouseEnter={() => setHovered(s.label)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Tooltip */}
                {hovered === s.label && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-[#1f2937] text-white text-[10px] font-mono rounded shadow-lg whitespace-nowrap z-50 pointer-events-none">
                    {s.count} {s.label}
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
          {statuses
            .filter((s) => s.count > 0)
            .map((s) => (
              <div key={s.label} className="flex items-center gap-1">
                <span
                  className="w-[7px] h-[7px] rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">
                  {s.label}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
