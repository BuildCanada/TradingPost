"use client";

import dynamic from "next/dynamic";
import type { KPICitation, KPIFact, KPIMeasure } from "@/lib/api/kpis";

const MeasureChart = dynamic(() => import("./MeasureChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[520px] animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
  ),
});

export default function MeasureChartClient({
  measure,
  facts,
  citations,
}: {
  measure: KPIMeasure;
  facts: KPIFact[];
  citations: KPICitation[];
}) {
  return <MeasureChart measure={measure} facts={facts} citations={citations} />;
}
