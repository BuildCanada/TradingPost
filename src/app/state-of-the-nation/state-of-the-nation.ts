// The State of the Nation indicators, in the design's layout with the
// dashboard's real chart order and contents:
//   Headline — GDP per capita
//   Economy — employment by age, business formation, employment, wages,
//             investment flows, capital formation
//   Government Sustainability — debt to GDP, private vs public employment
//   Cost of Living — CPI, house price to income, housing starts
//   Immigration — net emigration, immigration, TFWs, immigration by class
// Every chart derives its stat and series from york_factory at request time;
// a chart whose data is unavailable is skipped rather than shown stale.

import {
  humanizeSourceName,
  humanizeSourceUrl,
  type EconomySeriesPoint,
  type EconomySeriesResponse,
} from "@/lib/api/economy";
import type { ChartSpec, LineSpec } from "./StateChart";

export type Verdict = "lead" | "lag" | "mixed";

export type SotnView = {
  n: string;
  title: string;
  verdict: Verdict;
  stat: string;
  statSub: string;
  headline: string;
  body: string;
  source: string;
  // Public landing page for the source (humanizeSourceUrl maps raw API
  // endpoints to human pages); null when the API reports no URL.
  sourceUrl: string | null;
  spec: ChartSpec;
  // Renders full-width above its section's card grid.
  wide?: boolean;
};

type Getter = (slug: string) => EconomySeriesResponse | null;

