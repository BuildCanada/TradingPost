"use client";

import { WidgetProps } from "./types";
import WidgetHeader from "./WidgetHeader";

export default function BuilderMPWidget({ project }: WidgetProps) {
  return (
    <div className="p-8 lg:p-10 h-full flex flex-col gap-4">
      <WidgetHeader
        project={project}
        description="A trained LLM which reviews bills and determines if they're Pro-Growth."
      />

      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none"
            style={{
              backgroundColor: "var(--color-pine-50)",
              color: "var(--color-pine-600)",
              border: "1px solid var(--color-pine-200)",
            }}
          >
            <span
              className="inline-flex items-center justify-center w-4 h-4 rounded-full"
              style={{
                backgroundColor: "var(--color-pine-100)",
                border: "1px solid var(--color-pine-200)",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8.5L6.5 12L13 4" stroke="var(--color-pine-600)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Vote Yes
          </span>
        </div>

        <p className="font-display text-[1.25rem] font-normal leading-[1.2] text-[var(--color-dark)]">
          Fixing Mobile Dead Zones and Coverage Maps
        </p>

        <div className="flex items-center gap-2 type-mono-sm text-[var(--color-steel-500)]">
          <span className="font-medium">Bill C-268</span>
          <span className="opacity-40">|</span>
          <span>Mar 12, 2026</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-auto">
          {["Technology", "Infrastructure", "Indigenous Affairs"].map((tag) => (
            <span
              key={tag}
              className="type-mono-sm font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "var(--color-steel-50)",
                color: "var(--color-steel-600)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
