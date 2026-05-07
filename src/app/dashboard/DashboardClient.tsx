"use client";

import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("./Dashboard"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="h-[660px] animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
    </div>
  ),
});

export default function DashboardClient() {
  return <Dashboard />;
}
