import { WARD_SHAPES } from "./wardGeo";

/* Shared template for the election-tracker OG images: the site's dark frame
   on election paper (matching the pledge OG images), a Toronto-blue kicker,
   and the ward locator map — full for the index pages, with the ward filled
   in blue for ward pages. Uses the runtime's bundled font like the other OG
   images in the repo. */

export const OG_SIZE = { width: 1200, height: 630 };

const PAPER = "#e3ecf6";
const LINEN = "#f2f6fb";
const HAIRLINE = "#c7d7e8";
const DARK = "#272727";
const BLUE = "#003086";
const MUTED = "#4c4c4c";
const SANS = "system-ui, -apple-system, sans-serif";

/* WARD_MAP_VIEWBOX is "0 0 300 157" */
const MAP_RATIO = 157 / 300;

/** The 25-ward locator map; `activeWard` (e.g. "04") is filled Toronto blue.
 *  Paths are drawn inline (satori has no <defs>/<use>), active ward last so
 *  its stroke sits on top. */
function WardMapOG({ width, activeWard }: { width: number; activeWard?: string }) {
  const shapes = activeWard
    ? [...WARD_SHAPES].sort((a, b) =>
        Number(a.n === activeWard) - Number(b.n === activeWard),
      )
    : WARD_SHAPES;

  return (
    <svg
      width={width}
      height={Math.round(width * MAP_RATIO)}
      viewBox="0 0 300 157"
    >
      {shapes.map((w) => {
        const active = w.n === activeWard;
        return (
          <path
            key={w.n}
            d={w.d}
            fill={active ? BLUE : LINEN}
            stroke={active ? BLUE : HAIRLINE}
            strokeWidth={active ? 1 : 0.6}
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}

export function ElectionOGImage({
  kicker = "MUNICIPAL ELECTION · CITY OF TORONTO",
  title,
  subtitle,
  activeWard,
}: {
  kicker?: string;
  title: string;
  subtitle: string;
  /** zero-padded ward number to highlight, e.g. "04" */
  activeWard?: string;
}) {
  const titleSize = title.length > 26 ? 58 : title.length > 18 ? 66 : 76;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: PAPER,
        fontFamily: SANS,
        position: "relative",
      }}
    >
      {/* the site's dark frame */}
      <div
        style={{
          position: "absolute",
          top: 22,
          left: 22,
          right: 22,
          bottom: 22,
          border: `5px solid ${DARK}`,
          display: "flex",
        }}
      />

      {/* headline block */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 110,
          left: 84,
          width: 620,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 26,
        }}
      >
        <div
          style={{
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: 3,
            color: BLUE,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: -2,
            color: DARK,
          }}
        >
          {title}
        </div>
        <div style={{ width: 96, height: 4, backgroundColor: DARK, display: "flex" }} />
        <div style={{ fontSize: 27, lineHeight: 1.35, color: MUTED, display: "flex" }}>
          {subtitle}
        </div>
      </div>

      {/* ward locator map */}
      <div
        style={{
          position: "absolute",
          top: 118,
          right: 76,
          display: "flex",
        }}
      >
        <WardMapOG width={420} activeWard={activeWard} />
      </div>

      {/* footer strip */}
      <div
        style={{
          position: "absolute",
          bottom: 52,
          left: 84,
          right: 84,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 3,
            color: MUTED,
          }}
        >
          TORONTO VOTES MONDAY, OCTOBER 26
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 3,
            color: BLUE,
          }}
        >
          BUILDCANADA.COM/TORONTO
        </div>
      </div>
    </div>
  );
}
