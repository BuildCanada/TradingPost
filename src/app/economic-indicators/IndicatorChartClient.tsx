"use client";

import dynamic from "next/dynamic";
import type { EconomySeriesResponse } from "@/lib/api/economy";
import type { IndicatorBenchmark } from "./indicators";

const IndicatorChart = dynamic(() => import("./IndicatorChart"), {
  ssr: false,
  loading: () => (
    // Mirrors the useChartSize clamp so deep-link hash scrolls stay accurate
    // when the placeholder swaps for the real chart.
    <div className="h-[clamp(338px,50vw_-_20px,478px)] animate-pulse border border-border-light bg-dark/5" />
  ),
});

export default function IndicatorChartClient({
  response,
  benchmark,
}: {
  response: EconomySeriesResponse;
  benchmark?: IndicatorBenchmark;
}) {
  return <IndicatorChart response={response} benchmark={benchmark} />;
}
