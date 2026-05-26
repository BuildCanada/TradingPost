"use client";

import dynamic from "next/dynamic";
import type { KPIFact, KPIMeasure } from "@/lib/api/kpis";

const MeasureChart = dynamic(() => import("./MeasureChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[520px] animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
  ),
});

export default function MeasureChartClient({
  measure,
  facts,
}: {
  measure: KPIMeasure;
  facts: KPIFact[];
}) {
  return <MeasureChart measure={measure} facts={facts} />;
}
