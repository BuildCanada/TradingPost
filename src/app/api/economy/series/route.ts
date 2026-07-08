import { NextRequest, NextResponse } from "next/server";
import { getEconomicSeries } from "@/lib/api/economy";
import { MEASURE_SLUGS } from "@/app/economic-indicators/indicators";

// Same-origin proxy for york_factory's public series endpoint so client
// components (the canvas page) can fetch without cross-origin config. The
// upstream fetch is server-cached for an hour by getEconomicSeries.
export async function GET(request: NextRequest) {
  const measure = request.nextUrl.searchParams.get("measure");

  if (!measure || !MEASURE_SLUGS.has(measure)) {
    return NextResponse.json({ error: "Unknown measure" }, { status: 400 });
  }

  try {
    const response = await getEconomicSeries(measure);
    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, s-maxage=3600, max-age=600" },
    });
  } catch {
    return NextResponse.json(
      { error: "Upstream data unavailable" },
      { status: 502 },
    );
  }
}
