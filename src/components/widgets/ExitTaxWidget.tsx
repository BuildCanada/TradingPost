"use client";

import { WidgetProps } from "./types";

const exitValue = 100_000_000;

// Canada: 66.67% inclusion rate (amounts over $250K), ~53% top combined rate (federal + provincial avg)
const caInclusionRate = 2 / 3;
const caTopRate = 0.5353;
const caTax = Math.round(exitValue * caInclusionRate * caTopRate);

// US: 20% federal LTCG + 3.8% NIIT = 23.8%
const usTaxRate = 0.238;
const usTax = Math.round(exitValue * usTaxRate);

const difference = caTax - usTax;

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

function Bar({ label, taxAmount, color }: { label: string; taxAmount: number; color: string }) {
  const taxPct = (taxAmount / exitValue) * 100;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-mono text-[var(--color-text-secondary)] w-[22px] shrink-0">{label}</span>
      <div className="flex-1 h-[22px] bg-[#f1f5f9] overflow-hidden relative">
        <div
          className="h-full flex items-center justify-end pr-2"
          style={{ width: `${taxPct}%`, backgroundColor: color }}
        >
          <span className="text-[11px] font-mono font-bold text-white">{fmt(taxAmount)}</span>
        </div>
      </div>
    </div>
  );
}

export default function ExitTaxWidget({ project }: WidgetProps) {
  return (
    <div className="p-5 h-full flex flex-col justify-center gap-3">
      <div>
        <span className="type-label font-bold text-[10px] text-[var(--color-text-secondary)]">
          {project.title}
        </span>
        <p className="type-caption text-[var(--color-text-secondary)] mt-0.5">
          Visualize and compare capital gains tax in Canada against California.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Bar label="CA" taxAmount={caTax} color="#932f2f" />
        <Bar label="US" taxAmount={usTax} color="#2563eb" />
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-[18px] font-mono font-bold text-[#932f2f]">+{fmt(difference)}</span>
        <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">more tax in Canada on a $100M exit</span>
      </div>
    </div>
  );
}
