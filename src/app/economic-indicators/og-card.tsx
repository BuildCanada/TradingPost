import type { EconomySeriesResponse } from "@/lib/api/economy";
import { CANADA_COLOR } from "./indicators";
import { formatValue } from "./units";

// Shared plumbing for the /economic-indicators opengraph images: one branded
// card layout plus builders that bake a series into a data-URI SVG. Satori
// lays out the text; the chart travels as an <img> so resvg rasterizes real
// vector paths instead of satori's partial SVG support.

export const OG_SIZE = { width: 1200, height: 630 };

export const CHART_W = 1004;
export const CHART_H = 218;

// Matches src/lib/og-image-template.tsx so every Build Canada card shares
// one look.
const theme = {
  background: "#f6ece3",
  accent: "#932f2f",
  foreground: "#272727",
  foregroundMuted: "#5d5d5d",
  foregroundFaint: "#888888",
  border: "rgba(39, 39, 39, 0.18)",
  peerLine: "rgba(39, 39, 39, 0.16)",
} as const;

const sans = "Inter, system-ui, -apple-system, sans-serif";

// Mirrors SectionSparkline: century-scale series (CO₂ reaches back to 1750)
// would render as a long flat tail at card size — preview the recent era.
const MAX_SPAN_YEARS = 60;
// Keeps strokes and the end dot inside the SVG canvas.
const PAD = 10;

type ScaledSeries = { name: string; path: string; endX: number; endY: number };

function windowSeries(response: EconomySeriesResponse) {
  const allYears = response.data.series.flatMap((s) =>
    s.points.map((p) => p.year),
  );
  if (allYears.length === 0) return null;
  const windowStart = Math.max(...allYears) - MAX_SPAN_YEARS;
  const series = response.data.series
    .map((s) => ({
      ...s,
      points: s.points.filter((p) => p.year >= windowStart),
    }))
    .filter((s) => s.points.length >= 2);
  return series.length > 0 ? series : null;
}

function toPath(
  points: { year: number; value: number }[],
  toX: (year: number) => number,
  toY: (value: number) => number,
): string {
  return points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${toX(p.year).toFixed(1)} ${toY(p.value).toFixed(1)}`,
    )
    .join(" ");
}

function svgDataUri(body: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CHART_W}" height="${CHART_H}" viewBox="0 0 ${CHART_W} ${CHART_H}">${body}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function line(path: string, stroke: string, width: number, opacity = 1): string {
  return `<path d="${path}" fill="none" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;
}

