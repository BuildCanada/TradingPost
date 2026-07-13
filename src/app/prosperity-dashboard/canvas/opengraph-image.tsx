import { ImageResponse } from "next/og";
import { getEconomicSeries } from "@/lib/api/economy";
import {
  buildOverlayOgChart,
  IndicatorOgCard,
  loadOgFonts,
  OG_SIZE,
} from "../og-card";

export const runtime = "nodejs";

export const alt =
  "Build Canada — Indicator Canvas: overlay economic indicator series";

export const size = OG_SIZE;

export const contentType = "image/png";

export const revalidate = 3600;

const TITLE = "Indicator Canvas";
const DESCRIPTION =
  "Overlay up to three economic indicator series and eyeball how they move together.";

// A representative overlay in the canvas feed palette (FEED_COLORS in
// CanvasClient): growth, housing, and emissions on one normalized chart.
const FEEDS = [
  { slug: "gdp-per-capita-ppp", label: "GDP per capita", color: "#c43e3e" },
  { slug: "real-house-price-index", label: "House prices", color: "#0880b5" },
  {
    slug: "co2-emissions-per-capita",
    label: "CO₂ per capita",
    color: "#17794d",
  },
];

export default async function OpengraphImage() {
  const responses = await Promise.all(
    FEEDS.map((feed) =>
      getEconomicSeries(feed.slug)
        .then((response) => ({ response, color: feed.color }))
        .catch(() => null),
    ),
  );
  const loaded = responses.filter((r) => r !== null);
  const chart = loaded.length > 0 ? buildOverlayOgChart(loaded) : null;

  const legendText = FEEDS.map((f) => f.label).join(" ");
  const fonts = await loadOgFonts(
    `${TITLE}${DESCRIPTION}${legendText}Canada, three series overlaid₂`,
  );

  return new ImageResponse(
    <IndicatorOgCard
      label="Prosperity Dashboard"
      title={TITLE}
      description={DESCRIPTION}
      chartHeading="Canada, three series overlaid"
      chart={chart}
      legend={FEEDS.map((f) => ({ label: f.label, color: f.color }))}
      footnote="Each series normalized to its own range"
    />,
    {
      ...size,
      fonts,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    },
  );
}
