"use client";

import { WidgetProps } from "./types";

export default function BuilderMPWidget({ project }: WidgetProps) {
  return (
    <div className="p-4 h-full flex flex-col gap-3">
      {/* Widget title */}
      <div>
        <span className="type-label font-bold text-[10px] text-[var(--color-text-secondary)]">
          {project.title}
        </span>
        <p className="type-caption text-[var(--color-text-secondary)] mt-0.5">
          A trained LLM which reviews bills and determines if they&apos;re builder approved.
        </p>
      </div>

      {/* Card mimicking buildcanada.com/bills style */}
      <div className="flex-1 bg-white rounded-xl border border-[#e5e7eb] flex flex-col gap-1.5 px-5 py-4">
        {/* Vote badge */}
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium leading-none"
            style={{
              backgroundColor: "#ecfdf5",
              color: "#047857",
              border: "1px solid #a7f3d0",
            }}
          >
            <span
              className="inline-flex items-center justify-center w-4 h-4 rounded-full"
              style={{
                backgroundColor: "#d1fae5",
                border: "1px solid #a7f3d0",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <path d="M3 8.5L6.5 12L13 4" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Vote Yes
          </span>
        </div>

        {/* Bill title */}
        <p
          className="text-[15px] leading-snug text-[#0f172a]"
          style={{ fontFamily: '"Test Soehne", sans-serif', fontWeight: 600 }}
        >
          Fixing Mobile Dead Zones and Coverage Maps
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-2 text-[12px] text-[#64748b]">
          <span className="font-medium">Bill C-268</span>
          <span className="opacity-40">|</span>
          <span>Mar 12, 2026</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {["Technology", "Infrastructure", "Indigenous Affairs"].map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "#f1f5f9",
                color: "#475569",
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
