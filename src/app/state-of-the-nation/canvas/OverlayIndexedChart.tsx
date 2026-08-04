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
import { daysSinceGrapherEpoch } from "../IndicatorChart";
import { useChartSize } from "../useChartSize";
import type { OverlaySeries } from "./overlay-types";

// Indexed overlay — every feed rebased to 100 at a shared point, so series in
// different units share one y-axis and Grapher can render them together.
// Raw mode can't come here: it needs one axis per unit, and Grapher has a
// single yAxis by design (see OverlayChart.tsx).

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

// Grapher keys series by entity name, so two feeds resolving to the same label
// (the same indicator and jurisdiction picked twice) would collapse into one.
function uniqueLabels(series: OverlaySeries[]): string[] {
  const seen = new Map<string, number>();
  return series.map((s) => {
    const count = seen.get(s.label) ?? 0;
    seen.set(s.label, count + 1);
    return count === 0 ? s.label : `${s.label} (${count + 1})`;
  });
}

function buildGrapherState(
  series: OverlaySeries[],
  bounds: Bounds,
): { state: GrapherState; baseYear: number | null } | null {
  const baseYear = firstSharedYear(series);
  const labels = uniqueLabels(series);

  // Feeds can mix frequencies (an annual measure against a monthly one). A
  // Grapher column is either day-based or year-based for every entity in it,
  // so as soon as one feed carries ISO dates the whole chart moves onto the
  // day axis, with annual points pinned to January 1.
  const dated = series.some((s) => s.points.some((p) => p.date));
  const time = (p: { year: number; date?: string }) =>
    dated
      ? daysSinceGrapherEpoch(p.date ?? `${Math.round(p.year)}-01-01`)
      : p.year;

  const data = series.flatMap((s, idx) => {
    const base =
      (baseYear !== null
        ? s.points.find((p) => p.year === baseYear)?.value
        : undefined) ?? s.points[0]?.value;
    // A zero or missing base can't be rebased; drop the feed rather than
    // emitting Infinity across the axis.
    if (!base) return [];
    const entity = { id: idx + 1, code: `F${idx + 1}`, name: labels[idx] };
    return s.points.map((p) => ({
      year: time(p),
      entity,
      value: (p.value / base) * 100,
    }));
  });
  if (data.length === 0) return null;

  const variableId = 1;
  const dimensions = [{ variableId, property: DimensionProperty.y }];

  const metadata = {
    id: variableId,
    display: {
      name:
        baseYear !== null
          ? `Index (${baseYear} = 100)`
          : "Index (first year = 100)",
      unit: "",
      shortUnit: "",
      numDecimalPlaces: 1,
      ...(dated ? { yearIsDay: true } : {}),
    },
    // Each feed carries its own source; the canvas credits them in the
    // controls beneath the chart rather than in a single chart footer.
    origins: [],
  };

  const entityColors = Object.fromEntries(
    series.map((s, idx) => [labels[idx], s.color]),
  );

  const state = new GrapherState({
    bounds,
    isEmbeddedInPage: true,
    chartTypes: [GRAPHER_CHART_TYPES.LineChart],
    selectedEntityNames: labels,
    selectedEntityColors: entityColors,
    dimensions,
  });

  state.entityType = "series";
  // Unlike the indicator charts there is no headline series here — every feed
  // is equally the subject, so none are focused and all render at full colour.
  state.variant = "uncaptioned" as typeof state.variant;

  state.inputTable = legacyToChartsTableAndDimensionsWithMandatorySlug(
    createTestDataset([{ data, metadata }]),
    dimensions,
    entityColors,
  );

  return { state, baseYear };
}

export default function OverlayIndexedChart({
  series,
}: {
  series: OverlaySeries[];
}) {
  const { containerRef, size } = useChartSize();

  const built = useMemo(
    () => buildGrapherState(series, new Bounds(0, 0, size.width, size.height)),
    [series, size.width, size.height],
  );

  return (
    // Grapher's uncaptioned variant draws from a padded origin inside a
    // viewBox starting at 0,0 — the bottom axis and right-edge labels clip
    // unless the svg can overflow.
    <div
      ref={containerRef}
      className="border border-border-light bg-bg p-3 [&_svg]:overflow-visible"
    >
      {built ? (
        <div style={{ width: size.width, height: size.height }}>
          <Grapher grapherState={built.state} />
        </div>
      ) : (
        <div className="flex h-[480px] items-center justify-center">
          <p className="type-body text-dark/60">
            These feeds can&rsquo;t be indexed — try raw values.
          </p>
        </div>
      )}
    </div>
  );
}