function endDot(x: number, y: number, fill: string): string {
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="${fill}"/>`;
}

// Monthly points carry an ISO first-of-month date; annual points only a year.
function timeLabel(point: { year: number; date?: string }): string {
  if (point.date) {
    const parsed = new Date(point.date);
    if (!Number.isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat("en-CA", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(parsed);
    }
  }
  return String(Math.floor(point.year));
}

export type OgChart = {
  dataUri: string;
  minLabel: string;
  maxLabel: string;
  // "Canada $69,672 (2023)" — null when the series has no Canada line.
  latestLabel: string | null;
  hasPeers: boolean;
};

// Canada in brand red over muted peer lines — the SectionSparkline treatment
// at share-card scale.
export function buildOgChart(response: EconomySeriesResponse): OgChart | null {
  const series = windowSeries(response);
  if (!series) return null;

  const allPoints = series.flatMap((s) => s.points);
  const minYear = Math.min(...allPoints.map((p) => p.year));
  const maxYear = Math.max(...allPoints.map((p) => p.year));
  const minValue = Math.min(...allPoints.map((p) => p.value));
  const maxValue = Math.max(...allPoints.map((p) => p.value));
  if (minYear === maxYear) return null;

  const valueSpan = maxValue - minValue;
  const toX = (year: number) =>
    PAD + ((year - minYear) / (maxYear - minYear)) * (CHART_W - 2 * PAD);
  const toY = (value: number) =>
    valueSpan === 0
      ? CHART_H / 2
      : CHART_H -
        PAD -
        ((value - minValue) / valueSpan) * (CHART_H - 2 * PAD);

  const scaled: ScaledSeries[] = series.map((s) => {
    const last = s.points[s.points.length - 1];
    return {
      name: s.jurisdiction.name,
      path: toPath(s.points, toX, toY),
      endX: toX(last.year),
      endY: toY(last.value),
    };
  });

  const canada = scaled.find((s) => s.name === "Canada");
  const peers = scaled.filter((s) => s !== canada);

  const body = [
    ...peers.map((p) => line(p.path, theme.foreground, 2, 0.16)),
    ...(canada
      ? [
          line(canada.path, CANADA_COLOR, 4.5),
          endDot(canada.endX, canada.endY, CANADA_COLOR),
        ]
      : []),
  ].join("");

  const canadaSeries = series.find((s) => s.jurisdiction.name === "Canada");
  const lastPoint = canadaSeries?.points[canadaSeries.points.length - 1];
  const latestLabel = lastPoint
    ? `Canada ${formatValue(lastPoint.value, response.data.measure.unit.symbol)} (${timeLabel(lastPoint)})`
    : null;

  const firstPoints = allPoints.filter((p) => p.year === minYear);
  const lastPoints = allPoints.filter((p) => p.year === maxYear);

  return {
    dataUri: svgDataUri(body),
    minLabel: timeLabel(firstPoints[0] ?? { year: minYear }),
    maxLabel: timeLabel(lastPoints[0] ?? { year: maxYear }),
    latestLabel,
    hasPeers: peers.length > 0,
  };
}

// Canvas preview: each feed's Canada series normalized to 0–1 and overlaid in
// the canvas feed palette — the same visual the page itself produces.
export function buildOverlayOgChart(
  feeds: { response: EconomySeriesResponse; color: string }[],
): Pick<OgChart, "dataUri" | "minLabel" | "maxLabel"> | null {
  const lines: { color: string; points: { year: number; value: number }[] }[] =
    [];
  for (const feed of feeds) {
    const series = windowSeries(feed.response);
    const canada =
      series?.find((s) => s.jurisdiction.name === "Canada") ?? series?.[0];
    if (canada) lines.push({ color: feed.color, points: canada.points });
  }
  if (lines.length === 0) return null;

  const allYears = lines.flatMap((l) => l.points.map((p) => p.year));
  const minYear = Math.min(...allYears);
  const maxYear = Math.max(...allYears);
  if (minYear === maxYear) return null;

  const toX = (year: number) =>
    PAD + ((year - minYear) / (maxYear - minYear)) * (CHART_W - 2 * PAD);

  const body = lines
    .map((l) => {
      const values = l.points.map((p) => p.value);
      const min = Math.min(...values);
      const span = Math.max(...values) - min;
      const toY = (value: number) =>
        span === 0
          ? CHART_H / 2
          : CHART_H - PAD - ((value - min) / span) * (CHART_H - 2 * PAD);
      const last = l.points[l.points.length - 1];
      return (
        line(toPath(l.points, toX, toY), l.color, 4) +
        endDot(toX(last.year), toY(last.value), l.color)
      );
    })
    .join("");

  return {
    dataUri: svgDataUri(body),
    minLabel: String(Math.floor(minYear)),
    maxLabel: String(Math.floor(maxYear)),
  };
}

export function IndicatorOgCard({
  label,
  title,
  description,
  chartHeading,
  chart,
  legend,
  footnote,
}: {
  label: string;
  title: string;
  description: string;
  chartHeading: string;
  chart:
    | (Pick<OgChart, "dataUri" | "minLabel" | "maxLabel"> &
        Partial<Pick<OgChart, "latestLabel">>)
    | null;
  legend?: { label: string; color: string }[];
  footnote?: string;
}) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.background,
        color: theme.foreground,
        padding: "52px 88px 40px",
        position: "relative",
        fontFamily: sans,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "10px",
          backgroundColor: theme.accent,
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <span
          style={{
            fontSize: "26px",
            fontWeight: 700,
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          BUILD CANADA
        </span>
        <div
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: theme.accent,
          }}
        />
        <span
          style={{
            fontSize: "22px",
            textTransform: "uppercase",
            letterSpacing: "4px",
            color: theme.accent,
          }}
        >
          {label}
        </span>
      </div>

      <h1
        style={{
          fontSize: "52px",
          lineHeight: 1.08,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          margin: "28px 0 0",
        }}
      >
        {title}
      </h1>

      <p
        style={{
          fontSize: "24px",
          color: theme.foregroundMuted,
          lineHeight: 1.35,
          margin: "12px 0 0",
          maxWidth: "980px",
        }}
      >
        {description}
      </p>

      <div style={{ display: "flex", flex: 1 }} />

      {chart && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontSize: "19px",
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: theme.foregroundFaint,
              }}
            >
              {chartHeading}
            </span>
            {legend ? (
              <div style={{ display: "flex", gap: "24px" }}>
                {legend.map((item) => (
                  <div
                    key={item.label}
                    style={{ display: "flex", alignItems: "center", gap: "9px" }}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: item.color,
                      }}
                    />
                    <span
                      style={{ fontSize: "20px", color: theme.foregroundMuted }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : chart.latestLabel ? (
              <span
                style={{
                  fontSize: "25px",
                  fontWeight: 700,
                  color: CANADA_COLOR,
                }}
              >
                {chart.latestLabel}
              </span>
            ) : null}
          </div>

          <img
            src={chart.dataUri}
            width={CHART_W}
            height={CHART_H}
            alt=""
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "6px",
              fontSize: "19px",
              color: theme.foregroundFaint,
            }}
          >
            <span>{chart.minLabel}</span>
            <span>{chart.maxLabel}</span>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "22px",
          paddingTop: "18px",
          borderTop: `1px solid ${theme.border}`,
        }}
      >
        <span style={{ fontSize: "20px", color: theme.foregroundFaint }}>
          {footnote ?? ""}
        </span>
        <span style={{ fontSize: "20px", color: theme.foregroundFaint }}>
          buildcanada.com
        </span>
      </div>
    </div>
  );
}

// Same Google Fonts subsetting trick as the bills OG images: fetch only the
// glyphs the card renders, fall back to satori's default font on failure.
async function loadGoogleFont(font: string, weight: number, text: string) {
  const params = new URLSearchParams({
    family: `${font}:wght@${weight}`,
    text,
  });
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?${params.toString()}`)
  ).text();
  const resource = css.match(
    /src: url\((.+?)\) format\('(opentype|truetype|woff2)'\)/,
  );
  if (resource) {
    const res = await fetch(resource[1]);
    if (res.status === 200) return await res.arrayBuffer();
  }
  throw new Error("failed to load font data");
}

export async function loadOgFonts(text: string) {
  const subset = `${text} BUILDCANAbuildcanada.com0123456789·$%,.()—–&`;
  try {
    const [regular, bold] = await Promise.all([
      loadGoogleFont("Inter", 400, subset),
      loadGoogleFont("Inter", 700, subset),
    ]);
    return [
      { name: "Inter", data: regular, weight: 400 as const, style: "normal" as const },
      { name: "Inter", data: bold, weight: 700 as const, style: "normal" as const },
    ];
  } catch {
    return undefined;
  }
}
