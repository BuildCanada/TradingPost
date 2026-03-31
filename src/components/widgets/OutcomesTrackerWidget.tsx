"use client";

import { WidgetProps } from "./types";
import WidgetHeader from "./WidgetHeader";

const statuses = [
  { label: "Not Started", count: 131, color: "var(--color-charcoal-400)" },
  { label: "In Progress", count: 420, color: "var(--color-copper-500)" },
  { label: "Completed", count: 47, color: "var(--color-auburn-800)" },
  { label: "Abandoned", count: 5, color: "var(--color-charcoal-900)" },
];

const total = statuses.reduce((sum, s) => sum + s.count, 0);

export default function OutcomesTrackerWidget({ project }: WidgetProps) {
  return (
    <div className="p-8 lg:p-10 h-full flex flex-col justify-between gap-4">
      <WidgetHeader
        project={project}
        heading="Keeping Tabs on Federal Government Performance"
        description="Tracking the 603 Liberal government commitments from promise to completion."
      />

      <div>
        <div className="flex h-7 w-full overflow-hidden">
          {statuses.map((s) => (
            <div
              key={s.label}
              className="h-full transition-all duration-300 relative"
              style={{
                width: `${(s.count / total) * 100}%`,
                backgroundColor: s.color,
              }}
            >
              {s.count / total > 0.06 && (
                <span className="absolute inset-0 flex items-center justify-center type-mono-sm font-bold text-white/90">
                  {s.count}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
          {statuses.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
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
