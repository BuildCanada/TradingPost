// SVG charts for the State of the Nation page — a direct translation of the
// claude.ai/design "State of the Nation.dc.html" line and bar charts.
// Server-rendered, no client JS. The warm greys (#E3D9CE grid, #6f6a63
// labels) are the design's own values and have no site token; ink and
// auburn map to the site palette.

export type ChartFmt = "money" | "pct" | "pct1" | "x" | "index" | "count";

// au = brand accent for the headline series; ink = comparison (usually
// dashed); clay/stone/sand = warm muted tones for additional series.
export type SeriesColor = "au" | "ink" | "clay" | "stone" | "sand";

export type LegendItem = { label: string; color: SeriesColor; dash?: boolean };

export type LineSpec = {
  kind: "line";
  unit: string;
  fmt: ChartFmt;
  // Tick labels for the first, middle, and last x positions.
  xLabels: [string, string, string];
  legend?: LegendItem[];
  // Series must share the same start and cadence but may differ in length —
  // a shorter series (e.g. business exits, confirmed ~6 months late) simply
  // stops early instead of being stretched or clipping the others.
  series: { color: SeriesColor; dash?: boolean; points: number[] }[];
};

export type BarSpec = {
  kind: "bar";
  unit: string;
  fmt: ChartFmt;
  bars: { label: string; value: number; accent?: boolean }[];
};

export type ChartSpec = LineSpec | BarSpec;

const INK = "var(--color-dark)";
const AU = "var(--color-auburn-800)";
const GRID = "#E3D9CE";
const GRAY = "#6f6a63";
const MONO = "var(--font-label)";

const SERIES_COLORS: Record<SeriesColor, string> = {
  au: AU,
  ink: INK,
  clay: "#c2724d",
  stone: "#8a8178",
  sand: "#c7bdb2",
};

function fmt(v: number, f: ChartFmt): string {
  if (f === "money") return "$" + Math.round(v).toLocaleString("en-CA");
  if (f === "pct") return Math.round(v) + "%";
  if (f === "pct1") return v.toFixed(1) + "%";
  if (f === "x") return v.toFixed(1) + "×";
  if (f === "index") return String(Math.round(v));
  return Math.round(v).toLocaleString("en-CA");
}

function LineChart({ spec, wide }: { spec: LineSpec; wide?: boolean }) {
  // Full-width (wide) charts get a panoramic viewBox so the SVG renders at
  // roughly 1:1 scale instead of stretching the half-column geometry — which
  // blew the type and strokes up ~2× on desktop.
  const W = wide ? 1240 : 600,
    H = wide ? 420 : 320,
    L = 8,
    R = 62,
    T = 30,
    B = 46;
  const iw = W - L - R,
    ih = H - T - B;
  const all = spec.series.flatMap((s) => s.points);
  let mx = Math.max(...all),
    mn = Math.min(...all);
  const pad = (mx - mn) * 0.14 || 1;
  mx += pad;
  mn -= pad;
  const n = Math.max(...spec.series.map((s) => s.points.length));
  const X = (i: number) => L + iw * (i / (n - 1));
  const Y = (v: number) => T + ih * (1 - (v - mn) / (mx - mn));
  const baseY = T + ih;
  const gridlines = [0, 1, 2, 3, 4];
  const ticks = [0, Math.floor((n - 1) / 2), n - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: "block", overflow: "visible" }}
      preserveAspectRatio="xMidYMid meet"
    >
      {gridlines.map((g) => {
        const gy = T + (ih * g) / 4;
        const gv = mx - ((mx - mn) * g) / 4;
        return (
          <g key={g}>
            <line
              x1={L}
              y1={gy}
              x2={L + iw}
              y2={gy}
              stroke={g === 4 ? INK : GRID}
              strokeWidth={g === 4 ? 1.5 : 1}
            />
            <text
              x={L + iw + 8}
              y={gy + 4}
              fontFamily={MONO}
              fontSize={11}
              fill={GRAY}
            >
              {fmt(gv, spec.fmt)}
            </text>
          </g>
        );
      })}
      {spec.xLabels.map((label, k) => (
        <text
          key={label + k}
          x={X(ticks[k])}
          y={H - 16}
          fontFamily={MONO}
          fontSize={11}
          fill={GRAY}
          textAnchor={k === 0 ? "start" : k === 2 ? "end" : "middle"}
        >
          {label}
        </text>
      ))}
      {spec.series.map((s, si) => {
        const col = SERIES_COLORS[s.color];
        const end = s.points.length - 1;
        const pts = s.points.map((v, i) => `${X(i)},${Y(v)}`).join(" ");
        const area =
          si === 0
            ? `M${X(0)},${Y(s.points[0])} ` +
              s.points.map((v, i) => `L${X(i)},${Y(v)}`).join(" ") +
              ` L${X(end)},${baseY} L${X(0)},${baseY} Z`
            : null;
        return (
          <g key={si}>
            {area && <path d={area} fill={col} opacity={0.06} />}
            <polyline
              points={pts}
              fill="none"
              stroke={col}
              strokeWidth={2}
              strokeDasharray={s.dash ? "6 5" : "none"}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle cx={X(end)} cy={Y(s.points[end])} r={3.5} fill={col} />
          </g>
        );
      })}
    </svg>
  );
}

