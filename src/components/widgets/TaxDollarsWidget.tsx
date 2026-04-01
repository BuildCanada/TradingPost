"use client";

import { WidgetProps } from "./types";
import WidgetHeader from "./WidgetHeader";

const income = 100000;

const segments = [
  { label: "Take Home", amount: 72592, color: "var(--color-charcoal-200)" },
  { label: "Federal Income Tax", amount: 14719, color: "var(--color-lake-500)" },
  { label: "CPP / CPP2", amount: 4430, color: "var(--color-lake-600)" },
  { label: "EI", amount: 1077, color: "var(--color-lake-700)" },
  { label: "Provincial Income Tax", amount: 6338, color: "var(--color-copper-500)" },
  { label: "ON Surtax + Health", amount: 844, color: "var(--color-copper-600)" },
];

function DonutChart() {
  const size = 88;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const dashes = segments.map((seg) => (seg.amount / income) * circumference);
  const offsets = dashes.reduce<number[]>((acc, dash, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + dashes[i - 1]);
    return acc;
  }, []);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" aria-hidden="true">
      {segments.map((seg, i) => {
        const dash = dashes[i];
        const gap = circumference - dash;
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
            strokeDashoffset={-offsets[i]}
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
        );
      })}
      <text
        x={size / 2}
        y={size / 2 - 3}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: "13px", fontWeight: 700, fill: "var(--color-charcoal-1000)", fontFamily: "var(--font-label)" }}
      >
        $72.6K
      </text>
      <text
        x={size / 2}
        y={size / 2 + 10}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: "8px", fill: "var(--color-steel-500)", fontFamily: "var(--font-label)" }}
      >
        take home
      </text>
    </svg>
  );
}

export default function TaxDollarsWidget({ project }: WidgetProps) {
  return (
    <div className="p-8 lg:p-10 h-full flex flex-col gap-4">
      <WidgetHeader project={project} />

      <div className="flex-1 flex items-center gap-4">
        <DonutChart />

        <div className="flex flex-col gap-1 min-w-0 flex-1">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-1.5">
              <span
                className="w-[7px] h-[7px] rounded-[2px] shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="type-mono-sm text-charcoal-600 truncate">
                {seg.label}
              </span>
              <span className="type-mono-sm font-bold text-charcoal-1000 ml-auto shrink-0">
                ${seg.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="type-mono-sm text-charcoal-600 text-right">
        ON resident &middot; $100K income &middot; 2025
      </p>
    </div>
  );
}
