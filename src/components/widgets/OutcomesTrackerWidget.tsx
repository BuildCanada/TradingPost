"use client";

import { WidgetProps } from "./types";

const statuses = [
  { label: "Not Started", count: 131, color: "#9ca3af" },
  { label: "In Progress", count: 420, color: "#d97706" },
  { label: "Completed", count: 47, color: "#8b2332" },
  { label: "Abandoned", count: 5, color: "#374151" },
];

const total = statuses.reduce((sum, s) => sum + s.count, 0);

export default function OutcomesTrackerWidget({ project }: WidgetProps) {
  return (
    <div className="p-5 h-full flex flex-col justify-center gap-4">
      {/* Header */}
      <div>
        <span className="type-label font-bold text-[10px] text-[var(--color-text-secondary)]">
          {project.title}
        </span>
        <p className="type-heading text-[17px] text-[var(--color-dark)] mt-1">
          Keeping Tabs on Federal Government Performance
        </p>
        <p className="type-caption text-[var(--color-text-secondary)] mt-0.5">
          Tracking the 603 Liberal government commitments from promise to completion.
        </p>
      </div>

      {/* Stacked horizontal bar */}
      <div>
        <div className="flex h-[28px] w-full overflow-hidden">
          {statuses.map((s) => (
            <div
              key={s.label}
              className="h-full transition-all duration-300 relative group"
              style={{
                width: `${(s.count / total) * 100}%`,
                backgroundColor: s.color,
              }}
            >
              {/* Show count inside bar if wide enough */}
              {s.count / total > 0.06 && (
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-white/90">
                  {s.count}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
          {statuses.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span
                className="w-[8px] h-[8px] rounded-full shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-[11px] font-mono text-[var(--color-text-secondary)]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
