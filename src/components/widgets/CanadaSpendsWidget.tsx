"use client";

import { useState, useRef, useEffect } from "react";
import { WidgetProps } from "./types";
import WidgetHeader from "./WidgetHeader";

const BLUE = "var(--color-lake-700)";
const RED = "var(--color-auburn-800)";
const DEFICIT_GRAY = "var(--color-charcoal-900)";

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
const ROW_GAP = 20;
const ITEM_GAP = 2;
const TEXT_PAD = 6;
const CHAR_W = 6.6;

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
  textColor = "white",
}: {
  width: number;
  color: string;
  label: string;
  amount: number;
  onHover: (e: React.MouseEvent, label: string, amount: number) => void;
  onLeave: () => void;
  textColor?: string;
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
          className={`absolute inset-0 flex items-center justify-center type-mono-sm font-bold leading-none`}
          style={{ padding: `0 ${TEXT_PAD}px`, color: textColor }}
        >
          ${amount.toFixed(1)}B
        </span>
      )}
    </div>
  );
}

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

  const mainGap = ITEM_GAP;
  const mainAvail = containerW - mainGap;
  const revMainW = (revenue.total / maxTotal) * mainAvail;
  const deficitMainW = mainAvail - revMainW;

  const revBreakdown = computeSegments(revenue.sources, revenue.total, revMainW);
  const expBreakdown = computeSegments(spending.categories, spending.total, containerW);

  return (
    <div className="relative" data-sankey onMouseLeave={() => setTooltip(null)}>
      <div className="flex flex-col lg:flex-row lg:items-center" style={{ gap: 8 }}>
          <div className="flex items-baseline gap-2 lg:block shrink-0 lg:w-[100px]">
            <span className="type-mono-sm font-bold" style={{ color: BLUE }}>
              Revenues
            </span>
          </div>
          <div ref={containerRef} className="flex-1 flex flex-col" style={{ gap: 4 }}>
          <div className="flex" style={{ height: BAR_H, gap: `${ITEM_GAP}px` }}>
            <div
              className="relative overflow-hidden"
              style={{ width: revMainW, height: BAR_H, backgroundColor: BLUE, borderRadius: 1 }}
            >
              {textFits(revenue.total, revMainW) && (
                <span
                  className="absolute inset-0 flex items-center justify-center text-white type-mono-sm font-bold leading-none"
                  style={{ padding: `0 ${TEXT_PAD}px` }}
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
          <div className="flex" style={{ height: BAR_H, gap: `${ITEM_GAP}px` }}>
            {revBreakdown.map((seg) => (
              <BarSegment
                key={seg.label}
                width={seg.w}
                color="var(--color-lake-200)"
                textColor="var(--color-charcoal-1000)"
                label={seg.label}
                amount={seg.amount}
                onHover={handleHover}
                onLeave={() => setTooltip(null)}
              />
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: ROW_GAP }} />

      <div className="flex flex-col lg:flex-row lg:items-center" style={{ gap: 8 }}>
          <div className="flex items-baseline gap-2 lg:block shrink-0 lg:w-[100px]">
            <span className="type-mono-sm font-bold" style={{ color: RED }}>
              Expenditures
            </span>
          </div>
          <div className="flex-1 flex flex-col" style={{ gap: 4 }}>
          <div
            className="relative overflow-hidden"
            style={{ width: "100%", height: BAR_H, backgroundColor: RED, borderRadius: 1 }}
          >
            {textFits(spending.total, containerW) && (
              <span
                className="absolute inset-0 flex items-center justify-center text-white type-mono-sm font-bold leading-none"
                style={{ padding: `0 ${TEXT_PAD}px` }}
              >
                ${spending.total}B
              </span>
            )}
          </div>
          <div className="flex" style={{ height: BAR_H, gap: `${ITEM_GAP}px` }}>
            {expBreakdown.map((seg) => (
              <BarSegment
                key={seg.label}
                width={seg.w}
                color="var(--color-auburn-300)"
                textColor="var(--color-charcoal-1000)"
                label={seg.label}
                amount={seg.amount}
                onHover={handleHover}
                onLeave={() => setTooltip(null)}
              />
            ))}
          </div>
        </div>
      </div>

      {tooltip && (
        <div
          className="absolute pointer-events-none px-2 py-1 rounded text-white type-mono-sm whitespace-nowrap z-10"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translateX(-50%)",
            backgroundColor: "var(--color-charcoal-1000)",
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
    <div className="p-8 lg:p-10 h-full flex flex-col gap-4">
      <WidgetHeader
        project={project}
        heading="Diving into Government Financials"
        description="Transparent data on how federal, provincial, and municipal governments spend your money."
      />

      <SankeyDiagram />

      <p className="type-mono-sm text-text-secondary text-right mt-auto pt-4">
        Source: canadaspends.com
      </p>
    </div>
  );
}
