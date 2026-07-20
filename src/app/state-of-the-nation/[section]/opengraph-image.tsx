import { ImageResponse } from "next/og";
import { getEconomicSeries, humanizeSourceName } from "@/lib/api/economy";
import { SECTIONS } from "../indicators";
import {
  buildOgChart,
  IndicatorOgCard,
  loadOgFonts,
  OG_SIZE,
} from "../og-card";

export const runtime = "nodejs";

export const alt = "Build Canada — State of the Nation";

export const size = OG_SIZE;

export const contentType = "image/png";

export const revalidate = 3600;

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: sectionId } = await params;
  const section = SECTIONS.find((s) => s.id === sectionId);

  const title = section?.title ?? "State of the Nation";
  const description =
    section?.description ??
    "Are we moving in the right direction? Canadian prosperity, measured against the G7 and OECD.";
  const featured = section
    ? section.indicators.find((i) => i.slug === section.featuredSlug)
    : undefined;

  const response = featured
    ? await getEconomicSeries(featured.slug).catch(() => null)
    : null;
  const chart = response ? buildOgChart(response) : null;
  const chartHeading = featured?.heading ?? "";
  const source = response?.meta.source;
  const footnote = source ? `Source: ${humanizeSourceName(source.name)}` : "";

  const fonts = await loadOgFonts(
    `${title}${description}${chartHeading}${chart?.latestLabel ?? ""}${footnote}State of the Nation`,
  );

  return new ImageResponse(
    <IndicatorOgCard
      label="State of the Nation"
      title={title}
      description={description}
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
