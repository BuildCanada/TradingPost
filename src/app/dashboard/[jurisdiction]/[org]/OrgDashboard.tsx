"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bounds,
  createTestDataset,
  DimensionProperty,
  GRAPHER_CHART_TYPES,
  Grapher,
  GrapherState,
  legacyToChartsTableAndDimensionsWithMandatorySlug,
} from "@buildcanada/charts";
import type { MeasureWithFacts } from "./types";
import type { KPIFact, KPIValueType } from "@/lib/api/kpis";

type ChartTypeKey = "LineChart" | "DiscreteBar";

const CHART_TYPES: { key: ChartTypeKey; label: string }[] = [
  { key: "LineChart", label: "Line" },
  { key: "DiscreteBar", label: "Bar (latest year)" },
];

const VALUE_TYPE_ORDER: KPIValueType[] = [
  "actual",
  "target",
  "projected",
  "plan",
  "budget",
];

const VALUE_TYPE_ENTITY_IDS: Record<KPIValueType, number> = {
  actual: 900001,
  target: 900002,
  projected: 900003,
  plan: 900004,
  budget: 900005,
};

const VALUE_TYPE_LABELS: Record<KPIValueType, string> = {
  actual: "Actual",
  target: "Target",
  projected: "Projected",
  plan: "Plan",
  budget: "Budget",
};

function buildGrapherState(
  item: MeasureWithFacts,
  bounds: Bounds,
  chartType: ChartTypeKey,
): GrapherState | null {
  const numericFacts = item.facts.filter(
    (f) => f.value_numeric !== null && f.period_basis === "full_year",
  );
  if (numericFacts.length === 0) return null;

  const presentTypes = Array.from(
    new Set(numericFacts.map((f) => f.value_type)),
  );
  const orderedTypes = VALUE_TYPE_ORDER.filter((t) => presentTypes.includes(t));

  // Synthetic single indicator id — Grapher requires a numeric variableId.
  const variableId = item.measure.id || 1;

  const data = numericFacts.map((f) => ({
    year: f.measurement_year,
    entity: {
      id: VALUE_TYPE_ENTITY_IDS[f.value_type] ?? 900099,
      code: f.value_type,
      name: VALUE_TYPE_LABELS[f.value_type] ?? f.value_type,
    },
    value: f.value_numeric as number,
  }));

  const metadata = {
    id: variableId,
    display: {
      name: item.measure.canonical_name,
      unit: item.measure.unit.base_unit,
      shortUnit: item.measure.unit.symbol,
      numDecimalPlaces: pickDecimals(numericFacts),
    },
  };

  const dimensions = [{ variableId, property: DimensionProperty.y }];

  const grapherState = new GrapherState({
    bounds,
    chartTypes: [GRAPHER_CHART_TYPES[chartType]],
    selectedEntityNames: orderedTypes.map((t) => VALUE_TYPE_LABELS[t]),
    dimensions,
  });

  grapherState.inputTable = legacyToChartsTableAndDimensionsWithMandatorySlug(
    createTestDataset([{ data, metadata }]),
    dimensions,
    {},
  );

  return grapherState;
}

function pickDecimals(facts: KPIFact[]): number {
  const sample = facts.find((f) => f.value_numeric !== null)?.value_numeric;
  if (sample === undefined || sample === null) return 2;
  const abs = Math.abs(sample);
  if (abs >= 1000) return 0;
  if (abs >= 10) return 1;
  return 2;
}

function rangeLabel(item: MeasureWithFacts): string {
  const years = item.facts
    .map((f) => f.measurement_year)
    .filter((y, i, arr) => arr.indexOf(y) === i)
    .sort((a, b) => a - b);
  if (years.length === 0) return "—";
  if (years.length === 1) return String(years[0]);
  return `${years[0]}–${years[years.length - 1]}`;
}

export default function OrgDashboard({ items }: { items: MeasureWithFacts[] }) {
  const [selectedId, setSelectedId] = useState<number>(items[0]?.measure.id);
  const [chartType, setChartType] = useState<ChartTypeKey>("LineChart");
  const [size, setSize] = useState({ width: 800, height: 520 });

  useEffect(() => {
    const onResize = () => {
      const w = Math.min(900, Math.max(360, window.innerWidth - 64));
      const h = Math.max(380, Math.min(560, Math.round(w * 0.62)));
      setSize({ width: w, height: h });
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const selected = useMemo(
    () => items.find((i) => i.measure.id === selectedId) ?? items[0],
    [items, selectedId],
  );

  const grapherState = useMemo(() => {
    if (!selected) return null;
    return buildGrapherState(
      selected,
      new Bounds(0, 0, size.width, size.height),
      chartType,
    );
  }, [selected, size.width, size.height, chartType]);

  if (!selected) return null;

  const categories = Array.from(
    new Set(items.map((i) => i.measure.service_category ?? "Other")),
  ).sort();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="lg:max-h-[640px] lg:overflow-y-auto">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Measures
        </h2>
        <div className="space-y-4">
          {categories.map((cat) => {
            const inCat = items.filter(
              (i) => (i.measure.service_category ?? "Other") === cat,
            );
            return (
              <div key={cat}>
                <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                  {cat}
                </div>
                <ul className="space-y-1">
                  {inCat.map((i) => (
                    <li key={i.measure.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(i.measure.id)}
                        className={
                          "w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors " +
                          (i.measure.id === selected.measure.id
                            ? "bg-gray-900 text-white"
                            : "text-gray-800 hover:bg-gray-100")
                        }
                      >
                        {i.measure.canonical_name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </aside>

      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              {selected.measure.canonical_name}
            </h2>
            <p className="text-xs text-gray-500">
              {selected.measure.unit.symbol} · {rangeLabel(selected)}
              {selected.measure.service_category
                ? ` · ${selected.measure.service_category}`
                : ""}
            </p>
          </div>
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

        <div
          className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm"
          style={{ width: size.width, height: size.height }}
        >
          {grapherState ? (
            <Grapher grapherState={grapherState} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              No numeric data for this measure.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
