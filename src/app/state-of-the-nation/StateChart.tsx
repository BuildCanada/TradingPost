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
  // When set, the y axis frames the data around this reference value instead
  // of anchoring at zero, and a floating horizontal rule is drawn at it. Used
  // by indexed series (e.g. 100 = base year) where zero carries no meaning.
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

// Builds the tick array for a snapped [mn, mx] range. The 0.001·step slack
// absorbs floating-point drift so the top tick isn't dropped or doubled.
function buildTicks(mn: number, mx: number, step: number): number[] {
  const ticks: number[] = [];
  for (let v = mn; v <= mx + step * 0.001; v += step) {
    ticks.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  }
  return ticks;
}

// Chooses the y-axis range and round tick values.
// - Default: anchored at zero, so every line reads as a magnitude from zero
//   and the charts are comparable (extends below zero only for negative data).
// - With a `baseline` (e.g. an index's 100): frames the data around that
//   reference instead — zero carries no meaning for an indexed series — while
//   guaranteeing the baseline itself stays on the chart.
function niceAxis(
  dataMin: number,
  dataMax: number,
  baseline?: number,
): { mn: number; mx: number; ticks: number[] } {
  if (baseline !== undefined) {
    let lo = Math.min(dataMin, baseline);
    let hi = Math.max(dataMax, baseline);
    if (hi === lo) {
      lo -= 1;
      hi += 1;
    }
    const span = hi - lo;
    lo -= span * 0.08;
    hi += span * 0.08;
    const step = niceStep((hi - lo) / 4);
    const mn = Math.floor(lo / step) * step;
    const mx = Math.ceil(hi / step) * step;
    return { mn, mx, ticks: buildTicks(mn, mx, step) };
  }
  // Start from zero on both ends, then open whichever side the data occupies.
  let lo = Math.min(0, dataMin);
  let hi = Math.max(0, dataMax);
  if (hi === lo) hi += 1;
  const span = hi - lo;
  // Pad only away from zero; the zero side stays pinned to the axis.
  if (hi > 0) hi += span * 0.08;
  if (lo < 0) lo -= span * 0.08;
  const step = niceStep((hi - lo) / 4);
  // Zero stays exactly on a gridline: the positive side ceils to a round tick,
  // the negative side (if any) floors to one.
  const mn = lo < 0 ? Math.floor(lo / step) * step : 0;
  const mx = hi > 0 ? Math.ceil(hi / step) * step : 0;
  return { mn, mx, ticks: buildTicks(mn, mx, step) };
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
  const { mn, mx, ticks } = niceAxis(
    Math.min(...all),
    Math.max(...all),
    spec.baseline,
  );
  const [d0, d1] = spec.xDomain;
  const X = (x: number) => L + iw * ((x - d0) / (d1 - d0));
  const Y = (v: number) => T + ih * (1 - (v - mn) / (mx - mn));
  // The emphasized horizontal rule: the declared baseline (e.g. an index's
  // 100) when present, otherwise the zero axis. Area fills close here.
  const refVal = spec.baseline ?? 0;
  const refOnAxis = refVal >= mn - 1e-9 && refVal <= mx + 1e-9;
  // Drawn as a floating line only when it sits inside the range and isn't
  // already one of the round ticks (which carry the ink weight themselves).
  const refOnTick = ticks.some((t) => Math.abs(t - refVal) < 1e-9);
  const showFloatingRef =
    refOnAxis && !refOnTick && refVal > mn + 1e-9 && refVal < mx - 1e-9;
  const baseY = Y(refOnAxis ? refVal : mn);
  // Ticks sit at the domain edges and middle — identical across charts.
  const tickX = [L, L + iw / 2, L + iw];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: "block", overflow: "visible" }}
      preserveAspectRatio="xMidYMid meet"
    >
      {ticks.map((tv) => {
        const gy = Y(tv);
        // The reference line (baseline, or zero by default) carries the ink
        // weight; every other tick is a light gridline.
        const isRef = Math.abs(tv - refVal) < 1e-9;
        return (
          <g key={tv}>
            <line
              x1={L}
              y1={gy}
              x2={L + iw}
              y2={gy}
              stroke={isRef ? INK : GRID}
              strokeWidth={isRef ? 1.5 : 1}
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
      {showFloatingRef && (
        <line
          x1={L}
          y1={Y(refVal)}
          x2={L + iw}
          y2={Y(refVal)}
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
        // Fill only single-series trend charts. On multi-line comparisons the
        // fill sits under whichever series happens to be first (often not the
        // dominant line), which reads as arbitrary shading.
        const area =
          si === 0 && spec.series.length === 1
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
