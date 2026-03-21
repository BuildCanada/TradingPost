"use client";

import { useState, useRef, useEffect } from "react";
import { WidgetProps } from "./types";

const BLUE = "#1F5F7F";
const RED = "#8b2332";
const DEFICIT_GRAY = "#374151";

const revenue = {
  total: 449.2,
  sources: [
    { label: "Personal Income Tax", amount: 209.6 },
    { label: "Corporate Income Tax", amount: 72.4 },
    { label: "GST", amount: 46.1 },
    { label: "EI Premiums", amount: 25.8 },
    { label: "Other Tax Revenue", amount: 49.2 },
    { label: "Non-Tax Revenue", amount: 46.1 },
  ],
};

const spending = {
  total: 513.9,
  categories: [
    { label: "Public Debt Charges", amount: 46.5 },
    { label: "Elderly Benefits", amount: 72.3 },
    { label: "Major Transfers", amount: 95.2 },
    { label: "Defence", amount: 34.4 },
    { label: "Indigenous Services", amount: 63.2 },
    { label: "Crown Corps & Other", amount: 88.4 },
    { label: "Operating & Capital", amount: 113.9 },
  ],
};

const deficit = Math.round((spending.total - revenue.total) * 10) / 10;

interface Tooltip { label: string; amount: number; x: number; y: number }

const BAR_H = 22;
const ROW_GAP = 10;
const ITEM_GAP = 2;
const TEXT_PAD = 3;
const CHAR_W = 6.6; // approx width of one 11px mono char

function textFits(amount: number, barWidth: number) {
  const str = `$${amount.toFixed(1)}B`;
  const textW = str.length * CHAR_W + TEXT_PAD * 2;
  return barWidth >= textW;
}

