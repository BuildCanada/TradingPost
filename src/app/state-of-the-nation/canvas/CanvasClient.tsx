"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import type { EconomySeriesResponse } from "@/lib/api/economy";
import { SECTIONS, MEASURE_SLUGS, indicatorHeading } from "../indicators";
import type { OverlaySeries, OverlayMode } from "./overlay-types";

const CHART_LOADING = () => (
  <div className="h-[480px] animate-pulse border border-border-light bg-dark/5" />
);

// Split by mode so the default (indexed) path never pulls chart.js: indexed
// renders on @buildcanada/charts, and only raw values — which need one y-axis
// per unit, something Grapher can't express — still loads chart.js.
const OverlayIndexedChart = dynamic(() => import("./OverlayIndexedChart"), {
  ssr: false,
  loading: CHART_LOADING,
});

const OverlayChart = dynamic(() => import("./OverlayChart"), {
  ssr: false,
  loading: CHART_LOADING,
});

// auburn-600, lake-600, pine-600 from the brand palette.
const FEED_COLORS = ["#c43e3e", "#0880b5", "#17794d"];
const MAX_FEEDS = 3;
const DEFAULT_MEASURE = "gdp-per-capita-ppp";
// Canada's warehouse jurisdiction slug (the pre-existing federal CA row).
const DEFAULT_JURISDICTION = "ca";

type Feed = { measure: string; jurisdiction: string };
type MeasureData = EconomySeriesResponse | "loading" | "error";

function parseFeedsParam(param: string | null): Feed[] {
  if (!param) return [];
  return param
    .split("|")
    .map((part) => {
      const [measure, jurisdiction] = part.split(":");
      if (!measure || !MEASURE_SLUGS.has(measure)) return null;
      return { measure, jurisdiction: jurisdiction || DEFAULT_JURISDICTION };
    })
    .filter((f): f is Feed => f !== null)
    .slice(0, MAX_FEEDS);
}

function serializeFeeds(feeds: Feed[]): string {
  return feeds.map((f) => `${f.measure}:${f.jurisdiction}`).join("|");
}

// Pearson correlation over the years where both series report a value.
function pearson(
  a: { year: number; value: number }[],
  b: { year: number; value: number }[],
): { r: number; n: number } | null {
  const byYear = new Map(a.map((p) => [p.year, p.value]));
  const pairs = b
    .filter((p) => byYear.has(p.year))
    .map((p) => [byYear.get(p.year) as number, p.value]);
  const n = pairs.length;
  if (n < 3) return null;

  const meanX = pairs.reduce((s, [x]) => s + x, 0) / n;
  const meanY = pairs.reduce((s, [, y]) => s + y, 0) / n;
  let cov = 0;
  let varX = 0;
  let varY = 0;
  for (const [x, y] of pairs) {
    cov += (x - meanX) * (y - meanY);
    varX += (x - meanX) ** 2;
    varY += (y - meanY) ** 2;
  }
  if (varX === 0 || varY === 0) return null;
  return { r: cov / Math.sqrt(varX * varY), n };
}

