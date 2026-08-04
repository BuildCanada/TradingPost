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
import { daysSinceGrapherEpoch } from "./IndicatorChart";
import { useChartSize } from "./useChartSize";
import type { ChartFmt, LineSpec, SeriesColor } from "./StateChart";

// Renders a State of the Nation LineSpec on @buildcanada/charts, so the
// landing page draws the same Grapher as the section pages. The spec stays
// the interchange format — every derivation in state-of-the-nation.ts is
// untouched; only the renderer changed.

// Grapher writes colours into SVG `stroke` attributes, where `var(--x)`
// doesn't resolve, so these are literals rather than the tokens the card
// furniture uses. `au` and `ink` mirror --color-auburn-800 and --color-dark
// as they resolve outside the .theme-toronto / .theme-election overrides,
// which State of the Nation never sits under; clay/stone/sand are the
// design's own values and have no token. Same approach as CANADA_COLOR in
// indicators.ts, which the section-page Graphers already use.
const SERIES_COLORS: Record<SeriesColor, string> = {
  au: "#932f2f",
  ink: "#272727",
  clay: "#c2724d",
  stone: "#8a8178",
  sand: "#c7bdb2",
};

// The spec's x values are fractional years (2020.5 = July 2020). Grapher wants
// either integer years or integer days since its epoch, so a chart carrying
// any sub-annual point moves wholesale onto the day axis.
function fractionalYearToDays(x: number): number {
  const year = Math.floor(x + 1e-9);
  const month = Math.min(11, Math.max(0, Math.round((x - year) * 12)));
  return daysSinceGrapherEpoch(
    new Date(Date.UTC(year, month, 1)).toISOString(),
  );
}

// The SVG renderer formatted tick labels itself; Grapher formats from the
// column's display config instead.
function displayForFmt(f: ChartFmt): {
  unit: string;
  shortUnit: string;
  numDecimalPlaces: number;
} {
  switch (f) {
    case "money":
      return { unit: "", shortUnit: "$", numDecimalPlaces: 0 };
    case "pct":
      return { unit: "", shortUnit: "%", numDecimalPlaces: 0 };
    case "pct1":
      return { unit: "", shortUnit: "%", numDecimalPlaces: 1 };
    case "x":
      return { unit: "", shortUnit: "×", numDecimalPlaces: 1 };
    case "num":
      return { unit: "", shortUnit: "", numDecimalPlaces: 1 };
    default:
      return { unit: "", shortUnit: "", numDecimalPlaces: 0 };
  }
}

// Grapher keys series by entity name, so two series sharing a legend label
// (or a spec with no legend at all) would collapse into one line.
function seriesLabels(spec: LineSpec): string[] {
  const seen = new Map<string, number>();
  return spec.series.map((_, i) => {
    const base = spec.legend?.[i]?.label ?? `Series ${i + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base} (${count + 1})`;
  });
}

function buildGrapherState(
  spec: LineSpec,
  bounds: Bounds,
): GrapherState | null {
  const labels = seriesLabels(spec);
  const dated = spec.series.some((s) =>
    s.xs.some((x) => Math.abs(x - Math.round(x)) > 1e-6),
  );
  const time = (x: number) => (dated ? fractionalYearToDays(x) : Math.round(x));

  const data = spec.series.flatMap((s, idx) => {
    const entity = { id: idx + 1, code: `S${idx + 1}`, name: labels[idx] };
    return s.points.map((value, i) => ({
      year: time(s.xs[i]),
      entity,
      value,
    }));
  });
  if (data.length === 0) return null;

  const variableId = 1;
  const dimensions = [{ variableId, property: DimensionProperty.y }];

  const metadata = {
    id: variableId,
    display: {
      name: "",
      ...displayForFmt(spec.fmt),
      ...(dated ? { yearIsDay: true } : {}),
    },
    // The page prints source attribution beneath each card already.
    origins: [],
  };

  const entityColors = Object.fromEntries(
    spec.series.map((s, idx) => [labels[idx], SERIES_COLORS[s.color]]),
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
  // The card renders the design's own mono legend above the plot, so Grapher's
  // end-of-line labels would duplicate it.
  state.hideLegend = true;
  state.variant = "uncaptioned" as typeof state.variant;

  // Every chart on the page shares one x window, so a horizontal position
  // means the same date on all of them — the property the hand-rolled SVG
  // got from passing xDomain straight through.
  state.xAxis.min = time(spec.xDomain[0]);
  state.xAxis.max = time(spec.xDomain[1]);

  // Frame the data rather than anchoring at zero, matching niceAxis in the
  // SVG version — otherwise a series that varies in a narrow band flattens
  // against a distant zero. The enum isn't re-exported from the package root.
  const auto = "auto" as unknown as number;
  state.yAxis.min = auto;
  state.yAxis.max = auto;

  // The declared baseline (e.g. an index's 100) drew as a floating rule in the
  // SVG; Grapher's comparison lines are the same idea and dash by default.
  if (spec.baseline !== undefined) {
    state.comparisonLines = [{ yEquals: String(spec.baseline) }];
  }

  state.inputTable = legacyToChartsTableAndDimensionsWithMandatorySlug(
    createTestDataset([{ data, metadata }]),
    dimensions,
    entityColors,
  );

  return state;
}

// The headline chart spans both grid columns, so it gets a panoramic plot
// rather than the column-width default — roughly the 1240x420 geometry the
// hand-rolled SVG used for wide cards.
const WIDE_SIZE = { maxWidth: 1440, aspectRatio: 0.34, maxHeight: 500 };

export default function StateChartPlot({
  spec,
  wide,
}: {
  spec: LineSpec;
  wide?: boolean;
}) {
  const { containerRef, size } = useChartSize(wide ? WIDE_SIZE : undefined);

  const grapherState = useMemo(
    () => buildGrapherState(spec, new Bounds(0, 0, size.width, size.height)),
    [spec, size.width, size.height],
  );

  return (
    // Grapher's uncaptioned variant draws from a padded origin inside a
    // viewBox starting at 0,0 — the bottom axis and right-edge labels clip
    // unless the svg can overflow.
    <div ref={containerRef} className="[&_svg]:overflow-visible">
      {grapherState && (
        <div style={{ width: size.width, height: size.height }}>
          <Grapher grapherState={grapherState} />
        </div>
      )}
    </div>
  );
}
