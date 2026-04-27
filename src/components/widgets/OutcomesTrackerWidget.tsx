"use client";

import { WidgetProps } from "./types";
import WidgetHeader from "./WidgetHeader";

const statuses = [
  { key: "not_started", label: "Not Started", count: 131, color: "bg-gray-300" },
  { key: "in_progress", label: "In Progress", count: 420, color: "bg-amber-400" },
  { key: "completed", label: "Completed", count: 47, color: "bg-pine-600" },
  { key: "broken", label: "Broken", count: 5, color: "bg-[#8b2332]" },
];

const total = statuses.reduce((sum, s) => sum + s.count, 0);

export default function OutcomesTrackerWidget({ project }: WidgetProps) {
  return (
    <div className="p-8 lg:p-10 h-full flex flex-col justify-between gap-6">
      <WidgetHeader
        project={project}
        heading="Keeping Tabs on Federal Government Performance"
        description={`Tracking the ${total} Liberal government commitments from promise to completion.`}
      />

      <div>
        <div className="flex flex-wrap gap-0.5">
          {statuses.flatMap((s) =>
            Array.from({ length: s.count }, (_, i) => (
              <div key={`${s.key}-${i}`} className={`w-3 h-3 ${s.color}`} />
            )),
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4">
          {statuses.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${s.color}`} />
              <span className="type-mono-sm text-charcoal-600">
                {s.label}: {s.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
