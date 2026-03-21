"use client";

import { WidgetProps } from "./types";

const income = 100000;

const segments = [
  { label: "Take Home", amount: 72592, color: "#d1d5db" },
  { label: "Federal Income Tax", amount: 14719, color: "#3b82f6" },
  { label: "CPP / CPP2", amount: 4430, color: "#6366f1" },
  { label: "EI", amount: 1077, color: "#8b5cf6" },
  { label: "Provincial Income Tax", amount: 6338, color: "#f59e0b" },
  { label: "ON Surtax + Health", amount: 844, color: "#f97316" },
];

function DonutChart() {
  const size = 88;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      {segments.map((seg) => {
        const pct = seg.amount / income;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const currentOffset = offset;
        offset += dash;
        return (
          <circle
            key={seg.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-currentOffset}
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
        );
      })}
      <text
        x={size / 2}
        y={size / 2 - 3}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: "13px", fontWeight: 700, fill: "#1e293b", fontFamily: "system-ui, sans-serif" }}
      >
        $72.6K
      </text>
      <text
        x={size / 2}
        y={size / 2 + 10}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: "8px", fill: "#64748b", fontFamily: "system-ui, sans-serif" }}
      >
        take home
      </text>
    </svg>
  );
}

export default function TaxDollarsWidget({ project }: WidgetProps) {
  return (
    <div className="p-4 h-full flex flex-col gap-3">
      {/* Widget title */}
      <div>
        <span className="type-label font-bold text-[10px] text-[var(--color-text-secondary)]">
          {project.title}
        </span>
        {project.description && (
          <p className="type-caption text-[var(--color-text-secondary)] mt-0.5">
            {project.description}
          </p>
        )}
      </div>

      {/* Content container */}
      <div className="flex-1 bg-white rounded-xl border border-[#e5e7eb] flex flex-col gap-3 px-5 py-4">
        <div className="flex-1 flex items-center gap-3.5">
          <DonutChart />

          <div className="flex flex-col gap-[3px] min-w-0 flex-1">
            {segments.map((seg) => (
              <div key={seg.label} className="flex items-center gap-1.5">
                <span
                  className="w-[7px] h-[7px] rounded-[2px] shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-[10px] font-mono text-[var(--color-text-secondary)] truncate">
                  {seg.label}
                </span>
                <span className="text-[10px] font-mono font-bold text-[var(--color-dark)] ml-auto shrink-0">
                  ${seg.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[9px] font-mono text-[var(--color-text-secondary)] opacity-60 text-right">
          ON resident &middot; $100K income &middot; 2025
        </p>
      </div>
    </div>
  );
}
