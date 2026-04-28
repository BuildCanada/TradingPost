"use client";

import { useMemo } from "react";
import type { YFAgreement } from "@/lib/api/types";

export default function KPICards({ agreements }: { agreements: YFAgreement[] }) {
  const kpiData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const lastFullYear = currentYear - 1;

    const currentYearStart = new Date(currentYear, 0, 1);
    const previousYearStart = new Date(lastFullYear, 0, 1);
    const previousYearEnd = new Date(lastFullYear, 11, 31, 23, 59, 59);

    const getStaleAgreementsAtTime = (asOfDate: Date) =>
      agreements.filter((a) => {
        if (a.status === "awaiting_sponsorship" || a.status === "implemented") {
          return false;
        }
        if (!a.history.length) return true;
        const last = a.history[a.history.length - 1];
        const lastDate = new Date(last.date_entered);
        const cutoff = new Date(asOfDate);
        cutoff.setFullYear(asOfDate.getFullYear() - 1);
        return lastDate < cutoff;
      });

    const getNegotiationsInPeriod = (start: Date, end: Date) =>
      agreements.filter((a) => {
        const entry = a.history.find((h, i) => {
          if (h.status !== "under_negotiation") return false;
          if (i === 0) return true;
          return a.history[i - 1].status !== "under_negotiation";
        });
        if (!entry) return false;
        const d = new Date(entry.date_entered);
        return d >= start && d <= end;
      });

    const currentStale = getStaleAgreementsAtTime(now);
    const currentNegotiations = getNegotiationsInPeriod(currentYearStart, now);
    const previousStale = getStaleAgreementsAtTime(previousYearEnd);
    const previousNegotiations = getNegotiationsInPeriod(
      previousYearStart,
      previousYearEnd,
    );

    const currentStalePct =
      agreements.length > 0 ? (currentStale.length / agreements.length) * 100 : 0;
    const previousStalePct =
      agreements.length > 0 ? (previousStale.length / agreements.length) * 100 : 0;

    return {
      staleAgreementsCount: currentStale.length,
      recentNegotiationsCount: currentNegotiations.length,
      stalePercentageChange: currentStalePct - previousStalePct,
      negotiationsChange:
        currentNegotiations.length - previousNegotiations.length,
    };
  }, [agreements]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white border border-[#cdc4bd] rounded-md p-4">
        <div className="text-sm font-mono font-semibold uppercase tracking-wide text-gray-700 mb-3">
          Stale Agreements
        </div>
        <div className="text-3xl font-bold font-mono text-orange-500 mb-2">
          {agreements.length === 0
            ? "--%"
            : `${Math.round((kpiData.staleAgreementsCount / agreements.length) * 100)}%`}
        </div>
        <div className="text-xs text-gray-500 font-mono uppercase tracking-wide">
          % of Agreements Stagnant for &gt;12 Months
        </div>
        <div className="text-xs text-gray-500 font-mono uppercase tracking-wide mt-1">
          ({kpiData.stalePercentageChange >= 0 ? "+" : ""}
          {Math.round(kpiData.stalePercentageChange)}% v{" "}
          {new Date().getFullYear() - 1})
        </div>
      </div>
      <div className="bg-white border border-[#cdc4bd] rounded-md p-4">
        <div className="text-sm font-mono font-semibold uppercase tracking-wide text-gray-700 mb-3">
          Recent Negotiations
        </div>
        <div className="text-3xl font-bold font-mono text-blue-500 mb-2">
          {kpiData.recentNegotiationsCount}
        </div>
        <div className="text-xs text-gray-500 font-mono uppercase tracking-wide">
          Negotiations Started on New Barriers (Last 12 Months)
        </div>
        <div className="text-xs text-gray-500 font-mono uppercase tracking-wide mt-1">
          ({kpiData.negotiationsChange >= 0 ? "+" : ""}
          {kpiData.negotiationsChange} v {new Date().getFullYear() - 1})
        </div>
      </div>
    </div>
  );
}
