"use client";

import { useMemo } from "react";
import {
  Bounds,
  createTestDataset,
  DimensionProperty,
  GRAPHER_CHART_TYPES,
  Grapher,
  GrapherState,
  legacyToChartsTableAndDimensionsWithMandatorySlug,
} from "@buildcanada/charts";
import {
  humanizeSourceName,
  type EconomySeriesResponse,
} from "@/lib/api/economy";
import {
  BENCHMARK_COLOR,
  CANADA_COLOR,
  type IndicatorBenchmark,
} from "./indicators";
import { displayUnit } from "./units";
import { useChartSize } from "./useChartSize";

const ENTITY_COLORS = { Canada: CANADA_COLOR };

// Grapher represents sub-annual time as integer days since its epoch date
// (EPOCH_DATE in @buildcanada/charts) on a column flagged yearIsDay — the
// OWID convention for daily/monthly series.
const GRAPHER_EPOCH_MS = Date.UTC(2020, 0, 21);
const DAY_MS = 86_400_000;

export function daysSinceGrapherEpoch(isoDate: string): number {
  return Math.round((Date.parse(isoDate) - GRAPHER_EPOCH_MS) / DAY_MS);
}

// Benchmark values compound through the anchor point; `year` is fractional
// for monthly points, so the line stays smooth between Januaries.
export function benchmarkValue(
  benchmark: IndicatorBenchmark,
  year: number,
): number {
  return (
    benchmark.anchorValue *
    Math.pow(1 + benchmark.annualRatePct / 100, year - benchmark.anchorYear)
  );
}

function buildGrapherState(
  response: EconomySeriesResponse,
  bounds: Bounds,
  benchmark?: IndicatorBenchmark,
): GrapherState | null {
  const { measure, series } = response.data;
  const { source } = response.meta;
  const monthly = measure.frequency === "monthly";

  const data = series.flatMap((s, idx) =>
    s.points.map((p) => ({
      year: monthly && p.date ? daysSinceGrapherEpoch(p.date) : p.year,
      entity: { id: idx + 1, code: s.jurisdiction.code, name: s.jurisdiction.name },
      value: p.value,
    })),
  );
  if (data.length === 0) return null;

  if (benchmark) {
    // One benchmark point per time in the longest series, so the reference
    // line spans exactly the observed range.
    const longest = series.reduce((a, b) =>
      b.points.length > a.points.length ? b : a,
    );
    const entity = {
      id: series.length + 1,
      code: "TARGET",
      name: benchmark.label,
    };
    data.push(
      ...longest.points.map((p) => ({
        year: monthly && p.date ? daysSinceGrapherEpoch(p.date) : p.year,
        entity,
        value: benchmarkValue(benchmark, p.year),
      })),
    );
  }

  const variableId = 1;
  const dimensions = [{ variableId, property: DimensionProperty.y }];

  const metadata = {
    id: variableId,
    display: {
      name: measure.name,
      ...displayUnit(measure.unit),
      ...(monthly ? { yearIsDay: true } : {}),
    },
    origins: source
      ? [
          {
            id: 1,
            title: humanizeSourceName(source.name),
            urlMain: source.url ?? undefined,
            datePublished: source.last_fetched_at ?? undefined,
          },
        ]
      : [],
  };

  const entityColors = benchmark
    ? { ...ENTITY_COLORS, [benchmark.label]: BENCHMARK_COLOR }
    : ENTITY_COLORS;
  const selectedEntityNames = [
    ...series.map((s) => s.jurisdiction.name),
    ...(benchmark ? [benchmark.label] : []),
  ];

  const grapherState = new GrapherState({
    bounds,
    // Fill the available bounds exactly instead of scaling to Grapher's
    // ideal 680x480 aspect ratio.
    isEmbeddedInPage: true,
    chartTypes: [GRAPHER_CHART_TYPES.LineChart],
    selectedEntityNames,
    selectedEntityColors: entityColors,
    dimensions,
  });

  grapherState.entityType = "country";
  // Emphasize Canada; the other series render muted until hovered.
  grapherState.focusedSeriesNames = ["Canada"];
  grapherState.focusArray.clearAllAndAdd("Canada");
  // Chart area only — no header (title/logo), tabs, entity selector,
  // timeline, or footer (data source, download, full-screen). The enum
  // isn't re-exported from the package root, hence the cast.
  grapherState.variant = "uncaptioned" as typeof grapherState.variant;

  grapherState.inputTable = legacyToChartsTableAndDimensionsWithMandatorySlug(
    createTestDataset([{ data, metadata }]),
    dimensions,
    entityColors,
  );

  return grapherState;
}

export default function IndicatorChart({
  response,
  benchmark,
}: {
  response: EconomySeriesResponse;
  benchmark?: IndicatorBenchmark;
}) {
  const { containerRef, size } = useChartSize();

  const grapherState = useMemo(
    () =>
      buildGrapherState(
        response,
        new Bounds(0, 0, size.width, size.height),
        benchmark,
      ),
    [response, size.width, size.height, benchmark],
  );

  return (
    // In the uncaptioned variant, Grapher draws chart content at the padded
    // origin (24,24) inside an svg whose viewBox starts at 0,0 — the bottom
    // axis and right-edge labels get clipped unless the svg can overflow.
    <div
      ref={containerRef}
      className="border border-border-light bg-bg p-2 [&_svg]:overflow-visible"
    >
      {grapherState ? (
        <div style={{ width: size.width, height: size.height }}>
          <Grapher grapherState={grapherState} />
        </div>
      ) : (
        <div className="flex h-[360px] items-center justify-center">
          <p className="type-body text-dark/60">
            No data available for this indicator.
          </p>
        </div>
      )}
    </div>
  );
}
