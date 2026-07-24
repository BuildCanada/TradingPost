import { readFile } from "node:fs/promises";
import { join } from "node:path";

/* Shared template for the pledge OG images: the Toronto stamp on election
   paper inside the site's dark frame, with an optional postmark overlay
   carrying the pledger's name (mirroring the real page). Uses the runtime's
   bundled font like the other OG images in the repo. */

export const OG_SIZE = { width: 1200, height: 630 };

const PAPER = "#efe4da";
const DARK = "#272727";
const INK = "#2e5fa3";
const SANS = "system-ui, -apple-system, sans-serif";

/* The stamp artwork lives under public/ — the only asset directory shipped
   into the production (Docker) runtime image, where this renders on demand
   for shared-pledge URLs. Reading from src/ here 500'd in production. */
export async function stampDataUri(): Promise<string> {
  try {
    const data = await readFile(
      join(process.cwd(), "public/elections/toronto/2026/toronto-stamp-og.png"),
      "base64",
    );
    return `data:image/png;base64,${data}`;
  } catch {
    return ""; // degraded stamp-less image beats a broken share card
  }
}

/* The cancellation mark, as SVG waves + frame with the name laid over it */
function Postmark({ name }: { name: string }) {
  const display = name.toUpperCase();
  const nameSize = display.length > 22 ? 14 : display.length > 14 ? 18 : 22;

  return (
    <div
      style={{
        position: "absolute",
        top: -60,
        left: -64,
        width: 430,
        height: 150,
        display: "flex",
        transform: "rotate(8deg)",
        opacity: 0.85,
      }}
    >
      <svg width="430" height="150" viewBox="0 0 430 150">
        {/* cancellation waves */}
        {[35, 60, 85, 110].map((y) => (
          <path
            key={y}
            d={`M 6 ${y} q 20 -10 40 0 t 40 0 t 40 0 t 40 0`}
            stroke={INK}
            strokeWidth="4.5"
            fill="none"
            strokeLinecap="round"
          />
        ))}
        {/* stretched beveled frame */}
        <path
          d="M 196 8 H 380 L 424 40 V 110 L 380 142 H 196 L 152 110 V 40 Z"
          stroke={INK}
          strokeWidth="5"
          fill="none"
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 152,
          width: 272,
          height: 134,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          color: INK,
          fontFamily: SANS,
        }}
      >
        <div
          style={{
            fontSize: nameSize,
            fontWeight: 800,
            letterSpacing: 1,
            maxWidth: 230,
            textAlign: "center",
          }}
        >
          {display}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2 }}>
          26.10.2026
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>
          TORONTO · #02026
        </div>
      </div>
    </div>
  );
}

export function PledgeOGImage({
  stampSrc,
  name,
}: {
  stampSrc: string;
  /** when set, the stamp is postmarked and the headline names the pledger */
  name?: string;
}) {
  const firstName = name?.trim().split(/\s+/)[0];
  const headline = firstName
    ? `${firstName} pledged to vote.`
    : "I pledge to vote.";
  const headlineSize =
    headline.length > 30 ? 68 : headline.length > 22 ? 80 : 92;

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

      {/* the stamp, hand-tilted, postmarked when there's a pledger */}
      <div
        style={{
          position: "absolute",
          top: 115,
          left: 92,
          width: 400,
          height: 400,
          display: "flex",
          transform: "rotate(-8deg)",
        }}
      >
        {stampSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={stampSrc} width={400} height={400} alt="" />
        ) : null}
        {firstName ? <Postmark name={firstName} /> : null}
      </div>

      {/* headline block */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 560,
          right: 84,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 30,
        }}
      >
        <div
          style={{
            fontSize: headlineSize,
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: -2,
            color: DARK,
          }}
        >
          {headline}
        </div>
        <div style={{ width: 96, height: 4, backgroundColor: DARK, display: "flex" }} />
        <div style={{ fontSize: 32, color: "#4c4c4c", display: "flex" }}>
          Toronto votes Monday, October 26
        </div>
      </div>
    </div>
  );
}
