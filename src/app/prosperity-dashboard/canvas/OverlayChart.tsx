"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Tooltip,
  Legend,
} from "chart.js";
import { axisLabel, formatValue } from "../units";
import type { OverlaySeries, OverlayMode } from "./overlay-types";

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Tooltip,
  Legend,
);

const MONTH_FORMAT = new Intl.DateTimeFormat("en-CA", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatMonth(isoDate: string): string {
  return MONTH_FORMAT.format(new Date(isoDate));
}

// The first year present in every series, so indexed mode rebases all series
// to a shared point. Falls back to each series' own first year when the
// series never overlap.
function firstSharedYear(series: OverlaySeries[]): number | null {
  if (series.length === 0) return null;
  const shared = series
    .map((s) => new Set(s.points.map((p) => p.year)))
    .reduce((acc, years) => new Set([...acc].filter((y) => years.has(y))));
  if (shared.size === 0) return null;
  return Math.min(...shared);
}

export default function OverlayChart({
  series,
  mode,
}: {
  series: OverlaySeries[];
  mode: OverlayMode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const baseYear = mode === "indexed" ? firstSharedYear(series) : null;

    const datasets = series.map((s, i) => {
      const base =
        baseYear !== null
          ? (s.points.find((p) => p.year === baseYear)?.value ??
            s.points[0]?.value)
          : s.points[0]?.value;

      return {
        label: s.label,
        data: s.points.map((p) => ({
          x: p.year,
          y:
            mode === "indexed" && base
              ? (p.value / base) * 100
              : p.value,
          raw: p.value,
          date: p.date,
        })),
        borderColor: s.color,
        backgroundColor: s.color,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
        tension: 0.15,
        yAxisID: mode === "raw" ? `y${i}` : "y",
      };
    });

    const rawAxes = Object.fromEntries(
      mode === "raw"
        ? series.map((s, i) => [
            `y${i}`,
            {
              type: "linear" as const,
              position: i === 0 ? ("left" as const) : ("right" as const),
              title: {
                display: true,
                text: axisLabel(s.unitSymbol),
                color: s.color,
              },
              ticks: { color: s.color },
              grid: { drawOnChartArea: i === 0 },
            },
          ])
        : [],
    );

    chartRef.current?.destroy();
    chartRef.current = new ChartJS(canvas, {
      type: "line",
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "nearest", axis: "x", intersect: false },
        scales: {
          x: {
            type: "linear",
            ticks: { callback: (v) => String(v), precision: 0 },
            grid: { display: false },
          },
          ...(mode === "indexed"
            ? {
                y: {
                  type: "linear" as const,
                  title: {
                    display: true,
                    text:
                      baseYear !== null
                        ? `Index (${baseYear} = 100)`
                        : "Index (first year = 100)",
                  },
                },
              }
            : rawAxes),
        },
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 12 } },
          tooltip: {
            callbacks: {
              // Monthly points carry an ISO date; annual points show the year.
              title: (items) => {
                const raw = items[0]?.raw as { date?: string } | undefined;
                if (raw?.date) return formatMonth(raw.date);
                return String(items[0]?.parsed.x ?? "");
              },
              label: (item) => {
                const s = series[item.datasetIndex];
                const raw = (item.raw as { raw: number }).raw;
                const formatted = formatValue(raw, s.unitSymbol);
                if (mode === "indexed") {
                  const indexed = item.parsed.y ?? 0;
                  return `${s.label}: ${indexed.toFixed(1)} (${formatted})`;
                }
                return `${s.label}: ${formatted}`;
              },
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [series, mode]);

  return (
    <div className="h-[480px] border border-border-light bg-bg p-3">
      <canvas ref={canvasRef} />
    </div>
  );
}
