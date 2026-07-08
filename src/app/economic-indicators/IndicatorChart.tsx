"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  type EconomySeriesUnit,
} from "@/lib/api/economy";

function displayUnit(unit: EconomySeriesUnit): {
  unit: string;
  shortUnit: string;
  numDecimalPlaces: number;
} {
  switch (unit.symbol) {
    case "%":
      return { unit: "%", shortUnit: "%", numDecimalPlaces: 1 };
    case "intl_$":
      return { unit: "international-$", shortUnit: "$", numDecimalPlaces: 0 };
    case "intl_$_per_hour":
      return {
        unit: "international-$ per hour worked",
        shortUnit: "$",
        numDecimalPlaces: 1,
      };
    case "index":
      return { unit: "index", shortUnit: "", numDecimalPlaces: 1 };
    case "ratio":
      return { unit: "ratio", shortUnit: "", numDecimalPlaces: 3 };
    case "units":
      return { unit: "dwelling units", shortUnit: "", numDecimalPlaces: 0 };
    case "hours":
      return { unit: "hours per year", shortUnit: "", numDecimalPlaces: 0 };
    case "score":
      return { unit: "score", shortUnit: "", numDecimalPlaces: 2 };
    case "births_per_woman":
      return { unit: "births per woman", shortUnit: "", numDecimalPlaces: 2 };
    case "per_100_people":
      return { unit: "per 100 people", shortUnit: "", numDecimalPlaces: 1 };
    case "rate_per_100k":
      return { unit: "per 100,000 people", shortUnit: "", numDecimalPlaces: 2 };
    case "t_co2_per_capita":
      return { unit: "tonnes of CO₂ per person", shortUnit: "t", numDecimalPlaces: 1 };
    case "ug_m3":
      return { unit: "µg/m³", shortUnit: "µg/m³", numDecimalPlaces: 1 };
    case "tonne_km_millions":
      return { unit: "million ton-km", shortUnit: "", numDecimalPlaces: 0 };
    default:
      return {
        unit: unit.base_unit,
        shortUnit: unit.symbol,
        numDecimalPlaces: 1,
      };
  }
}

// auburn-600 — Canada renders in the same brand red on every chart,
// matching the canvas feed palette.
const CANADA_COLOR = "#c43e3e";
const ENTITY_COLORS = { Canada: CANADA_COLOR };

function buildGrapherState(
  response: EconomySeriesResponse,
  bounds: Bounds,
): GrapherState | null {
  const { measure, series } = response.data;
  const { source } = response.meta;

  const data = series.flatMap((s, idx) =>
    s.points.map((p) => ({
      year: p.year,
      entity: { id: idx + 1, code: s.jurisdiction.code, name: s.jurisdiction.name },
      value: p.value,
    })),
  );
  if (data.length === 0) return null;

  const variableId = 1;
  const dimensions = [{ variableId, property: DimensionProperty.y }];

  const metadata = {
    id: variableId,
    display: {
      name: measure.name,
      ...displayUnit(measure.unit),
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

  const grapherState = new GrapherState({
    bounds,
    // Fill the available bounds exactly instead of scaling to Grapher's
    // ideal 680x480 aspect ratio.
    isEmbeddedInPage: true,
    chartTypes: [GRAPHER_CHART_TYPES.LineChart],
    selectedEntityNames: series.map((s) => s.jurisdiction.name),
    selectedEntityColors: ENTITY_COLORS,
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
    ENTITY_COLORS,
  );

  return grapherState;
}

export default function IndicatorChart({
  response,
}: {
  response: EconomySeriesResponse;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 480 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = Math.min(1040, Math.max(320, el.clientWidth - 16));
      const h = Math.max(320, Math.min(460, Math.round(w * 0.5)));
      setSize({ width: w, height: h });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const grapherState = useMemo(
    () =>
      buildGrapherState(response, new Bounds(0, 0, size.width, size.height)),
    [response, size.width, size.height],
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
