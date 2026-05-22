"use client";

import { useMemo, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { YFAgreement, YFAgreementStatus } from "@/lib/api/types";
import { AGREEMENT_STATUS_LABEL } from "./utils";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const STATUS_COLORS: Record<YFAgreementStatus, string> = {
  awaiting_sponsorship: "#f59e0b",
  under_negotiation: "#3b82f6",
  agreement_reached: "#10b981",
  partially_implemented: "#8b5cf6",
  implemented: "#059669",
  deferred: "#ef4444",
};

interface MonthlyData {
  month: string;
  year: number;
  monthName: string;
  changes: number;
  statusBreakdown: Partial<Record<YFAgreementStatus, number>>;
}

export default function ActivityChart({
  agreements,
}: {
  agreements: YFAgreement[];
}) {
  const [timeRange, setTimeRange] = useState<"12months" | "alltime">(
    "12months",
  );

  const allChanges = useMemo(() => {
    const out: { date: Date; status: YFAgreementStatus }[] = [];
    agreements.forEach((a) =>
      a.history.forEach((h) =>
        out.push({ date: new Date(h.date_entered), status: h.status }),
      ),
    );
    return out;
  }, [agreements]);

  const earliestDate = useMemo(() => {
    if (!allChanges.length) return new Date("2018-01-01");
    const min = new Date(Math.min(...allChanges.map((c) => c.date.getTime())));
    min.setDate(1);
    return min;
  }, [allChanges]);

  const filteredChanges = useMemo(() => {
    if (timeRange === "12months") {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      return allChanges.filter((c) => c.date >= twelveMonthsAgo);
    }
    return allChanges.filter((c) => c.date >= earliestDate);
  }, [allChanges, timeRange, earliestDate]);

  const monthlyData = useMemo<MonthlyData[]>(() => {
    const map = new Map<
      string,
      { total: number; statusBreakdown: Partial<Record<YFAgreementStatus, number>> }
    >();
    filteredChanges.forEach((c) => {
      const key = `${c.date.getFullYear()}-${String(c.date.getMonth() + 1).padStart(2, "0")}`;
      const entry = map.get(key) ?? { total: 0, statusBreakdown: {} };
      entry.total += 1;
      entry.statusBreakdown[c.status] = (entry.statusBreakdown[c.status] ?? 0) + 1;
      map.set(key, entry);
    });

    const data: MonthlyData[] = [];
    const now = new Date();
    if (timeRange === "12months") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const entry = map.get(key) ?? { total: 0, statusBreakdown: {} };
        data.push({
          month: key,
          year: d.getFullYear(),
          monthName: d.toLocaleDateString("en-US", { month: "short" }),
          changes: entry.total,
          statusBreakdown: entry.statusBreakdown,
        });
      }
    } else {
      const d = new Date(earliestDate);
      while (d <= now) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const entry = map.get(key) ?? { total: 0, statusBreakdown: {} };
        data.push({
          month: key,
          year: d.getFullYear(),
          monthName: d.toLocaleDateString("en-US", { month: "short" }),
          changes: entry.total,
          statusBreakdown: entry.statusBreakdown,
        });
        d.setMonth(d.getMonth() + 1);
      }
    }
    return data;
  }, [filteredChanges, timeRange, earliestDate]);

  const chartData = useMemo(() => {
    const labels = monthlyData.map((m, i) => {
      const prev = monthlyData[i - 1];
      const showYear = m.monthName === "Jan" || !prev || prev.year !== m.year;
      return showYear ? `${m.monthName} ${m.year}` : m.monthName;
    });
    const allStatuses = new Set<YFAgreementStatus>();
    monthlyData.forEach((m) =>
      (Object.keys(m.statusBreakdown) as YFAgreementStatus[]).forEach((s) =>
        allStatuses.add(s),
      ),
    );
    const datasets = Array.from(allStatuses).map((status) => ({
      label: AGREEMENT_STATUS_LABEL[status],
      data: monthlyData.map((m) => m.statusBreakdown[status] ?? 0),
      backgroundColor: STATUS_COLORS[status],
      borderColor: STATUS_COLORS[status],
      borderWidth: 1,
    }));
    return { labels, datasets };
  }, [monthlyData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: { usePointStyle: true, pointStyle: "circle" as const },
      },
    },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: {
        stacked: true,
        beginAtZero: true,
        title: { display: true, text: "# of changes" },
      },
    },
    interaction: { intersect: false, mode: "index" as const },
  };

  return (
    <div className="bg-white border border-[#cdc4bd] rounded-md mb-8">
      <div className="p-6 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-mono font-semibold uppercase tracking-wide text-gray-800">
            Activity Timeline
          </h3>
          <div className="text-xs text-gray-500 font-mono uppercase tracking-wide">
            {timeRange === "12months"
              ? "Number of status changes over the last 12 months"
              : "Number of status changes since earliest recorded agreement"}
          </div>
        </div>
        <div className="flex gap-2">
          <RangeButton
            active={timeRange === "12months"}
            onClick={() => setTimeRange("12months")}
          >
            12 Months
          </RangeButton>
          <RangeButton
            active={timeRange === "alltime"}
            onClick={() => setTimeRange("alltime")}
          >
            All Time
          </RangeButton>
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="h-64 w-full">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
}

function RangeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-mono uppercase tracking-wide px-3 py-1.5 rounded border ${
        active
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-white text-gray-700 border-[#cdc4bd] hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}
