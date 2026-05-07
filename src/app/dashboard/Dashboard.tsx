"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Grapher,
  GrapherState,
  Bounds,
  GRAPHER_CHART_TYPES,
  LifeExpectancyGrapher,
} from "@buildcanada/charts";

type ChartTypeKey = "LineChart" | "DiscreteBar" | "StackedArea" | "SlopeChart";

const CHART_TYPES: { key: ChartTypeKey; label: string }[] = [
  { key: "LineChart", label: "Line" },
  { key: "DiscreteBar", label: "Discrete Bar" },
  { key: "StackedArea", label: "Stacked Area" },
  { key: "SlopeChart", label: "Slope" },
];

const ENTITY_PRESETS: { label: string; entities: string[] }[] = [
  {
    label: "G7 (sample)",
    entities: ["Canada", "United States", "Germany", "Japan"],
  },
  {
    label: "Americas",
    entities: ["Canada", "United States", "Brazil", "Mexico"],
  },
  {
    label: "Asia",
    entities: ["Japan", "China", "India", "Korea"],
  },
];

export default function Dashboard() {
  const [chartType, setChartType] = useState<ChartTypeKey>("LineChart");
  const [presetIndex, setPresetIndex] = useState(0);
  const [size, setSize] = useState({ width: 1100, height: 660 });

  const grapherState = useMemo(() => {
    const state: GrapherState = LifeExpectancyGrapher({
      bounds: new Bounds(0, 0, size.width, size.height),
      chartTypes: [GRAPHER_CHART_TYPES[chartType]],
      selectedEntityNames: ENTITY_PRESETS[presetIndex].entities,
    });
    return state;
  }, [chartType, presetIndex, size.width, size.height]);

  useEffect(() => {
    const onResize = () => {
      const w = Math.min(1100, window.innerWidth - 64);
      const h = Math.max(420, Math.min(660, Math.round(w * 0.6)));
      setSize({ width: w, height: h });
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Sample data rendered with the @buildcanada/charts Grapher. Switch
          chart type or country group to verify interactivity.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Chart type:
          </span>
          <div className="inline-flex rounded-md border border-gray-200 bg-white shadow-sm">
            {CHART_TYPES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setChartType(t.key)}
                className={
                  "px-3 py-1.5 text-sm transition-colors first:rounded-l-md last:rounded-r-md " +
                  (chartType === t.key
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100")
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Entities:</span>
          <select
            value={presetIndex}
            onChange={(e) => setPresetIndex(Number(e.target.value))}
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm shadow-sm"
          >
            {ENTITY_PRESETS.map((p, i) => (
              <option key={p.label} value={i}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm"
        style={{ width: size.width, height: size.height }}
      >
        <Grapher grapherState={grapherState} />
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Try hovering, clicking the legend, or switching tabs in the chart
        toolbar to confirm interactivity.
      </p>
    </div>
  );
}
