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
import type {
  KPICitation,
  KPIFact,
  KPIMeasure,
  KPIValueType,
} from "@/lib/api/kpis";

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

function pickDecimals(facts: KPIFact[]): number {
  const sample = facts.find((f) => f.value_numeric !== null)?.value_numeric;
  if (sample === undefined || sample === null) return 2;
  const abs = Math.abs(sample);
  if (abs >= 1000) return 0;
  if (abs >= 10) return 1;
  return 2;
}

interface DocAggregate {
  id: number;
  doc_title: string;
  doc_url: string;
  published_at: string | null;
  fiscal_year: number | null;
  years: Set<number>;
  pages: Set<number>;
}

function aggregateDocs(citations: KPICitation[]): DocAggregate[] {
  const byDoc = new Map<number, DocAggregate>();
  for (const c of citations) {
    const docId = c.document.id;
    let entry = byDoc.get(docId);
    if (!entry) {
      entry = {
        id: docId,
        doc_title: c.document.doc_title,
        doc_url: c.document.doc_url,
        published_at: c.document.published_at,
        fiscal_year: c.document.fiscal_year,
        years: new Set(),
        pages: new Set(),
      };
      byDoc.set(docId, entry);
    }
    entry.years.add(c.measurement_year);
    if (c.source_page != null) entry.pages.add(c.source_page);
  }
  return Array.from(byDoc.values()).sort((a, b) => {
    const ad = a.published_at ?? "";
    const bd = b.published_at ?? "";
    if (ad !== bd) return bd.localeCompare(ad);
    return (b.fiscal_year ?? 0) - (a.fiscal_year ?? 0);
  });
}

function buildSourceDesc(
  measure: KPIMeasure,
  docs: DocAggregate[],
): string {
  if (docs.length === 0) return "";

  const fiscalYears = docs
    .map((d) => d.fiscal_year)
    .filter((y): y is number => y != null);
  const fySpan =
    fiscalYears.length === 0
      ? ""
      : Math.min(...fiscalYears) === Math.max(...fiscalYears)
        ? `FY ${fiscalYears[0]}`
        : `FY ${Math.min(...fiscalYears)}–${Math.max(...fiscalYears)}`;

  const producer = measure.organization?.canonical_name ?? "";

  if (docs.length === 1) {
    const parts = [docs[0].doc_title, fySpan].filter(Boolean);
    return parts.join(" · ");
  }

  // Multiple source documents — collapse to a producer + range summary so the
  // footer line stays readable. Individual titles live in the Sources tab.
  const parts = [
    producer,
    `${docs.length} source documents`,
    fySpan,
  ].filter(Boolean);
  return parts.join(" · ");
}

function buildGrapherState(
  measure: KPIMeasure,
  facts: KPIFact[],
  citations: KPICitation[],
  bounds: Bounds,
  chartType: ChartTypeKey,
): GrapherState | null {
  const numericFacts = facts.filter(
    (f) => f.value_numeric !== null && f.period_basis === "full_year",
  );
  if (numericFacts.length === 0) return null;

  const presentTypes = Array.from(
    new Set(numericFacts.map((f) => f.value_type)),
  );
  const orderedTypes = VALUE_TYPE_ORDER.filter((t) => presentTypes.includes(t));
  const variableId = measure.id || 1;

  const data = numericFacts.map((f) => ({
    year: f.measurement_year,
    entity: {
      id: VALUE_TYPE_ENTITY_IDS[f.value_type] ?? 900099,
      code: f.value_type,
      name: VALUE_TYPE_LABELS[f.value_type] ?? f.value_type,
    },
    value: f.value_numeric as number,
  }));

  const docs = aggregateDocs(citations);
  const origins = docs.map((d) => ({
    id: d.id,
    title: d.doc_title,
    producer: measure.organization?.canonical_name,
    urlMain: d.doc_url,
    datePublished: d.published_at ?? undefined,
    attribution:
      d.fiscal_year != null
        ? `${measure.organization?.canonical_name ?? ""}, FY ${d.fiscal_year}`.trim()
        : (measure.organization?.canonical_name ?? undefined),
    citationFull:
      d.pages.size > 0
        ? `${d.doc_title} (pp. ${Array.from(d.pages)
            .sort((a, b) => a - b)
            .join(", ")})`
        : d.doc_title,
  }));

  const metadata = {
    id: variableId,
    display: {
      name: measure.canonical_name,
      unit: measure.unit.base_unit,
      shortUnit: measure.unit.symbol,
      numDecimalPlaces: pickDecimals(numericFacts),
    },
    origins,
  };

  const dimensions = [{ variableId, property: DimensionProperty.y }];

  const grapherState = new GrapherState({
    bounds,
    chartTypes: [GRAPHER_CHART_TYPES[chartType]],
    selectedEntityNames: orderedTypes.map((t) => VALUE_TYPE_LABELS[t]),
    dimensions,
  });

  const sourceDesc = buildSourceDesc(measure, docs);
  if (sourceDesc) grapherState.sourceDesc = sourceDesc;
  if (docs[0]?.doc_url) grapherState.originUrl = docs[0].doc_url;

  grapherState.inputTable = legacyToChartsTableAndDimensionsWithMandatorySlug(
    createTestDataset([{ data, metadata }]),
    dimensions,
    {},
  );

  return grapherState;
}

export default function MeasureChart({
  measure,
  facts,
  citations,
}: {
  measure: KPIMeasure;
  facts: KPIFact[];
  citations: KPICitation[];
}) {
  const [chartType, setChartType] = useState<ChartTypeKey>("LineChart");
  const [size, setSize] = useState({ width: 800, height: 520 });

  useEffect(() => {
    const onResize = () => {
      const w = Math.min(900, Math.max(360, window.innerWidth - 360));
      const h = Math.max(380, Math.min(560, Math.round(w * 0.62)));
      setSize({ width: w, height: h });
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const grapherState = useMemo(
    () =>
      buildGrapherState(
        measure,
        facts,
        citations,
        new Bounds(0, 0, size.width, size.height),
        chartType,
      ),
    [measure, facts, citations, size.width, size.height, chartType],
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-end gap-3">
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
    </div>
  );
}
