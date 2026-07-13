import { ImageResponse } from "next/og";
import { getEconomicSeries, humanizeSourceName } from "@/lib/api/economy";
import { indicatorHeading } from "./indicators";
import {
  buildOgChart,
  IndicatorOgCard,
  loadOgFonts,
  OG_SIZE,
} from "./og-card";

export const runtime = "nodejs";

export const alt =
  "Build Canada — Economic Indicators: Canadian prosperity, measured against the G7 and OECD";

export const size = OG_SIZE;

export const contentType = "image/png";

export const revalidate = 3600;

// The landing card leads with the dashboard's clearest single chart.
const FEATURED_SLUG = "gdp-per-capita-ppp";

const TITLE = "Economic Indicators";
const DESCRIPTION =
  "Are we moving in the right direction? Canadian prosperity, measured against the G7 and OECD.";

export default async function OpengraphImage() {
  const response = await getEconomicSeries(FEATURED_SLUG).catch(() => null);
  const chart = response ? buildOgChart(response) : null;
  const chartHeading = indicatorHeading(FEATURED_SLUG);
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
