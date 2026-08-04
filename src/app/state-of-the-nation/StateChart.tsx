// Chart cards for the State of the Nation page. The plot itself renders on
// @buildcanada/charts (see StateChartPlot), matching the section pages and the
// dashboard; this component keeps the design's card furniture — the plain
// language title, the unit subtext, and the mono legend — as server-rendered
// HTML around it.

import StateChartPlot from "./StateChartPlot";

export type ChartFmt =
  | "money"
  | "pct"
  | "pct1"
  | "x"
  | "index"
  | "count"
  | "num";

// au = brand accent for the headline series; ink = comparison; clay/stone/sand
// are warm muted tones for additional series.
export type SeriesColor = "au" | "ink" | "clay" | "stone" | "sand";

// `dash` is retained because the specs still declare it, but Grapher reserves
// dashed strokes for projected data (setting isProjection also filters the
// line legend and adds a "Projected data" tooltip notice), so comparison
// series now read by colour alone. Every dashed series is `ink` against an
// `au` headline, so nothing becomes ambiguous.
export type LegendItem = { label: string; color: SeriesColor; dash?: boolean };

export type LineSpec = {
  kind: "line";
  unit: string;
  fmt: ChartFmt;
  // Time domain in fractional years. Every chart on the page passes the same
  // domain, so a given horizontal position means the same date on every
  // graph; series that begin later simply start partway in.
  xDomain: [number, number];
  // Tick labels for the left edge, middle, and right edge of the domain.
  // Grapher derives its own x ticks from xDomain, so these are unused by the
  // renderer and kept only so the specs still typecheck.
  xLabels: [string, string, string];
  xTicks?: number[];
  // When set, the y axis frames the data around this reference value and a
  // comparison line is drawn at it. Used by indexed series (e.g. 100 = base
  // year) where zero carries no meaning.
  baseline?: number;
  legend?: LegendItem[];
  // xs holds each point's fractional year, parallel to points.
  series: {
    color: SeriesColor;
    dash?: boolean;
    xs: number[];
    points: number[];
  }[];
};

export type ChartSpec = LineSpec;

// Warm grey for secondary mono text — the design's own value, no site token.
const GRAY = "#6f6a63";

const SERIES_COLORS: Record<SeriesColor, string> = {
  au: "var(--color-auburn-800)",
  ink: "var(--color-dark)",
  clay: "#c2724d",
  stone: "#8a8178",
  sand: "#c7bdb2",
};

export default function StateChart({
  spec,
  title,
  wide,
}: {
  spec: ChartSpec;
  title?: string;
  // Full-width cards (the headline GDP chart) get a panoramic plot.
  wide?: boolean;
}) {
  return (
    <div>
      {/* The plain-language title leads, large and bold; the descriptive
          unit line sits under it as smaller subtext. */}
      {title && (
        <div className="font-display font-medium text-[clamp(1.4rem,2.4vw,1.9rem)] leading-[1.12] tracking-[-0.01em] text-dark text-balance">
          {title}
        </div>
      )}
      <div
        className="mb-4 mt-1 text-[clamp(0.82rem,1.15vw,0.95rem)] leading-snug"
        style={{ color: GRAY }}
      >
        {spec.unit}
      </div>
      {spec.legend && (
        <div className="flex gap-5 flex-wrap mb-3.5">
          {spec.legend.map((lg) => (
            <div key={lg.label} className="flex items-center gap-2">
              <span
                style={{
                  width: 16,
                  height: 3,
                  background: SERIES_COLORS[lg.color],
                  display: "inline-block",
                }}
              />
              <span
                className="type-label-sm uppercase"
                style={{ letterSpacing: "0.08em", color: GRAY }}
              >
                {lg.label}
              </span>
            </div>
          ))}
        </div>
      )}
      <StateChartPlot spec={spec} wide={wide} />
    </div>
  );
}
