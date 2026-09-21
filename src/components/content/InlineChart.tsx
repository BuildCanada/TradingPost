"use client";

import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Chart,
  DataTable,
  Tooltip,
  resolveBindings,
  type DataTableSort,
  type DataTableScope,
  type ChartType,
} from "@buildcanada/charts-inline";
import "@buildcanada/charts-inline/styles.css";
import "./inline-chart.css";
import { PollChartData } from "./PollChartData";
import { parseInlineChart } from "@/lib/charts/inline-chart";

class ChartBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p role="status">
        This chart could not be displayed. Please see the report downloads.
      </p>
    ) : (
      this.props.children
    );
  }
}

function InteractiveChart({ source, crosstabsUrl }: { source: string; crosstabsUrl?: string }) {
  const result = useMemo(() => {
    try {
      return { chart: parseInlineChart(source), error: null };
    } catch (error) {
      return {
        chart: null,
        error: error instanceof Error ? error.message : "Invalid chart",
      };
    }
  }, [source]);
  const [tab, setTab] = useState<ChartType | null>(null);
  const [showData, setShowData] = useState(
    result.chart?.definition.defaultTab === "table",
  );
  const [sort, setSort] = useState<DataTableSort>({
    column: "entity",
    order: "asc",
  });
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<DataTableScope>("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const measure = () => setWidth(Math.max(1, element.clientWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  if (!result.chart)
    return <p role="status">Chart unavailable: {result.error}</p>;
  const { definition, dataset } = result.chart;
  const types = definition.types;
  const activeType =
    tab ??
    (types.includes(definition.defaultTab as ChartType)
      ? (definition.defaultTab as ChartType)
      : types[0]);
  const height = Math.max(420, Math.min(900, dataset.entities.length * 40 + 200));
  return (
    <figure
      className="poll-inline-chart not-prose my-8 min-w-0"
      aria-label={definition.title}
    >
      <div className="print-hide flex flex-wrap gap-3 mb-3">
        {types.length > 1 && (
          <label className="type-label">
            Chart view{" "}
            <select
              value={activeType}
              onChange={(e) => setTab(e.target.value as ChartType)}
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type.replaceAll("-", " ")}
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          type="button"
          className="type-label underline"
          aria-expanded={showData}
          onClick={() => setShowData(!showData)}
        >
          {showData ? "Hide data" : "View data"}
        </button>
      </div>
      <div ref={containerRef}>
        <Chart
          definition={definition}
          dataset={dataset}
          initialView={{ tab: activeType }}
          key={activeType}
          height={height}
          syncUrl={false}
          renderTooltip={({ tooltip, x, y }) => (
            <div
              className="poll-chart-tooltip-frame"
              style={{ left: -x, top: -y, width, height }}
            >
              <Tooltip model={tooltip} x={x} y={y} bounds={{ width, height }} />
            </div>
          )}
        />
      </div>
      {showData && crosstabsUrl ? (
        <PollChartData url={crosstabsUrl} questionId={definition.slug ?? ""} locale={definition.locale} />
      ) : showData && (
        <div className="overflow-x-auto mt-4">
          <DataTable
            dataset={dataset}
            columns={Object.fromEntries(
              Object.entries(
                resolveBindings(definition, dataset.manifest).columns,
              ).filter(([slug]) => definition.y.includes(slug)),
            )}
            entities={definition.selectedEntities ?? [...dataset.entities]}
            timeSelection={
              definition.time ?? { start: "latest", end: "latest" }
            }
            grain={dataset.manifest.timeGrain}
            locale={definition.locale ?? "en"}
            scope={scope}
            onScopeChange={setScope}
            sort={sort}
            onSortChange={setSort}
            searchQuery={search}
            onSearchChange={setSearch}
          />
        </div>
      )}
    </figure>
  );
}

export function InlineChart({ source, crosstabsUrl }: { source: string; crosstabsUrl?: string }) {
  return (
    <ChartBoundary key={source}>
      <InteractiveChart source={source} crosstabsUrl={crosstabsUrl} />
    </ChartBoundary>
  );
}
