"use client";

import dynamic from "next/dynamic";
import type { EconomySeriesResponse } from "@/lib/api/economy";

const IndicatorChart = dynamic(() => import("./IndicatorChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] animate-pulse border border-border-light bg-dark/5" />
  ),
});

export default function IndicatorChartClient({
  response,
}: {
  response: EconomySeriesResponse;
}) {
  return <IndicatorChart response={response} />;
}
