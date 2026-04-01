"use client";

import { WidgetProps } from "./types";
import WidgetHeader from "./WidgetHeader";

const exitValue = 100_000_000;

const caInclusionRate = 2 / 3;
const caTopRate = 0.5353;
const caTax = Math.round(exitValue * caInclusionRate * caTopRate);

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
      <span className="type-mono-sm text-text-secondary w-[28px] shrink-0">{label}</span>
      <div className="flex-1 h-6 bg-steel-50 overflow-hidden relative">
        <div
          className="h-full flex items-center justify-end pr-2"
          style={{ width: `${taxPct}%`, backgroundColor: color }}
        >
          <span className="type-mono-sm font-bold text-white">{fmt(taxAmount)}</span>
        </div>
      </div>
    </div>
  );
}

export default function ExitTaxWidget({ project }: WidgetProps) {
  return (
    <div className="p-8 lg:p-10 h-full flex flex-col justify-between gap-4">
      <WidgetHeader
        project={project}
        heading="Exit Tax Calculator"
        description="Visualize and compare capital gains tax in Canada against California."
      />

      <div className="flex flex-col gap-1.5">
        <Bar label="CA" taxAmount={caTax} color="var(--color-auburn-800)" />
        <Bar label="US" taxAmount={usTax} color="var(--color-lake-500)" />
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-[1.25rem] font-bold text-accent">+{fmt(difference)}</span>
        <span className="type-mono-sm text-text-secondary">more tax in Canada on a $100M exit</span>
      </div>
    </div>
  );
}