// All series are fetched Canada-only; the comparisons this page draws are
// against Canada's own record.
export const SOTN_MEASURE_SLUGS = [
  "gdp-per-capita-canada",
  "employment-rate-25-to-54",
  "employment-rate-15-to-24",
  "employment-rate-55-to-64",
  "employment-rate-15-plus",
  "business-entrants",
  "employment-rate",
  "average-hourly-wage",
  "median-hourly-wage",
  "fdi-inflows",
  "fdi-outflows",
  "capital-formation-pct-gdp",
  "govt-gross-debt-to-gdp",
  "govt-net-debt-to-gdp",
  "employment-all-classes",
  "employment-private-sector",
  "employment-public-sector",
  "employment-self-employed",
  "cpi-all-items",
  "house-price-to-income",
  "housing-starts-canada",
  "emigrants-annual",
  "returning-emigrants-annual",
  "immigrants-annual",
  "npr-work-permit-holders",
  "npr-total",
  "pr-admissions-total",
  "pr-admissions-economic",
  "pr-admissions-family",
  "pr-admissions-refugee",
  "pr-admissions-other",
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function points(get: Getter, slug: string): EconomySeriesPoint[] | null {
  const series = get(slug)?.data.series.find(
    (s) => s.jurisdiction.slug === "ca",
  );
  return series && series.points.length > 1 ? series.points : null;
}

const last = (ps: EconomySeriesPoint[]) => ps[ps.length - 1];

// Converts nominal dollars to real dollars using the all-items CPI, expressed
// in the latest CPI year's dollars. Values are deflated by each point's
// calendar-year average CPI.
function cpiDeflator(
  get: Getter,
): { toReal: (value: number, year: number) => number; baseYear: number } | null {
  const cpi = points(get, "cpi-all-items");
  if (!cpi) return null;
  const sums = new Map<number, { sum: number; n: number }>();
  for (const p of cpi) {
    const year = Math.floor(p.year);
    const entry = sums.get(year) ?? { sum: 0, n: 0 };
    entry.sum += p.value;
    entry.n += 1;
    sums.set(year, entry);
  }
  const avg = new Map(
    [...sums].map(([year, { sum, n }]) => [year, sum / n]),
  );
  const baseYear = Math.max(...avg.keys());
  const base = avg.get(baseYear)!;
  return {
    baseYear,
    toReal: (value, year) => value * (base / (avg.get(Math.floor(year)) ?? base)),
  };
}

// Attribution name + public link for a chart, from its primary measure's
// source record.
function sourceLink(
  get: Getter,
  slug: string,
): { source: string; sourceUrl: string | null } {
  const source = get(slug)?.meta.source ?? null;
  return {
    source: source ? humanizeSourceName(source.name) : "",
    sourceUrl: source ? humanizeSourceUrl(source.name, source.url) : null,
  };
}

const int = (v: number) => Math.round(v).toLocaleString("en-CA");

function monthLabel(p: EconomySeriesPoint): string {
  if (!p.date) return String(p.year);
  const [y, m] = p.date.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

function quarterLabel(p: EconomySeriesPoint): string {
  if (!p.date) return String(p.year);
  const [y, m] = p.date.split("-");
  return `Q${Math.floor((Number(m) - 1) / 3) + 1} ${y}`;
}

// Each chart spans exactly the years it has data for, so short series fill
// their own panel and long ones show their whole history — the x axis is no
// longer shared across graphs.
function domainLabels(domain: [number, number]): [string, string, string] {
  const [a, b] = domain;
  return [
    String(Math.floor(a)),
    String(Math.round((a + b) / 2)),
    String(Math.floor(b)),
  ];
}

const xs = (ps: EconomySeriesPoint[]) => ps.map((p) => p.year);

// The [min, max] year span across every series a chart plots.
function domainOf(...xsList: number[][]): [number, number] {
  const all = xsList.flat();
  return [Math.min(...all), Math.max(...all)];
}

// Restrict several series to the time keys they all report, so every line in
// a combined chart has the same length.
function align(
  seriesList: EconomySeriesPoint[][],
): { base: EconomySeriesPoint[]; values: number[][] } | null {
  const key = (p: EconomySeriesPoint) => p.date ?? p.year;
  const maps = seriesList.map((ps) => new Map(ps.map((p) => [key(p), p.value])));
  const base = seriesList[0].filter((p) => maps.every((m) => m.has(key(p))));
  if (base.length < 2) return null;
  return { base, values: maps.map((m) => base.map((p) => m.get(key(p))!)) };
}

type SotnIndicator = {
  n: string;
  title: string;
  verdict: Verdict;
  headline: string;
  body: string;
  wide?: boolean;
  build: (
    get: Getter,
  ) =>
    | (Pick<SotnView, "stat" | "statSub" | "source" | "sourceUrl"> & {
        spec: ChartSpec;
      })
    | null;
};

// The x domain and its labels are derived from the series themselves, so each
// chart spans exactly the years it plots — no shared axis, no clipping.
const line = (
  spec: Omit<LineSpec, "kind" | "xDomain" | "xLabels">,
): LineSpec => {
  const xDomain = domainOf(...spec.series.map((s) => s.xs));
  return { kind: "line", xDomain, xLabels: domainLabels(xDomain), ...spec };
};

const INDICATORS: SotnIndicator[] = [
  {
    n: "01",
    title: "GDP per capita",
    verdict: "lag",
    wide: true,
    headline: "Living standards have gone sideways since 2022.",
    body: "Real output per person, in chained 2017 dollars — the clearest single measure of whether living standards are rising. StatCan's quarterly series runs within about two months of the present, and it shows a country producing no more per person than it did four years ago.",
    build: (get) => {
      const ps = points(get, "gdp-per-capita-canada");
      if (!ps) return null;
      const latest = last(ps);
      return {
        stat: `$${int(latest.value)}`,
        statSub: `Real GDP per capita, chained 2017 $ · ${quarterLabel(latest)}`,
        ...sourceLink(get, "gdp-per-capita-canada"),
        spec: line({
          unit: "Real GDP per capita",
          fmt: "money",
          legend: [{ label: "Canada", color: "au" }],
          series: [{ color: "au", xs: xs(ps), points: ps.map((p) => p.value) }],
        }),
      };
    },
  },
  {
    n: "02",
    title: "Employment by age",
    verdict: "mixed",
    headline: "Core-age employment is near record highs; the young trail behind.",
    body: "Share of each age group that is employed, monthly and seasonally adjusted. The 25–54 core-working-age line is the cleanest read — it strips out students and retirees.",
    build: (get) => {
      const core = points(get, "employment-rate-25-to-54");
      const youth = points(get, "employment-rate-15-to-24");
      const older = points(get, "employment-rate-55-to-64");
      const all = points(get, "employment-rate-15-plus");
      if (!core || !youth || !older || !all) return null;
      const aligned = align([core, youth, older, all]);
      if (!aligned) return null;
      const latest = last(core);
      return {
        stat: `${latest.value.toFixed(1)}%`,
        statSub: `Employment rate, 25–54 · ${monthLabel(latest)}`,
        ...sourceLink(get, "employment-rate-25-to-54"),
        spec: line({
          unit: "Employment rate by age group",
          fmt: "pct",
          legend: [
            { label: "25–54", color: "au" },
            { label: "15–24", color: "clay" },
            { label: "55–64", color: "stone" },
            { label: "15+", color: "ink", dash: true },
          ],
          series: [
            { color: "au", xs: xs(aligned.base), points: aligned.values[0] },
            { color: "clay", xs: xs(aligned.base), points: aligned.values[1] },
            { color: "stone", xs: xs(aligned.base), points: aligned.values[2] },
            { color: "ink", dash: true, xs: xs(aligned.base), points: aligned.values[3] },
          ],
        }),
      };
    },
  },
  {
    n: "03",
    title: "Business formation",
    verdict: "lag",
    headline: "New business creation has stalled.",
    body: "Businesses appearing for the first time, monthly and seasonally adjusted — true new-business formation, not seasonal reopenings. Experimental estimates (Statistics Canada).",
    build: (get) => {
      const entrants = points(get, "business-entrants");
      if (!entrants) return null;
      const latest = last(entrants);
      return {
        stat: int(latest.value),
        statSub: `New businesses, monthly · ${monthLabel(latest)}`,
        ...sourceLink(get, "business-entrants"),
        spec: line({
          unit: "New business formation, monthly",
          fmt: "count",
          legend: [{ label: "New businesses", color: "au" }],
          series: [{ color: "au", xs: xs(entrants), points: entrants.map((p) => p.value) }],
        }),
      };
    },
  },
  {
    n: "04",
    title: "Employment",
    verdict: "lag",
    headline: "The share of Canadians working has slipped for two straight years.",
    body: "Share of the population aged 15 and over that is employed. The broadest gauge of whether people who could work, do.",
    build: (get) => {
      const ps = points(get, "employment-rate");
      if (!ps) return null;
      const latest = last(ps);
      return {
        stat: `${latest.value.toFixed(1)}%`,
        statSub: `Employment rate, 15+ · ${Math.floor(latest.year)}`,
        ...sourceLink(get, "employment-rate"),
        spec: line({
          unit: "Employment rate, ages 15 and over",
          fmt: "pct",
          legend: [{ label: "Canada", color: "au" }],
          series: [{ color: "au", xs: xs(ps), points: ps.map((p) => p.value) }],
        }),
      };
    },
  },
  {
    n: "05",
    title: "Wage growth",
    verdict: "mixed",
    headline: "Average pay keeps pulling away from the median — gains tilt to the top.",
    body: "Hourly wages for all employees, adjusted for inflation with the all-items CPI and expressed in the latest year's dollars. StatCan's public API carries no 10th or 90th percentile series, so average vs median is the closest available dispersion signal: when the average pulls away from the median, gains are concentrating at the top.",
    build: (get) => {
      const avg = points(get, "average-hourly-wage");
      const med = points(get, "median-hourly-wage");
      if (!avg || !med) return null;
      const aligned = align([avg, med]);
      if (!aligned) return null;
      const deflator = cpiDeflator(get);
      const real = (values: number[]) =>
        deflator
          ? values.map((v, i) => deflator.toReal(v, aligned.base[i].year))
          : values;
      const [realAvg, realMed] = [real(aligned.values[0]), real(aligned.values[1])];
      const latest = last(aligned.base);
      return {
        stat: `$${realAvg[realAvg.length - 1].toFixed(2)}`,
        statSub: `Average hourly wage${deflator ? `, ${deflator.baseYear} dollars` : ""} · ${Math.floor(latest.year)}`,
        ...sourceLink(get, "average-hourly-wage"),
        spec: line({
          unit: deflator
            ? `Real hourly wages, average vs median (${deflator.baseYear} dollars)`
            : "Hourly wages, average vs median",
          fmt: "money",
          legend: [
            { label: "Average", color: "au" },
            { label: "Median", color: "ink", dash: true },
          ],
          series: [
            { color: "au", xs: xs(aligned.base), points: realAvg },
            { color: "ink", dash: true, xs: xs(aligned.base), points: realMed },
          ],
        }),
      };
    },
  },
  {
    n: "06",
    title: "Investment flows",
    verdict: "lag",
    headline: "Canadian capital would rather invest abroad than at home.",
    body: "Quarterly foreign-direct-investment flows into Canada and Canadian direct investment abroad, adjusted for inflation and smoothed as four-quarter averages (the raw quarters are far too jagged to read). Outflows are not a loss — they are Canadian firms investing elsewhere — but the persistent gap shows where capital would rather be.",
    build: (get) => {
      const inflows = points(get, "fdi-inflows");
      const outflows = points(get, "fdi-outflows");
      if (!inflows || !outflows) return null;
      const aligned = align([inflows, outflows]);
      if (!aligned) return null;
      const deflator = cpiDeflator(get);
      const real = (values: number[]) =>
        deflator
          ? values.map((v, i) => deflator.toReal(v, aligned.base[i].year))
          : values;
      const [realIn, realOut] = aligned.values.map(real);
      // Quarterly FDI is extremely noisy; a trailing four-quarter average
      // keeps the in-vs-out comparison legible.
      const WINDOW = 4;
      if (aligned.base.length <= WINDOW) return null;
      const smooth = (values: number[]) =>
        values
          .slice(WINDOW - 1)
          .map(
            (_, i) =>
              values.slice(i, i + WINDOW).reduce((a, b) => a + b, 0) / WINDOW,
          );
      const base = aligned.base.slice(WINDOW - 1);
      // Trailing-year net flow: what actually arrived minus what left over
      // the last four quarters.
      const net = realIn
        .slice(-WINDOW)
        .reduce((a, b) => a + b, 0) -
        realOut.slice(-WINDOW).reduce((a, b) => a + b, 0);
      const latest = last(base);
      return {
        stat: `${net < 0 ? "−" : "+"}$${int(Math.abs(net) / 1000)}B`,
        statSub: `Net direct investment, trailing year${deflator ? `, ${deflator.baseYear} dollars` : ""} · ${quarterLabel(latest)}`,
        ...sourceLink(get, "fdi-inflows"),
        spec: line({
          unit: deflator
            ? `Foreign direct investment, inflows vs outflows (${deflator.baseYear} dollars)`
            : "Foreign direct investment, inflows vs outflows",
          fmt: "count",
          legend: [
            { label: "Into Canada (4-qtr avg)", color: "au" },
            { label: "Abroad (4-qtr avg)", color: "ink", dash: true },
          ],
          series: [
            { color: "au", xs: xs(base), points: smooth(realIn) },
            { color: "ink", dash: true, xs: xs(base), points: smooth(realOut) },
          ],
        }),
      };
    },
  },
  {
    n: "07",
    title: "Capital formation",
    verdict: "mixed",
    headline: "Investment holds near 23 per cent of GDP — enough to maintain, not to catch up.",
    body: "Gross capital formation as a share of GDP — how much of the economy is devoted to building future capacity: machinery, technology, buildings, and infrastructure.",
    build: (get) => {
      const ps = points(get, "capital-formation-pct-gdp");
      if (!ps) return null;
      const latest = last(ps);
      return {
        stat: `${latest.value.toFixed(1)}%`,
        statSub: `Gross capital formation, % of GDP · ${Math.floor(latest.year)}`,
        ...sourceLink(get, "capital-formation-pct-gdp"),
        spec: line({
          unit: "Gross capital formation, share of GDP",
          fmt: "pct",
          legend: [{ label: "Canada", color: "au" }],
          series: [{ color: "au", xs: xs(ps), points: ps.map((p) => p.value) }],
        }),
      };
    },
  },
  {
    n: "08",
    title: "Debt to GDP",
    verdict: "lag",
    headline: "Government debt has climbed back toward its 1990s crisis peak.",
    body: "Count every level of government — federal, provincial, local, CPP and QPP — on a national-balance-sheet basis. Net debt subtracts financial assets, including the pension plans' holdings, which is why it sits far below the federal-budget figures in the news. The two lines measure different things; don't split the difference.",
    build: (get) => {
      const gross = points(get, "govt-gross-debt-to-gdp");
      const net = points(get, "govt-net-debt-to-gdp");
      if (!gross || !net) return null;
      const aligned = align([gross, net]);
      if (!aligned) return null;
      const latest = last(gross);
      return {
        stat: `${Math.round(latest.value)}%`,
        statSub: `General government gross debt to GDP · ${quarterLabel(latest)}`,
        ...sourceLink(get, "govt-gross-debt-to-gdp"),
        spec: line({
          unit: "General government debt, share of GDP",
          fmt: "pct",
          legend: [
            { label: "Gross debt", color: "au" },
            { label: "Net liabilities", color: "ink", dash: true },
          ],
          series: [
            { color: "au", xs: xs(aligned.base), points: aligned.values[0] },
            { color: "ink", dash: true, xs: xs(aligned.base), points: aligned.values[1] },
          ],
        }),
      };
    },
  },
  {
    n: "09",
    title: "Public vs private jobs",
    verdict: "lag",
    headline: "Public-sector hiring has outpaced the private economy since the pandemic.",
    body: "Each class of worker as a share of all employment, monthly and seasonally adjusted. Since early 2020 the public-sector headcount has grown roughly twice as fast as the private sector's — a mix shift the economy has to carry.",
    build: (get) => {
      const total = points(get, "employment-all-classes");
      const priv = points(get, "employment-private-sector");
      const pub = points(get, "employment-public-sector");
      const self = points(get, "employment-self-employed");
      if (!total || !priv || !pub || !self) return null;
      const aligned = align([total, pub, priv, self]);
      if (!aligned) return null;
      const [totalV, pubV, privV, selfV] = aligned.values;
      const share = (series: number[]) =>
        series.map((v, i) => (v / totalV[i]) * 100);
      const pubShare = share(pubV);
      const latest = last(aligned.base);
      return {
        stat: `${pubShare[pubShare.length - 1].toFixed(1)}%`,
        statSub: `Public share of employment · ${monthLabel(latest)}`,
        ...sourceLink(get, "employment-all-classes"),
        spec: line({
          unit: "Employment share by class of worker",
          fmt: "pct",
          legend: [
            { label: "Public sector", color: "au" },
            { label: "Private sector", color: "ink", dash: true },
            { label: "Self-employed", color: "stone" },
          ],
          series: [
            { color: "au", xs: xs(aligned.base), points: pubShare },
            { color: "ink", dash: true, xs: xs(aligned.base), points: share(privV) },
            { color: "stone", xs: xs(aligned.base), points: share(selfV) },
          ],
        }),
      };
    },
  },
  {
    n: "10",
    title: "Consumer prices",
    verdict: "lag",
    headline: "Prices broke from the 2% track in 2021 and never came back.",
    body: "The all-items Consumer Price Index, month by month (2002 = 100). The dashed line is where prices would sit had they grown at the Bank of Canada's 2% inflation target — the gap above it is permanent lost ground.",
    build: (get) => {
      const cpi = points(get, "cpi-all-items");
      if (!cpi) return null;
      const target = cpi.map((p) => 100 * Math.pow(1.02, p.year - 2002));
      const latest = last(cpi);
      return {
        stat: String(latest.value.toFixed(1)),
        statSub: `CPI, all items (2002 = 100) · ${monthLabel(latest)}`,
        ...sourceLink(get, "cpi-all-items"),
        spec: line({
          unit: "Consumer Price Index vs the 2% target path",
          fmt: "index",
          legend: [
            { label: "CPI", color: "au" },
            { label: "2% target path", color: "ink", dash: true },
          ],
          series: [
            { color: "au", xs: xs(cpi), points: cpi.map((p) => p.value) },
            { color: "ink", dash: true, xs: xs(cpi), points: target },
          ],
        }),
      };
    },
  },
  {
    n: "11",
    title: "Housing affordability",
    verdict: "lag",
    headline: "House prices sit half again above their long-term relationship with incomes.",
    body: "The OECD's headline affordability measure compares home prices with the incomes that must carry them. Canada's ratio now runs roughly fifty per cent above its long-term average — among the most stretched in the developed world, pricing a whole generation out of ownership.",
    build: (get) => {
      const ps = points(get, "house-price-to-income");
      if (!ps) return null;
      const latest = last(ps);
      return {
        stat: `${(latest.value / 100).toFixed(1)}×`,
        statSub: `House price to income vs. long-term norm · ${Math.floor(latest.year)}`,
        ...sourceLink(get, "house-price-to-income"),
        spec: line({
          unit: "House-price-to-income ratio (100 = long-term norm)",
          fmt: "index",
          legend: [{ label: "Canada", color: "au" }],
          series: [{ color: "au", xs: xs(ps), points: ps.map((p) => p.value) }],
        }),
      };
    },
  },
  {
    n: "12",
    title: "Housing starts",
    verdict: "lead",
    headline: "Homebuilding is running at rates last sustained in the 1970s.",
    body: "Dwelling units started per year across Canada, from CMHC's starts and completions survey. The supply side of the housing equation — rising at last, and still short of what population growth demands.",
    build: (get) => {
      const ps = points(get, "housing-starts-canada");
      if (!ps) return null;
      const latest = last(ps);
      return {
        stat: int(latest.value),
        statSub: `Dwelling units started · ${Math.floor(latest.year)}`,
        ...sourceLink(get, "housing-starts-canada"),
        spec: line({
          unit: "Annual housing starts",
          fmt: "count",
          legend: [{ label: "Housing starts", color: "au" }],
          series: [{ color: "au", xs: xs(ps), points: ps.map((p) => p.value) }],
        }),
      };
    },
  },
  {
    n: "13",
    title: "Net emigration",
    verdict: "mixed",
    headline: "The counterflow is growing: more people leave than come back.",
    body: "Emigrants minus returning emigrants, on StatCan's July–June demographic years (the 2024 point covers July 2023 to June 2024). StatCan stopped publishing its own net series after a 2016 methodology change, so this line is derived from the components.",
    build: (get) => {
      const emigrants = points(get, "emigrants-annual");
      const returning = points(get, "returning-emigrants-annual");
      if (!emigrants || !returning) return null;
      const aligned = align([emigrants, returning]);
      if (!aligned) return null;
      const net = aligned.values[0].map((v, i) => v - aligned.values[1][i]);
      const latest = last(aligned.base);
      return {
        stat: int(net[net.length - 1]),
        statSub: `Net emigration · ${Math.floor(latest.year)} (July–June year)`,
        ...sourceLink(get, "emigrants-annual"),
        spec: line({
          unit: "Emigrants, net of returning Canadians",
          fmt: "count",
          legend: [{ label: "Net emigration", color: "au" }],
          series: [{ color: "au", xs: xs(aligned.base), points: net }],
        }),
      };
    },
  },
  {
    n: "14",
    title: "Permanent residents",
    verdict: "lead",
    headline: "Still one of the world's great immigration destinations — intake is easing off record highs.",
    body: "Immigrants admitted per year, on StatCan's July–June demographic years. Handled well, this is an engine of growth; handled poorly, it strains the housing and services shown elsewhere on this page.",
    build: (get) => {
      const ps = points(get, "immigrants-annual");
      if (!ps) return null;
      const latest = last(ps);
      return {
        stat: int(latest.value),
        statSub: `Immigrants admitted · ${Math.floor(latest.year)} (July–June year)`,
        ...sourceLink(get, "immigrants-annual"),
        spec: line({
          unit: "Permanent residents admitted per year",
          fmt: "count",
          legend: [{ label: "Immigrants", color: "au" }],
          series: [{ color: "au", xs: xs(ps), points: ps.map((p) => p.value) }],
        }),
      };
    },
  },
  {
    n: "15",
    title: "Temporary foreign workers",
    verdict: "mixed",
    headline: "After more than doubling in three years, the work-permit population is unwinding.",
    body: "People holding a work permit on the first day of each quarter — a stock, not a flow, and the closest public measure of \"temporary foreign workers\" (no StatCan series exists under that name). The dashed line is all non-permanent residents. The series only begins in mid-2021.",
    build: (get) => {
      const permits = points(get, "npr-work-permit-holders");
      const total = points(get, "npr-total");
      if (!permits || !total) return null;
      const aligned = align([permits, total]);
      if (!aligned) return null;
      const latest = last(aligned.base);
      return {
        stat: `${(last(permits).value / 1_000_000).toFixed(2)}M`,
        statSub: `Work-permit holders · ${quarterLabel(latest)}`,
        ...sourceLink(get, "npr-work-permit-holders"),
        spec: line({
          unit: "Work-permit holders vs all non-permanent residents",
          fmt: "count",
          legend: [
            { label: "Work permits", color: "au" },
            { label: "All non-permanent residents", color: "ink", dash: true },
          ],
          series: [
            { color: "au", xs: xs(aligned.base), points: aligned.values[0] },
            { color: "ink", dash: true, xs: xs(aligned.base), points: aligned.values[1] },
          ],
        }),
      };
    },
  },
  {
    n: "16",
    title: "By class",
    verdict: "mixed",
    headline: "A shrinking intake, still anchored by the economic class.",
    body: "Permanent residents admitted each month, by immigration class, from IRCC's monthly updates. IRCC rounds counts to the nearest 5 and suppresses small cells, so values are approximate and won't exactly match StatCan's July–June figures above. Students are not a PR class — they appear under work and study permits.",
    build: (get) => {
      const total = points(get, "pr-admissions-total");
      const economic = points(get, "pr-admissions-economic");
      const family = points(get, "pr-admissions-family");
      const refugee = points(get, "pr-admissions-refugee");
      const other = points(get, "pr-admissions-other");
      if (!total || !economic || !family || !refugee || !other) return null;
      const aligned = align([total, economic, family, refugee, other]);
      if (!aligned) return null;
      const latest = last(aligned.base);
      return {
        stat: int(last(total).value),
        statSub: `Permanent residents admitted, monthly · ${monthLabel(latest)}`,
        ...sourceLink(get, "pr-admissions-total"),
        spec: line({
          unit: "Permanent-resident admissions by class",
          fmt: "count",
          legend: [
            { label: "Economic", color: "au" },
            { label: "Total", color: "ink", dash: true },
            { label: "Family", color: "clay" },
            { label: "Refugee", color: "stone" },
            { label: "Other", color: "sand" },
          ],
          series: [
            { color: "au", xs: xs(aligned.base), points: aligned.values[1] },
            { color: "ink", dash: true, xs: xs(aligned.base), points: aligned.values[0] },
            { color: "clay", xs: xs(aligned.base), points: aligned.values[2] },
            { color: "stone", xs: xs(aligned.base), points: aligned.values[3] },
            { color: "sand", xs: xs(aligned.base), points: aligned.values[4] },
          ],
        }),
      };
    },
  },
];

export const SOTN_INDICATOR_COUNT = INDICATORS.length;

// Section grouping for the page: charts keep their continuous 01–16
// numbering; each section renders its own header and card grid.
const SECTION_DEFS = [
  {
    id: "economy",
    title: "Economy",
    ns: ["01", "02", "03", "04", "05", "06", "07"],
  },
  {
    id: "government-sustainability",
    title: "Government Sustainability",
    ns: ["08", "09"],
  },
  { id: "cost-of-living", title: "Cost of Living", ns: ["10", "11", "12"] },
  { id: "immigration", title: "Immigration", ns: ["13", "14", "15", "16"] },
];

export type SotnSection = {
  id: string;
  title: string;
  indicators: SotnView[];
};

export function buildSections(get: Getter): SotnSection[] {
  const views = buildIndicators(get);
  return SECTION_DEFS.map((def) => ({
    id: def.id,
    title: def.title,
    indicators: views.filter((view) => def.ns.includes(view.n)),
  })).filter((section) => section.indicators.length > 0);
}

export function buildIndicators(get: Getter): SotnView[] {
  return INDICATORS.flatMap((indicator) => {
    const built = indicator.build(get);
    if (!built) return [];
    return [
      {
        n: indicator.n,
        title: indicator.title,
        verdict: indicator.verdict,
        headline: indicator.headline,
        body: indicator.body,
        wide: indicator.wide,
        ...built,
      },
    ];
  });
}
