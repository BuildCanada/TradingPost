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
import type { OverlaySeries } from "./overlay-types";
import { formatEditorialMonth } from "@/lib/date-format";

// Raw-value overlay: one y-axis per feed, because feeds carry different units
// (a rate against a dollar figure against a count). This is the one canvas
// mode @buildcanada/charts can't render — Grapher has a single yAxis, and its
// faceting alternative splits the feeds into separate panels, which defeats
// the point of overlaying them. Indexed mode is on Grapher; see
// OverlayIndexedChart.tsx.

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Tooltip,
  Legend,
);

function formatMonth(isoDate: string): string {
  return formatEditorialMonth(isoDate);
}

export default function OverlayChart({ series }: { series: OverlaySeries[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const datasets = series.map((s, i) => ({
      label: s.label,
      data: s.points.map((p) => ({
        x: p.year,
        y: p.value,
        raw: p.value,
        date: p.date,
      })),
      borderColor: s.color,
      backgroundColor: s.color,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2,
      tension: 0.15,
      yAxisID: `y${i}`,
    }));

    const rawAxes = Object.fromEntries(
      series.map((s, i) => [
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
      ]),
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
          ...rawAxes,
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
                return `${s.label}: ${formatValue(raw, s.unitSymbol)}`;
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
  }, [series]);

  return (
    <div className="h-[480px] border border-border-light bg-bg p-3">
      <canvas ref={canvasRef} />
    </div>
  );
}