function BarChart({ spec }: { spec: BarSpec }) {
  const W = 600,
    H = 320,
    L = 8,
    R = 8,
    T = 30,
    B = 52;
  const iw = W - L - R,
    ih = H - T - B;
  const bars = spec.bars;
  const mx = Math.max(...bars.map((b) => b.value)) * 1.12;
  const baseY = T + ih;
  const slot = iw / bars.length;
  const bw = Math.min(slot * 0.56, 64);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: "block", overflow: "visible" }}
      preserveAspectRatio="xMidYMid meet"
    >
      {[0, 1, 2, 3, 4].map((g) => (
        <line
          key={g}
          x1={L}
          y1={T + (ih * g) / 4}
          x2={L + iw}
          y2={T + (ih * g) / 4}
          stroke={g === 4 ? INK : GRID}
          strokeWidth={g === 4 ? 1.5 : 1}
        />
      ))}
      {bars.map((b, i) => {
        const cx = L + slot * (i + 0.5);
        const bh = (b.value / mx) * ih;
        return (
          <g key={b.label}>
            <rect
              x={cx - bw / 2}
              y={baseY - bh}
              width={bw}
              height={bh}
              fill={b.accent ? AU : "#c7bdb2"}
            />
            <text
              x={cx}
              y={baseY - bh - 9}
              fontFamily={MONO}
              fontSize={12}
              fill={b.accent ? AU : INK}
              textAnchor="middle"
              fontWeight={b.accent ? 500 : 400}
            >
              {fmt(b.value, spec.fmt)}
            </text>
            <text
              x={cx}
              y={H - 14}
              fontFamily={MONO}
              fontSize={10.5}
              fill={b.accent ? INK : GRAY}
              textAnchor="middle"
            >
              {b.label.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function StateChart({
  spec,
  wide,
}: {
  spec: ChartSpec;
  wide?: boolean;
}) {
  return (
    <div>
      {/* Same treatment as the section headline on the left column. */}
      <div className="mb-4 font-display font-medium text-[clamp(1.4rem,2.4vw,1.9rem)] leading-[1.12] tracking-[-0.01em] text-dark text-balance">
        {spec.unit}
      </div>
      {spec.kind === "line" && spec.legend && (
        <div className="flex gap-5 flex-wrap mb-3.5">
          {spec.legend.map((lg) => (
            <div key={lg.label} className="flex items-center gap-2">
              <span
                style={{
                  width: 16,
                  height: lg.dash ? 0 : 3,
                  borderTop: lg.dash
                    ? `2px dashed ${SERIES_COLORS[lg.color]}`
                    : "none",
                  background: lg.dash ? "none" : SERIES_COLORS[lg.color],
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
      {spec.kind === "line" ? (
        wide ? (
          // The panoramic viewBox only reads at full-column width; phones
          // get the standard geometry.
          <>
            <div className="hidden lg:block">
              <LineChart spec={spec} wide />
            </div>
            <div className="lg:hidden">
              <LineChart spec={spec} />
            </div>
          </>
        ) : (
          <LineChart spec={spec} />
        )
      ) : (
        <BarChart spec={spec} />
      )}
    </div>
  );
}
