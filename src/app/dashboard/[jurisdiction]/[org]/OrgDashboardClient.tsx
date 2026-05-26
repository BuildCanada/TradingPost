"use client";

import dynamic from "next/dynamic";
import type { MeasureWithFacts } from "./types";

const OrgDashboard = dynamic(() => import("./OrgDashboard"), {
  ssr: false,
  loading: () => (
    <div className="h-[520px] animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
  ),
});

export default function OrgDashboardClient({
  items,
}: {
  items: MeasureWithFacts[];
}) {
  return <OrgDashboard items={items} />;
}
