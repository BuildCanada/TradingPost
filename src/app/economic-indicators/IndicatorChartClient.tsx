"use client";

import dynamic from "next/dynamic";
import type { EconomySeriesResponse } from "@/lib/api/economy";
import type { IndicatorBenchmark } from "./indicators";

const IndicatorChart = dynamic(() => import("./IndicatorChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] animate-pulse border border-border-light bg-dark/5" />
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
