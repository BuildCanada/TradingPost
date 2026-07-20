import { ImageResponse } from "next/og";
import { getEconomicSeries, humanizeSourceName } from "@/lib/api/economy";
import {
  buildOgChart,
  IndicatorOgCard,
  loadOgFonts,
  OG_SIZE,
} from "./og-card";

export const runtime = "nodejs";

export const alt =
  "Build Canada — State of the Nation: Canadian prosperity, measured";

export const size = OG_SIZE;

export const contentType = "image/png";

export const revalidate = 3600;

// The landing card leads with the dashboard's clearest single chart —
// StatCan's quarterly real GDP per capita, matching the page's headline.
const FEATURED_SLUG = "gdp-per-capita-canada";
const CHART_HEADING = "GDP per capita";

const TITLE = "State of the Nation";
const DESCRIPTION =
  "Are we moving in the right direction? Canadian prosperity, measured.";

export default async function OpengraphImage() {
  // Canada only, matching the dashboard's charts.
  const response = await getEconomicSeries(FEATURED_SLUG, {
    jurisdictions: "ca",
  }).catch(() => null);
  const chart = response ? buildOgChart(response) : null;
  const chartHeading = CHART_HEADING;
  const source = response?.meta.source;
  const footnote = source ? `Source: ${humanizeSourceName(source.name)}` : "";

  const fonts = await loadOgFonts(
    `${TITLE}${DESCRIPTION}${chartHeading}${chart?.latestLabel ?? ""}${footnote}`,
  );

  return new ImageResponse(
    <IndicatorOgCard
      label="Dashboard"
      title={TITLE}
      description={DESCRIPTION}
      chartHeading={chartHeading}
      chart={chart}
      footnote={footnote}
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