export default function CanvasClient() {
  const searchParams = useSearchParams();

  const [feeds, setFeeds] = useState<Feed[]>(() => {
    const fromUrl = parseFeedsParam(searchParams.get("f"));
    return fromUrl.length > 0
      ? fromUrl
      : [{ measure: DEFAULT_MEASURE, jurisdiction: DEFAULT_JURISDICTION }];
  });
  const [mode, setMode] = useState<OverlayMode>(() =>
    searchParams.get("mode") === "raw" ? "raw" : "indexed",
  );
  const [dataByMeasure, setDataByMeasure] = useState<
    Record<string, MeasureData>
  >({});

  const inflightMeasures = useRef(new Set<string>());

  // A feed's stored jurisdiction can be invalid for its measure (e.g. after
  // switching to a Canada-only measure), so resolve it against the loaded
  // series at render time instead of correcting state in an effect.
  const resolvedFeeds: Feed[] = useMemo(
    () =>
      feeds.map((feed) => {
        const data = dataByMeasure[feed.measure];
        if (!data || data === "loading" || data === "error") return feed;
        const slugs = data.data.series.map((s) => s.jurisdiction.slug);
        if (slugs.includes(feed.jurisdiction)) return feed;
        return {
          ...feed,
          jurisdiction: slugs.includes(DEFAULT_JURISDICTION)
            ? DEFAULT_JURISDICTION
            : (slugs[0] ?? feed.jurisdiction),
        };
      }),
    [feeds, dataByMeasure],
  );

  // Keep the URL shareable. Shallow replaceState only — router.replace would
  // refetch the RSC payload and remount this component on every change.
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("f", serializeFeeds(resolvedFeeds));
    if (mode !== "indexed") params.set("mode", mode);
    const next = `/state-of-the-nation/canvas?${params.toString()}`;
    if (`${window.location.pathname}${window.location.search}` !== next) {
      window.history.replaceState(null, "", next);
    }
  }, [resolvedFeeds, mode]);

  // Fetch series data for any selected measure we haven't loaded yet.
  useEffect(() => {
    for (const feed of feeds) {
      const measure = feed.measure;
      if (dataByMeasure[measure] || inflightMeasures.current.has(measure)) {
        continue;
      }
      inflightMeasures.current.add(measure);
      fetch(`/api/economy/series?measure=${encodeURIComponent(measure)}`)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((json: EconomySeriesResponse) =>
          setDataByMeasure((prev) => ({ ...prev, [measure]: json })),
        )
        .catch(() =>
          setDataByMeasure((prev) => ({ ...prev, [measure]: "error" })),
        )
        .finally(() => inflightMeasures.current.delete(measure));
    }
  }, [feeds, dataByMeasure]);

  const overlaySeries: (OverlaySeries | null)[] = useMemo(
    () =>
      resolvedFeeds.map((feed, i) => {
        const data = dataByMeasure[feed.measure];
        if (!data || data === "loading" || data === "error") return null;
        const series = data.data.series.find(
          (s) => s.jurisdiction.slug === feed.jurisdiction,
        );
        if (!series) return null;
        return {
          label: `${indicatorHeading(feed.measure)} — ${series.jurisdiction.name}`,
          color: FEED_COLORS[i],
          unitSymbol: data.data.measure.unit.symbol,
          points: series.points,
        };
      }),
    [resolvedFeeds, dataByMeasure],
  );

  const loadedSeries = overlaySeries.filter(
    (s): s is OverlaySeries => s !== null,
  );

  const updateFeed = (index: number, patch: Partial<Feed>) =>
    setFeeds((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    );

  const correlations = useMemo(() => {
    const out: { a: string; b: string; r: number; n: number }[] = [];
    for (let i = 0; i < loadedSeries.length; i++) {
      for (let j = i + 1; j < loadedSeries.length; j++) {
        const result = pearson(loadedSeries[i].points, loadedSeries[j].points);
        if (result) {
          out.push({
            a: loadedSeries[i].label,
            b: loadedSeries[j].label,
            ...result,
          });
        }
      }
    }
    return out;
    // loadedSeries is derived fresh each render from overlaySeries.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlaySeries]);

  return (
    <div>
      {/* Chart is the primary content — it comes first. */}
      <div>
        {loadedSeries.length > 0 ? (
          mode === "indexed" ? (
            <OverlayIndexedChart series={loadedSeries} />
          ) : (
            <OverlayChart series={loadedSeries} />
          )
        ) : (
          <div className="flex h-[480px] items-center justify-center border border-border-light">
            <p className="type-body text-dark/60">
              {feeds.some((f) => dataByMeasure[f.measure] === "error")
                ? "Data is temporarily unavailable."
                : "Loading data…"}
            </p>
          </div>
        )}
      </div>

      {/* Subtle controls, tucked beneath the chart. */}
      <div className="mt-6 border-t border-border-light pt-5">
        <div className="space-y-2">
          {resolvedFeeds.map((feed, i) => {
            const data = dataByMeasure[feed.measure];
            const jurisdictions =
              data && data !== "loading" && data !== "error"
                ? data.data.series.map((s) => s.jurisdiction)
                : [];
            return (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: FEED_COLORS[i] }}
                />
                <select
                  aria-label={`Feed ${i + 1} indicator`}
                  value={feed.measure}
                  onChange={(e) => updateFeed(i, { measure: e.target.value })}
                  className="type-label-sm border-0 bg-transparent px-1 py-0.5 text-dark/80 hover:text-dark focus:outline-none focus:ring-0"
                >
                  {SECTIONS.map((section) => (
                    <optgroup key={section.id} label={section.title}>
                      {section.indicators.map((indicator) => (
                        <option key={indicator.slug} value={indicator.slug}>
                          {indicator.heading}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <select
                  aria-label={`Feed ${i + 1} jurisdiction`}
                  value={feed.jurisdiction}
                  onChange={(e) =>
                    updateFeed(i, { jurisdiction: e.target.value })
                  }
                  disabled={jurisdictions.length === 0}
                  className="type-label-sm border-0 bg-transparent px-1 py-0.5 text-dark/60 hover:text-dark focus:outline-none focus:ring-0 disabled:opacity-50"
                >
                  {jurisdictions.length === 0 ? (
                    <option value={feed.jurisdiction}>
                      {data === "error" ? "unavailable" : "loading…"}
                    </option>
                  ) : (
                    jurisdictions.map((j) => (
                      <option key={j.slug} value={j.slug}>
                        {j.name}
                      </option>
                    ))
                  )}
                </select>
                {data === "error" && (
                  <span className="type-label-sm text-accent">
                    Failed to load this indicator.
                  </span>
                )}
                {feeds.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setFeeds((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="ml-auto type-label-sm text-dark/40 hover:text-dark"
                    aria-label={`Remove feed ${i + 1}`}
                  >
                    &times;
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          {feeds.length < MAX_FEEDS && (
            <button
              type="button"
              onClick={() =>
                setFeeds((prev) => [
                  ...prev,
                  {
                    measure: DEFAULT_MEASURE,
                    jurisdiction: DEFAULT_JURISDICTION,
                  },
                ])
              }
              className="type-label-sm text-dark/60 hover:text-dark underline underline-offset-4"
            >
              + Add data feed
            </button>
          )}

          <fieldset className="flex items-center gap-3">
            <legend className="sr-only">Scale mode</legend>
            {(
              [
                ["indexed", "Indexed (first shared year = 100)"],
                ["raw", "Raw values (separate axes)"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="flex items-center gap-1.5 type-label-sm text-dark/60"
              >
                <input
                  type="radio"
                  name="mode"
                  value={value}
                  checked={mode === value}
                  onChange={() => setMode(value)}
                />
                {label}
              </label>
            ))}
          </fieldset>
        </div>

        {correlations.length > 0 && (
          <div className="mt-4 space-y-0.5">
            {correlations.map((c) => (
              <p
                key={`${c.a}|${c.b}`}
                className="type-label-sm text-dark/60"
              >
                r = {c.r.toFixed(2)} &middot; {c.a} vs {c.b}{" "}
                <span className="text-dark/40">
                  ({c.n} overlapping points; correlation &ne; causation)
                </span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
