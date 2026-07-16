// SVG charts for the State of the Nation page — a direct translation of the
// claude.ai/design "State of the Nation.dc.html" line and bar charts.
// Server-rendered, no client JS. The warm greys (#E3D9CE grid, #6f6a63
// labels) are the design's own values and have no site token; ink and
// auburn map to the site palette.

export type ChartFmt =
  | "money"
  | "pct"
  | "pct1"
  | "x"
  | "index"
  | "count"
  | "num";

// au = brand accent for the headline series; ink = comparison (usually
// dashed); clay/stone/sand = warm muted tones for additional series.
export type SeriesColor = "au" | "ink" | "clay" | "stone" | "sand";

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
  xLabels: [string, string, string];
  // Optional explicit x-axis tick years (e.g. decade marks). When present they
  // replace the start/mid/end labels and sit at their true date on the axis.
  xTicks?: number[];
  legend?: LegendItem[];
  // xs holds each point's fractional year, parallel to points.
  series: {
    color: SeriesColor;
    dash?: boolean;
    xs: number[];
    points: number[];
  }[];
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
  if (f === "num")
    return v.toLocaleString("en-CA", { maximumFractionDigits: 1 });
  return Math.round(v).toLocaleString("en-CA");
}

// A round-number step (1, 2, 2.5, 5, ×10ⁿ) closest to the raw interval, so
// axis labels land on clean values.
function niceStep(raw: number): number {
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  return nice * mag;
}

// Frames the y axis around the data's own range rather than forcing a zero
// baseline. Most of these series never approach zero — employment rates in the
// 80s, index values near 150, GDP per capita in the tens of thousands — so
// anchoring there flattens every line into a straight streak near the top.
// Returns a padded range snapped to round tick values (~4–6 gridlines). Zero
// is kept on the chart whenever the data goes negative, and a positive series
// that sits close to zero still floors at zero rather than floating above it.
function niceAxis(
  dataMin: number,
  dataMax: number,
): { mn: number; mx: number; ticks: number[] } {
  let lo = dataMin;
  let hi = dataMax;
  if (lo === hi) {
    lo -= 1;
    hi += 1;
  }
  const span = hi - lo;
  lo -= span * 0.08;
  hi += span * 0.08;
  if (dataMin >= 0 && lo < 0) lo = 0;
  const step = niceStep((hi - lo) / 4);
  const mn = Math.floor(lo / step) * step;
  const mx = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  // The 0.001·step slack absorbs floating-point drift so the top tick isn't
  // dropped or doubled.
  for (let v = mn; v <= mx + step * 0.001; v += step) {
    ticks.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  }
  return { mn, mx, ticks };
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
  // Frame the y axis around the data's own range (see niceAxis) so each trend
  // fills the panel instead of flattening against a zero baseline.
  const { mn, mx, ticks } = niceAxis(Math.min(...all), Math.max(...all));
  const crossesZero = mn < 0 && mx > 0;
  const [d0, d1] = spec.xDomain;
  const X = (x: number) => L + iw * ((x - d0) / (d1 - d0));
  const Y = (v: number) => T + ih * (1 - (v - mn) / (mx - mn));
  // Area fills close at the bottom of the framed panel — or at the zero line
  // when the data straddles it.
  const baseY = Y(crossesZero ? 0 : mn);
  // Ticks sit at the domain edges and middle — identical across charts.
  const tickX = [L, L + iw / 2, L + iw];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: "block", overflow: "visible" }}
      preserveAspectRatio="xMidYMid meet"
    >
      {ticks.map((tv, i) => {
        const gy = Y(tv);
        // The lowest tick doubles as the bottom axis and gets the ink weight.
        const isBase = i === 0;
        return (
          <g key={tv}>
            <line
              x1={L}
              y1={gy}
              x2={L + iw}
              y2={gy}
              stroke={isBase ? INK : GRID}
              strokeWidth={isBase ? 1.5 : 1}
            />
            <text
              x={L + iw + 8}
              y={gy + 4}
              fontFamily={MONO}
              fontSize={11}
              fill={GRAY}
            >
              {fmt(tv, spec.fmt)}
            </text>
          </g>
        );
      })}
      {crossesZero && (
        <line
          x1={L}
          y1={Y(0)}
          x2={L + iw}
          y2={Y(0)}
          stroke={INK}
          strokeWidth={1}
        />
      )}
      {spec.xTicks
        ? spec.xTicks.map((t) => {
            const [d0, d1] = spec.xDomain;
            // Keep a tick that lands on the domain edge from spilling past it.
            const anchor =
              t <= d0 ? "start" : t >= d1 ? "end" : "middle";
            return (
              <text
                key={t}
                x={X(t)}
                y={H - 16}
                fontFamily={MONO}
                fontSize={11}
                fill={GRAY}
                textAnchor={anchor}
              >
                {t}
              </text>
            );
          })
        : spec.xLabels.map((label, k) => (
            <text
              key={label + k}
              x={tickX[k]}
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
        const pts = s.points.map((v, i) => `${X(s.xs[i])},${Y(v)}`).join(" ");
        const area =
          si === 0
            ? `M${X(s.xs[0])},${Y(s.points[0])} ` +
              s.points.map((v, i) => `L${X(s.xs[i])},${Y(v)}`).join(" ") +
              ` L${X(s.xs[end])},${baseY} L${X(s.xs[0])},${baseY} Z`
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
            <circle cx={X(s.xs[end])} cy={Y(s.points[end])} r={3.5} fill={col} />
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
