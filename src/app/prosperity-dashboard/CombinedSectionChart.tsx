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
import { benchmarkValue, daysSinceGrapherEpoch } from "./IndicatorChart";
import { displayUnit } from "./units";
import { useChartSize } from "./useChartSize";

// Overlays one section's indicators as lines on a single chart — one entity
// per measure instead of one per jurisdiction. Assumes every item shares the
// same unit and frequency (e.g. the Cost of Living CPI components), and that
// each measure is Canada-only or that its Canada series is the one to show.
export type CombinedChartItem = {
  label: string;
  response: EconomySeriesResponse;
};

function buildGrapherState(
  heading: string,
  items: CombinedChartItem[],
  bounds: Bounds,
  benchmark?: IndicatorBenchmark,
): GrapherState | null {
  const first = items[0]?.response;
  if (!first) return null;
  const monthly = first.data.measure.frequency === "monthly";
  const { source } = first.meta;

  const itemSeries = items.map(
    (item) =>
      item.response.data.series.find((s) => s.jurisdiction.slug === "ca") ??
      item.response.data.series[0],
  );

  const data = items.flatMap((item, idx) => {
    const series = itemSeries[idx];
    if (!series) return [];
    return series.points.map((p) => ({
      year: monthly && p.date ? daysSinceGrapherEpoch(p.date) : p.year,
      entity: { id: idx + 1, code: item.label, name: item.label },
      value: p.value,
    }));
  });
  if (data.length === 0) return null;

  if (benchmark) {
    // One benchmark point per time in the longest series, so the reference
    // line spans exactly the observed range.
    const longest = itemSeries
      .filter((s) => s !== undefined)
      .reduce((a, b) => (b.points.length > a.points.length ? b : a));
    const entity = {
      id: items.length + 1,
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
      name: heading,
      ...displayUnit(first.data.measure.unit),
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

  // Emphasize the first item (the section's headline series) in brand red;
  // the component lines render in Grapher's palette, muted until hovered.
  const headlineLabel = items[0].label;
  const entityColors: Record<string, string> = {
    [headlineLabel]: CANADA_COLOR,
    ...(benchmark ? { [benchmark.label]: BENCHMARK_COLOR } : {}),
  };
  const selectedEntityNames = [
    ...items.map((item) => item.label),
    ...(benchmark ? [benchmark.label] : []),
  ];

  const grapherState = new GrapherState({
    bounds,
    isEmbeddedInPage: true,
    chartTypes: [GRAPHER_CHART_TYPES.LineChart],
    selectedEntityNames,
    selectedEntityColors: entityColors,
    dimensions,
  });

  grapherState.entityType = "series";
  grapherState.focusedSeriesNames = [headlineLabel];
  grapherState.focusArray.clearAllAndAdd(headlineLabel);
  grapherState.variant = "uncaptioned" as typeof grapherState.variant;

  grapherState.inputTable = legacyToChartsTableAndDimensionsWithMandatorySlug(
    createTestDataset([{ data, metadata }]),
    dimensions,
    entityColors,
  );

  return grapherState;
}

export default function CombinedSectionChart({
  heading,
  items,
  benchmark,
}: {
  heading: string;
  items: CombinedChartItem[];
  benchmark?: IndicatorBenchmark;
}) {
  const { containerRef, size } = useChartSize();

  const grapherState = useMemo(
    () =>
      buildGrapherState(
        heading,
        items,
        new Bounds(0, 0, size.width, size.height),
        benchmark,
      ),
    [heading, items, size.width, size.height, benchmark],
  );

  return (
    <div
      ref={containerRef}
      className="-mx-3 sm:mx-0 border border-border-light bg-bg p-2 [&_svg]:overflow-visible"
    >
      {grapherState ? (
        <div style={{ width: size.width, height: size.height }}>
          <Grapher grapherState={grapherState} />
        </div>
      ) : (
        <div className="flex h-[360px] items-center justify-center">
          <p className="type-body text-dark/60">
            No data available for this chart.
          </p>
        </div>
      )}
    </div>
  );
}
