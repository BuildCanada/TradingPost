import type { Metadata } from "next";
import Link from "next/link";
import {
  getOrganization,
  listFactsForOrg,
  listMeasuresForOrg,
} from "@/lib/api/kpis";
import type { KPIFact, KPIMeasure } from "@/lib/api/kpis";

interface PageParams {
  jurisdiction: string;
  org: string;
}

interface SearchParams {
  from?: string;
  to?: string;
  coverage?: string;
}

const COVERAGE_BUCKETS: { key: string; label: string; test: (n: number) => boolean }[] = [
  { key: "1", label: "1 year", test: (n) => n === 1 },
  { key: "2-3", label: "2–3 years", test: (n) => n >= 2 && n <= 3 },
  { key: "4-6", label: "4–6 years", test: (n) => n >= 4 && n <= 6 },
  { key: "7-10", label: "7–10 years", test: (n) => n >= 7 && n <= 10 },
  { key: "11plus", label: "11+ years", test: (n) => n >= 11 },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { jurisdiction, org } = await params;
  try {
    const o = await getOrganization(jurisdiction, org);
    return {
      title: `${o.canonical_name} — KPI Dashboard`,
      description:
        o.description ??
        `Tracked performance measures for ${o.canonical_name}.`,
      alternates: { canonical: `/dashboard/${jurisdiction}/${org}` },
    };
  } catch {
    return { title: "KPI Dashboard" };
  }
}

const TYPE_PRIORITY: Record<string, number> = {
  actual: 0,
  target: 1,
  forecast: 2,
  planned: 3,
};

function latestActual(facts: KPIFact[]): KPIFact | null {
  const actuals = facts.filter(
    (f) =>
      f.value_type === "actual" &&
      f.period_basis === "full_year" &&
      f.value_numeric !== null,
  );
  if (actuals.length === 0) return null;
  return actuals.reduce((acc, f) =>
    f.measurement_year > acc.measurement_year ? f : acc,
  );
}

function latestActualInRange(
  facts: KPIFact[],
  from: number,
  to: number,
): KPIFact | null {
  const inRange = facts.filter(
    (f) =>
      f.measurement_year >= from &&
      f.measurement_year <= to &&
      f.period_basis === "full_year" &&
      f.value_numeric !== null,
  );
  if (inRange.length === 0) return null;
  return inRange.reduce((acc, f) => {
    const ap = TYPE_PRIORITY[acc.value_type] ?? 99;
    const fp = TYPE_PRIORITY[f.value_type] ?? 99;
    if (fp !== ap) return fp < ap ? f : acc;
    return f.measurement_year > acc.measurement_year ? f : acc;
  });
}

function distinctYears(
  facts: KPIFact[],
  from: number | null,
  to: number | null,
): number {
  const years = new Set<number>();
  for (const f of facts) {
    if (f.value_numeric === null || f.period_basis !== "full_year") continue;
    if (from !== null && f.measurement_year < from) continue;
    if (to !== null && f.measurement_year > to) continue;
    years.add(f.measurement_year);
  }
  return years.size;
}

function Sparkline({
  facts,
  width = 140,
  height = 36,
}: {
  facts: KPIFact[];
  width?: number;
  height?: number;
}) {
  const points = facts
    .filter(
      (f) =>
        f.value_numeric !== null &&
        f.period_basis === "full_year" &&
        f.value_type === "actual",
    )
    .map((f) => ({ x: f.measurement_year, y: f.value_numeric as number }))
    .sort((a, b) => a.x - b.x);

  if (points.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-[10px] text-gray-400"
        style={{ width, height }}
      >
        no actuals
      </div>
    );
  }

  const pad = 2;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const xSpan = xMax - xMin || 1;
  const ySpan = yMax - yMin || Math.max(1, Math.abs(yMax));

  const toX = (x: number) =>
    pad + ((x - xMin) / xSpan) * (width - pad * 2);
  const toY = (y: number) =>
    height - pad - ((y - yMin) / ySpan) * (height - pad * 2);

  if (points.length === 1) {
    return (
      <svg width={width} height={height} className="overflow-visible">
        <circle cx={width / 2} cy={height / 2} r={2.5} className="fill-gray-900" />
      </svg>
    );
  }

  const path = points.map((p) => `${toX(p.x)},${toY(p.y)}`).join(" ");
  const last = points[points.length - 1];

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-700"
      />
      <circle
        cx={toX(last.x)}
        cy={toY(last.y)}
        r={2}
        className="fill-gray-900"
      />
    </svg>
  );
}

