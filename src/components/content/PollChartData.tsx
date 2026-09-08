"use client";

import { useState, type CSSProperties } from "react";
import useSWR from "swr";
import { Select } from "@buildcanada/components";
import "@buildcanada/components/src/primitives/Select/Select.scss";
import { crosstabLabel, demographicTitle, parseCrosstabs, questionCrosstabs } from "@/lib/polls/crosstabs";

async function fetchCrosstabs(url: string) {
  const response = await fetch(url, { credentials: "same-origin", cache: "no-store", signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Crosstabs unavailable");
  return parseCrosstabs(await response.json());
}

export function PollChartData({ url, questionId, locale = "en" }: { url: string; questionId: string; locale?: string }) {
  const { data, error, isLoading, mutate } = useSWR(url, fetchCrosstabs, { shouldRetryOnError: false });
  const [demographic, setDemographic] = useState("");
  const match = data ? questionCrosstabs(data, questionId) : null;
  if (isLoading) return <p role="status" className="p-4 text-sm">Loading crosstabs…</p>;
  if (error) return <p role="status" className="p-4 text-sm">Unable to load the crosstabs. <button className="underline" onClick={() => void mutate()}>Try again</button></p>;
  if (!match) return <p role="status" className="p-4 text-sm">Detailed data is not available for this question.</p>;
  const { table, columns, groups } = match;
  const overall = new Set(groups.filter((g) => g.kind === "overall").map((g) => g.id));
  const demographics = groups.filter((g) => g.kind !== "overall");
  const selected = demographics.some((g) => g.id === demographic) ? demographic : "";
  const visibleColumns = columns.filter((c) => overall.has(c.breakdownId) || c.breakdownId === selected);
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  return (
    <section className="poll-chart-data font-sans" style={{ "--poll-table-width": `${Math.max(720, 260 + visibleColumns.length * 140)}px` } as CSSProperties} aria-label="Question crosstabs">
      <div className="p-4 max-w-sm">
        <Select
          label="Demographic"
          value={selected}
          onChange={(event) => setDemographic(event.target.value)}
          options={[
            { value: "", label: "All respondents" },
            ...demographics.map((group) => ({ value: group.id, label: demographicTitle(group, locale) })),
          ]}
        />
      </div>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Crosstab results">
        <table className="w-full text-sm text-left">
          <caption className="text-left px-4 pb-3 font-medium">{crosstabLabel(table.question, locale)}</caption>
          <thead><tr><th scope="col">Answer / sample size</th>{visibleColumns.map((c) => <th scope="col" key={c.key}>{overall.has(c.breakdownId) ? "All respondents" : crosstabLabel(c.label, locale)}</th>)}</tr></thead>
          <tbody>{table.rows.map((row, i) => <tr key={`${row.id}-${i}`}>
            <th scope="row">{crosstabLabel(row.label, locale)}</th>
            {visibleColumns.map((c) => {
              const value = row.values[c.key];
              return <td key={c.key}>{table.suppressedColumns?.includes(c.key) ? <span className="text-xs" title="Fewer than 50 respondents, or sample size unavailable">Suppressed</span> : value == null ? <span aria-label="Not available">—</span> : `${number.format(value)}${row.kind === "weighted-percent" ? "%" : ""}`}</td>;
            })}
          </tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}
