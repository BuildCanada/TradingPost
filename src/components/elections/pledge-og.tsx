/* Shared template for every region's pledge OG images: the city's
   commemorative stamp on election paper inside the site's dark frame, with an
   optional postmark overlay carrying the pledger's name (mirroring the real
   page). Each election supplies its own stamp, palette, postmark wording and
   corner lockup. Uses the runtime's bundled font like the other OG images in
   the repo. */

import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

/* The white Build Canada wordmark, from public/ — the only asset directory
   shipped into the production (Docker) runtime image. */
export async function logoDataUri(): Promise<string> {
  try {
    const data = await readFile(
      join(process.cwd(), "public/assets/logos/logo-standard.svg"),
      "base64",
    );
    return `data:image/svg+xml;base64,${data}`;
  } catch {
    return "";
  }
}

const SANS = "system-ui, -apple-system, sans-serif";

/** The nav lockup as it appears on an election's section of the site: the
 *  wordmark and the city in the accent-coloured box (see Navbar.tsx). Logo SVG
 *  is 321×149. Toronto has its own (../election-og) from before this was
 *  shared; new regions use this. */
export function CityLockup({
  logoSrc,
  city,
  background,
  divider,
}: {
  /** data URI from a logo loader; falls back to text without it */
  logoSrc: string;
  city: string;
  /** the section's accent colour */
  background: string;
  /** hairline between wordmark and city, usually the paper colour */
  divider: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        backgroundColor: background,
        padding: "11px 16px",
      }}
    >
      {logoSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoSrc} width={60} height={28} alt="" />
      ) : (
        <span style={{ color: "#ffffff", fontSize: 19, fontWeight: 700 }}>
          Build Canada
        </span>
      )}
      <div
        style={{ width: 1, height: 28, backgroundColor: divider, display: "flex" }}
      />
      <span style={{ color: "#ffffff", fontSize: 19, fontWeight: 500 }}>
        {city}
      </span>
    </div>
  );
}

export type PledgeOGTheme = {
  /** page background */
  paper: string;
  /** frame and headline */
  dark: string;
  /** postmark ink */
  ink: string;
  /** the line under the headline */
  muted: string;
  /** e.g. "26.10.2026" */
  postmarkDate: string;
  /** e.g. "TORONTO · #02026" */
  postmarkCity: string;
  /** e.g. "Toronto votes Monday, October 26" */
  voteDayLine: string;
  /** Where the cancellation mark sits over the stamp, and whether its text
   *  needs a paper backing to stay legible. Each city's artwork is composed
   *  differently — Toronto's pale sky takes the mark bare; a busier stamp
   *  needs the backing and its own offset so the mark misses the title. */
  postmark?: { top?: number; left?: number; backing?: string };
};

/* The cancellation mark, as SVG waves + frame with the name laid over it */
function Postmark({ name, theme }: { name: string; theme: PledgeOGTheme }) {
  const display = name.toUpperCase();
  const nameSize = display.length > 22 ? 14 : display.length > 14 ? 18 : 22;
  const { top = -60, left = -64, backing } = theme.postmark ?? {};

  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
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
            stroke={theme.ink}
            strokeWidth="4.5"
            fill="none"
            strokeLinecap="round"
          />
        ))}
        {/* stretched beveled frame */}
        <path
          d="M 196 8 H 380 L 424 40 V 110 L 380 142 H 196 L 152 110 V 40 Z"
          stroke={theme.ink}
          strokeWidth="5"
          fill="none"
          strokeLinejoin="round"
        />
      </svg>
      {backing ? (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 158,
            width: 260,
            height: 126,
            backgroundColor: backing,
            display: "flex",
          }}
        />
      ) : null}
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
          color: theme.ink,
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
          {theme.postmarkDate}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>
          {theme.postmarkCity}
        </div>
      </div>
    </div>
  );
}

export function PledgeOGImage({
  stampSrc,
  name,
  theme,
  lockup,
}: {
  stampSrc: string;
  /** when set, the stamp is postmarked and the headline names the pledger */
  name?: string;
  theme: PledgeOGTheme;
  /** the corner lockup for this election's section of the site */
  lockup?: React.ReactNode;
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
        backgroundColor: theme.paper,
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
          border: `5px solid ${theme.dark}`,
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
        {firstName ? <Postmark name={firstName} theme={theme} /> : null}
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
            color: theme.dark,
          }}
        >
          {headline}
        </div>
        <div
          style={{ width: 96, height: 4, backgroundColor: theme.dark, display: "flex" }}
        />
        <div style={{ fontSize: 32, color: theme.muted, display: "flex" }}>
          {theme.voteDayLine}
        </div>
      </div>

      {/* corner lockup */}
      {lockup ? (
        <div
          style={{
            position: "absolute",
            bottom: 52,
            right: 84,
            display: "flex",
          }}
        >
          {lockup}
        </div>
      ) : null}
    </div>
  );
}
