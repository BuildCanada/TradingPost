/* Shared template for the Toronto election OG images: a headline on election
   paper inside the site's dark frame, with the Toronto-blue kicker and a
   footer strip carrying the election-day and site details. Mirrors the look
   of the pledge OG images (see 2026/pledge/og-template.tsx) but without the
   stamp, so the landing, ward, and get-involved routes share one identity.
   Uses the runtime's bundled font like the other OG images in the repo. */

export const OG_SIZE = { width: 1200, height: 630 };

const PAPER = "#efe4da";
const DARK = "#272727";
const BLUE = "#003086";
const MUTED = "#4c4c4c";
const SANS = "system-ui, -apple-system, sans-serif";

export function ElectionOGImage({
  headline,
  subline = "Toronto votes Monday, October 26",
  kicker = "MUNICIPAL ELECTION · CITY OF TORONTO",
}: {
  headline: string;
  subline?: string;
  kicker?: string;
}) {
  const headlineSize =
    headline.length > 42 ? 60 : headline.length > 28 ? 72 : 88;

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
          top: 96,
          left: 92,
          right: 92,
          display: "flex",
          flexDirection: "column",
          gap: 30,
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 3,
            color: BLUE,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontSize: headlineSize,
            fontWeight: 700,
            lineHeight: 1.03,
            letterSpacing: -2,
            color: DARK,
            display: "flex",
          }}
        >
          {headline}
        </div>
        <div
          style={{ width: 96, height: 4, backgroundColor: DARK, display: "flex" }}
        />
        <div style={{ fontSize: 30, color: MUTED, display: "flex" }}>
          {subline}
        </div>
      </div>

      {/* footer strip */}
      <div
        style={{
          position: "absolute",
          bottom: 52,
          left: 92,
          right: 92,
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
          ELECTION DAY · 26 OCTOBER 2026
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
