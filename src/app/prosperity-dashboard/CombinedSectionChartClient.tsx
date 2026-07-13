"use client";

import dynamic from "next/dynamic";
import type { CombinedChartItem } from "./CombinedSectionChart";
import type { IndicatorBenchmark } from "./indicators";

const CombinedSectionChart = dynamic(() => import("./CombinedSectionChart"), {
  ssr: false,
  loading: () => (
    // Mirrors the useChartSize clamp so deep-link hash scrolls stay accurate
    // when the placeholder swaps for the real chart.
    <div className="-mx-3 sm:mx-0 h-[clamp(338px,105vw_-_41px,418px)] sm:h-[clamp(338px,50vw_-_20px,478px)] animate-pulse border border-border-light bg-dark/5" />
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