function BarSegment({
  width,
  color,
  label,
  amount,
  onHover,
  onLeave,
}: {
  width: number;
  color: string;
  label: string;
  amount: number;
  onHover: (e: React.MouseEvent, label: string, amount: number) => void;
  onLeave: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const showText = textFits(amount, width);

  return (
    <div
      className="relative overflow-hidden cursor-default transition-[filter] duration-150"
      style={{
        width,
        height: BAR_H,
        backgroundColor: color,
        opacity: 0.7,
        borderRadius: 1,
        filter: hovered ? "brightness(0.75)" : "none",
      }}
      onMouseMove={(e) => {
        setHovered(true);
        onHover(e, label, amount);
      }}
      onMouseLeave={() => {
        setHovered(false);
        onLeave();
      }}
    >
      {showText && (
        <span
          className="absolute inset-0 flex items-center justify-center text-white font-mono font-bold leading-none"
          style={{ fontSize: 11, padding: `0 ${TEXT_PAD}px` }}
        >
          ${amount.toFixed(1)}B
        </span>
      )}
    </div>
  );
}

/** Distributes items proportionally within a fixed targetW (including gaps) */
function computeSegments(
  items: { label: string; amount: number }[],
  total: number,
  targetW: number,
) {
  const totalGap = ITEM_GAP * (items.length - 1);
  const availW = targetW - totalGap;

  return items.map((item) => ({
    ...item,
    w: Math.max(3, (item.amount / total) * availW),
  }));
}

function SankeyDiagram() {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(280);
  const maxTotal = Math.max(revenue.total, spending.total);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 280;
      setContainerW(w);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleHover = (e: React.MouseEvent, label: string, amount: number) => {
    const container = e.currentTarget.closest("[data-sankey]") as HTMLElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 28,
      label,
      amount,
    });
  };

  // Revenue main bar + deficit: 2 children, 1 gap
  const mainGap = ITEM_GAP;
  const mainAvail = containerW - mainGap;
  const revMainW = (revenue.total / maxTotal) * mainAvail;
  const deficitMainW = mainAvail - revMainW;

  // Revenue breakdown: fits exactly within revMainW
  const revBreakdown = computeSegments(revenue.sources, revenue.total, revMainW);

  // Expenditure breakdown: fills full containerW
  const expBreakdown = computeSegments(spending.categories, spending.total, containerW);

  return (
    <div className="relative" data-sankey onMouseLeave={() => setTooltip(null)}>
      {/* Revenue */}
      <div className="flex flex-col md:flex-row md:items-center" style={{ gap: 8 }}>
        <div className="flex items-baseline gap-2 md:block shrink-0 md:w-[80px]">
          <span className="text-[11px] font-mono font-bold" style={{ color: BLUE }}>
            Revenues
          </span>
        </div>
        <div ref={containerRef} className="flex-1 flex flex-col" style={{ gap: 4 }}>
          {/* Main bar + deficit */}
          <div className="flex" style={{ height: BAR_H, gap: `${ITEM_GAP}px` }}>
            <div
              className="relative overflow-hidden"
              style={{ width: revMainW, height: BAR_H, backgroundColor: BLUE, borderRadius: 1 }}
            >
              {textFits(revenue.total, revMainW) && (
                <span
                  className="absolute inset-0 flex items-center justify-center text-white font-mono font-bold leading-none"
                  style={{ fontSize: 11, padding: `0 ${TEXT_PAD}px` }}
                >
                  ${revenue.total}B
                </span>
              )}
            </div>
            <BarSegment
              width={deficitMainW}
              color={DEFICIT_GRAY}
              label="Deficit"
              amount={deficit}
              onHover={handleHover}
              onLeave={() => setTooltip(null)}
            />
          </div>
          {/* Breakdown */}
          <div className="flex" style={{ height: BAR_H, gap: `${ITEM_GAP}px` }}>
            {revBreakdown.map((seg) => (
              <BarSegment
                key={seg.label}
                width={seg.w}
                color={BLUE}
                label={seg.label}
                amount={seg.amount}
                onHover={handleHover}
                onLeave={() => setTooltip(null)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Gap */}
      <div style={{ height: ROW_GAP }} />

      {/* Expenditure */}
      <div className="flex flex-col md:flex-row md:items-center" style={{ gap: 8 }}>
        <div className="flex items-baseline gap-2 md:block shrink-0 md:w-[80px]">
          <span className="text-[11px] font-mono font-bold" style={{ color: RED }}>
            Expenditures
          </span>
        </div>
        <div className="flex-1 flex flex-col" style={{ gap: 4 }}>
          {/* Main bar */}
          <div
            className="relative overflow-hidden"
            style={{ width: "100%", height: BAR_H, backgroundColor: RED, borderRadius: 1 }}
          >
            {textFits(spending.total, containerW) && (
              <span
                className="absolute inset-0 flex items-center justify-center text-white font-mono font-bold leading-none"
                style={{ fontSize: 11, padding: `0 ${TEXT_PAD}px` }}
              >
                ${spending.total}B
              </span>
            )}
          </div>
          {/* Breakdown */}
          <div className="flex" style={{ height: BAR_H, gap: `${ITEM_GAP}px` }}>
            {expBreakdown.map((seg) => (
              <BarSegment
                key={seg.label}
                width={seg.w}
                color={RED}
                label={seg.label}
                amount={seg.amount}
                onHover={handleHover}
                onLeave={() => setTooltip(null)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none px-2 py-1 rounded text-[10px] font-mono text-white whitespace-nowrap z-10"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translateX(-50%)",
            backgroundColor: "#1e293b",
          }}
        >
          {tooltip.label}: ${tooltip.amount.toFixed(1)}B
        </div>
      )}
    </div>
  );
}

export default function CanadaSpendsWidget({ project }: WidgetProps) {
  return (
    <div className="p-5 h-full flex flex-col gap-3">
      {/* Header */}
      <div>
        <span className="type-label font-bold text-[10px] text-[var(--color-text-secondary)]">
          {project.title}
        </span>
        <p className="type-heading text-[17px] text-[var(--color-dark)] mt-1">
          Diving into Government Financials
        </p>
        {project.description && (
          <p className="type-caption text-[var(--color-text-secondary)] mt-0.5">
            {project.description}
          </p>
        )}
      </div>

      {/* Sankey */}
      <SankeyDiagram />

      <p className="text-[9px] font-mono text-[var(--color-text-secondary)] opacity-60 text-right mt-auto">
        Source: canadaspends.com
      </p>
    </div>
  );
}