function formatValue(value: number, unit: KPIMeasure["unit"]): string {
  const abs = Math.abs(value);
  const decimals = abs >= 1000 ? 0 : abs >= 10 ? 1 : 2;
  const formatted = value.toLocaleString("en-CA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  return `${formatted} ${unit.symbol}`;
}

export default async function OrgOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { jurisdiction, org } = await params;
  const {
    from: fromParam,
    to: toParam,
    coverage: coverageParam,
  } = await searchParams;

  const [orgData, measures, facts] = await Promise.all([
    getOrganization(jurisdiction, org).catch(() => null),
    listMeasuresForOrg(jurisdiction, org).catch(() => [] as KPIMeasure[]),
    listFactsForOrg(jurisdiction, org).catch(() => [] as KPIFact[]),
  ]);

  const factsByMeasure = new Map<number, KPIFact[]>();
  for (const f of facts) {
    if (!factsByMeasure.has(f.measure_id)) factsByMeasure.set(f.measure_id, []);
    factsByMeasure.get(f.measure_id)!.push(f);
  }

  const availableYears = Array.from(
    new Set(
      facts
        .filter((f) => f.value_numeric !== null && f.period_basis === "full_year")
        .map((f) => f.measurement_year),
    ),
  ).sort((a, b) => b - a);

  const rawFrom = fromParam ? Number.parseInt(fromParam, 10) : NaN;
  const rawTo = toParam ? Number.parseInt(toParam, 10) : NaN;
  const fromYear = Number.isFinite(rawFrom) ? rawFrom : null;
  const toYear = Number.isFinite(rawTo) ? rawTo : null;
  const [normFrom, normTo] =
    fromYear !== null && toYear !== null && fromYear > toYear
      ? [toYear, fromYear]
      : [fromYear, toYear];
  const bothBounds = normFrom !== null && normTo !== null;
  const anyBound = normFrom !== null || normTo !== null;
  const spanLength = bothBounds ? normTo - normFrom + 1 : 0;

  const allItems = measures
    .map((m) => ({ measure: m, facts: factsByMeasure.get(m.id) ?? [] }))
    .filter((i) => i.facts.some((f) => f.value_numeric !== null));

  const itemsWithCoverage = allItems.map((i) => ({
    ...i,
    coverage: distinctYears(i.facts, null, null),
    coverageInRange: anyBound ? distinctYears(i.facts, normFrom, normTo) : 0,
  }));

  const coverageBucket = COVERAGE_BUCKETS.find((b) => b.key === coverageParam) ?? null;
  const facetCounts = COVERAGE_BUCKETS.map((b) => ({
    bucket: b,
    count: itemsWithCoverage.filter((i) => b.test(i.coverage)).length,
  }));

  const afterRange = bothBounds
    ? itemsWithCoverage.filter((i) => i.coverageInRange === spanLength)
    : anyBound
      ? itemsWithCoverage.filter((i) => i.coverageInRange > 0)
      : itemsWithCoverage;

  const filtered = coverageBucket
    ? afterRange.filter((i) => coverageBucket.test(i.coverage))
    : afterRange;

  const items = filtered.sort((a, b) => {
    if (b.coverage !== a.coverage) return b.coverage - a.coverage;
    return a.measure.canonical_name.localeCompare(b.measure.canonical_name);
  });

  const basePath = `/dashboard/${jurisdiction}/${org}`;

  const buildQuery = (overrides: Partial<SearchParams>): string => {
    const next: Record<string, string> = {};
    if (normFrom !== null) next.from = String(normFrom);
    if (normTo !== null) next.to = String(normTo);
    if (coverageParam) next.coverage = coverageParam;
    for (const [k, v] of Object.entries(overrides)) {
      if (v === null || v === undefined || v === "") delete next[k];
      else next[k] = v;
    }
    const qs = new URLSearchParams(next).toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div>
      {orgData?.description && (
        <p className="mb-6 max-w-3xl text-sm text-gray-700">
          {orgData.description}
        </p>
      )}

      {availableYears.length > 0 && (
        <form
          method="get"
          action={basePath}
          className="mb-4 flex flex-wrap items-end gap-3"
        >
          {coverageParam && (
            <input type="hidden" name="coverage" value={coverageParam} />
          )}
          <div>
            <label
              htmlFor="from"
              className="block text-[11px] uppercase tracking-wide text-gray-500"
            >
              From
            </label>
            <select
              id="from"
              name="from"
              defaultValue={normFrom ?? ""}
              className="mt-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm"
            >
              <option value="">—</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="to"
              className="block text-[11px] uppercase tracking-wide text-gray-500"
            >
              To
            </label>
            <select
              id="to"
              name="to"
              defaultValue={normTo ?? ""}
              className="mt-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm"
            >
              <option value="">—</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-md border border-gray-900 bg-gray-900 px-3 py-1.5 text-xs text-white transition-colors hover:bg-gray-700"
          >
            Apply
          </button>
          {anyBound && (
            <Link
              href={buildQuery({ from: "", to: "" })}
              prefetch={false}
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 transition-colors hover:border-gray-400"
            >
              Clear range
            </Link>
          )}
          {bothBounds && (
            <span className="ml-1 text-xs text-gray-500">
              Long-running only: measures with data in every year of{" "}
              {normFrom}–{normTo}.
            </span>
          )}
          {!bothBounds && normFrom !== null && (
            <span className="ml-1 text-xs text-gray-500">
              Measures with at least one data point in {normFrom} or later.
            </span>
          )}
          {!bothBounds && normTo !== null && (
            <span className="ml-1 text-xs text-gray-500">
              Measures with at least one data point in {normTo} or earlier.
            </span>
          )}
        </form>
      )}

      <div className="mb-6">
        <div className="mb-2 text-[11px] uppercase tracking-wide text-gray-500">
          Data points (distinct years, lifetime)
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Link
            href={buildQuery({ coverage: "" })}
            prefetch={false}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              coverageBucket === null
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
            }`}
          >
            Any ({itemsWithCoverage.length})
          </Link>
          {facetCounts.map(({ bucket, count }) => {
            const active = coverageBucket?.key === bucket.key;
            const disabled = count === 0 && !active;
            return (
              <Link
                key={bucket.key}
                href={
                  disabled ? buildQuery({}) : buildQuery({ coverage: bucket.key })
                }
                prefetch={false}
                aria-disabled={disabled || undefined}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  active
                    ? "border-gray-900 bg-gray-900 text-white"
                    : disabled
                      ? "pointer-events-none border-gray-100 bg-gray-50 text-gray-300"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                {bucket.label} ({count})
              </Link>
            );
          })}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
          {coverageBucket
            ? `No measures match ${coverageBucket.label}${anyBound ? ` within range` : ""}.`
            : bothBounds
              ? `No measures have continuous data across ${normFrom}–${normTo}.`
              : anyBound
                ? `No measures have data within the selected range.`
                : "No numeric measures are currently tracked for this organization."}
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-600">
            Showing {items.length} measure{items.length === 1 ? "" : "s"}
            {bothBounds
              ? ` with data in every year of ${normFrom}–${normTo}`
              : normFrom !== null
                ? ` with data in ${normFrom} or later`
                : normTo !== null
                  ? ` with data in ${normTo} or earlier`
                  : ""}
            {coverageBucket ? ` · ${coverageBucket.label}` : ""}.
          </p>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map(({ measure, facts: mFacts, coverage }) => {
              const fact = anyBound
                ? latestActualInRange(
                    mFacts,
                    normFrom ?? Number.NEGATIVE_INFINITY,
                    normTo ?? Number.POSITIVE_INFINITY,
                  )
                : latestActual(mFacts);
              return (
                <li key={measure.id}>
                  <Link
                    href={`/dashboard/${jurisdiction}/${org}/${measure.slug}`}
                    className="block h-full rounded-md border border-gray-200 bg-white p-4 transition-colors hover:border-gray-400 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-medium text-gray-900">
                        {measure.canonical_name}
                      </div>
                      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-600">
                        {coverage}y
                      </span>
                    </div>
                    {measure.service_category && (
                      <div className="mt-1 text-[11px] uppercase tracking-wide text-gray-400">
                        {measure.service_category}
                      </div>
                    )}
                    <div className="mt-3 flex items-end justify-between gap-3">
                      <div className="flex flex-col">
                        {fact && fact.value_numeric !== null ? (
                          <>
                            <span className="text-lg font-semibold text-gray-900 leading-tight">
                              {formatValue(fact.value_numeric, measure.unit)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {fact.value_type} · {fact.measurement_year}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-500">
                            target/projection only
                          </span>
                        )}
                      </div>
                      <Sparkline facts={mFacts} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
