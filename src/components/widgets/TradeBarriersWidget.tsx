"use client";

import { useState } from "react";
import { WidgetProps } from "./types";
import WidgetHeader from "./WidgetHeader";

const statuses = [
  { label: "Fully Implemented", count: 11, color: "var(--color-pine-500)" },
  { label: "Partially Implemented", count: 5, color: "var(--color-pine-400)" },
  { label: "Agreement Reached", count: 4, color: "var(--color-lake-400)" },
  { label: "Under Negotiation", count: 8, color: "var(--color-copper-500)" },
  { label: "Awaiting Sponsorship", count: 0, color: "var(--color-charcoal-200)" },
  { label: "Deferred", count: 6, color: "var(--color-charcoal-500)" },
];

const total = statuses.reduce((sum, s) => sum + s.count, 0);

export default function TradeBarriersWidget({ project }: WidgetProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="p-8 lg:p-10 h-full flex flex-col justify-between gap-4">
      <WidgetHeader
        project={project}
        description="Tracking 34 interprovincial trade barrier agreements."
      />

      <div>
        <div className="flex h-6 w-full overflow-hidden relative">
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
                {hovered === s.label && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-[var(--color-charcoal-1000)] text-white type-mono-sm rounded whitespace-nowrap z-50 pointer-events-none">
                    {s.count} {s.label}
                  </div>
                )}
              </div>
            ))}
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
          {statuses
            .filter((s) => s.count > 0)
            .map((s) => (
              <div key={s.label} className="flex items-center gap-1">
                <span
                  className="w-[7px] h-[7px] rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="type-mono-sm text-[var(--color-text-secondary)]">
                  {s.label}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
