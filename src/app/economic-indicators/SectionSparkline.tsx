import type { EconomySeriesResponse } from "@/lib/api/economy";
import { CANADA_COLOR } from "./indicators";

// Decorative preview of a section's featured chart, rendered as a static
// inline SVG on the server — Canada in brand red over muted peer lines,
// mirroring the focused/muted treatment of the full Grapher charts.

const VIEW_W = 100;
const VIEW_H = 32;
const PAD_Y = 2;
// Century-scale series (CO₂ reaches back to 1750) would render as a long
// flat tail at card size — preview only the recent era.
const MAX_SPAN_YEARS = 60;

type Line = { name: string; points: string; endX: number; endY: number };

function buildLines(response: EconomySeriesResponse): {
  lines: Line[];
  minYear: number;
  maxYear: number;
} | null {
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
  if (series.length === 0) return null;

  const allPoints = series.flatMap((s) => s.points);
  const minYear = Math.min(...allPoints.map((p) => p.year));
  const maxYear = Math.max(...allPoints.map((p) => p.year));
  const minValue = Math.min(...allPoints.map((p) => p.value));
  const maxValue = Math.max(...allPoints.map((p) => p.value));
  if (minYear === maxYear) return null;

  const valueSpan = maxValue - minValue;
  const toX = (year: number) =>
    ((year - minYear) / (maxYear - minYear)) * VIEW_W;
  const toY = (value: number) =>
    valueSpan === 0
      ? VIEW_H / 2
      : VIEW_H - PAD_Y - ((value - minValue) / valueSpan) * (VIEW_H - 2 * PAD_Y);

  const lines = series.map((s) => {
    const points = s.points
      .map((p) => `${toX(p.year).toFixed(2)},${toY(p.value).toFixed(2)}`)
      .join(" ");
    const last = s.points[s.points.length - 1];
    return {
      name: s.jurisdiction.name,
      points,
      endX: toX(last.year),
      endY: toY(last.value),
    };
  });

  return { lines, minYear, maxYear };
}

export default function SectionSparkline({
  response,
}: {
  response: EconomySeriesResponse;
}) {
  const built = buildLines(response);
  if (!built) return null;

  const { lines, minYear, maxYear } = built;
  const canada = lines.find((l) => l.name === "Canada");
  const peers = lines.filter((l) => l !== canada);

  return (
    <div aria-hidden="true">
      {/* preserveAspectRatio="none" stretches the viewBox to the card, so
          every stroke uses non-scaling-stroke to stay crisp in px units. */}
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        className="block h-20 w-full"
      >
        {peers.map((line) => (
          <polyline
            key={line.name}
            points={line.points}
            fill="none"
            stroke="var(--color-dark)"
            strokeOpacity={0.15}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {canada && (
          <>
            <polyline
              points={canada.points}
              fill="none"
              stroke={CANADA_COLOR}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            {/* Zero-length round-capped stroke = a dot immune to the
                non-uniform viewBox scaling that would distort a circle. */}
            <path
              d={`M ${canada.endX.toFixed(2)} ${canada.endY.toFixed(2)} h 0.01`}
              stroke={CANADA_COLOR}
              strokeWidth={5}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
      </svg>
      <div className="mt-1 flex justify-between type-label-sm text-dark/40">
        {/* Monthly series carry fractional years (year + monthIndex / 12). */}
        <span>{Math.floor(minYear)}</span>
        <span>{Math.floor(maxYear)}</span>
      </div>
    </div>
  );
}
