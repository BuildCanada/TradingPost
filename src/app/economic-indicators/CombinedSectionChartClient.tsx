"use client";

import dynamic from "next/dynamic";
import type { CombinedChartItem } from "./CombinedSectionChart";
import type { IndicatorBenchmark } from "./indicators";

const CombinedSectionChart = dynamic(() => import("./CombinedSectionChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] animate-pulse border border-border-light bg-dark/5" />
  ),
});

export default function CombinedSectionChartClient({
  heading,
  items,
  benchmark,
}: {
  heading: string;
  items: CombinedChartItem[];
  benchmark?: IndicatorBenchmark;
}) {
  return (
    <CombinedSectionChart heading={heading} items={items} benchmark={benchmark} />
  );
}
