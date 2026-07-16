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
  // "employment-rate" (annual 15+) removed with the "Employment" chart below —
  // redundant with "Employment by age", which carries the 15+ line monthly.
  // "employment-rate",
  "average-hourly-wage",
  "median-hourly-wage",
  "fdi-position-in-canada",
  "cdi-position-abroad",
  "capital-formation-pct-gdp",
  // Gross debt is deliberately not fetched or charted — it ignores the
  // financial assets governments hold and overstates the burden. The debt
  // chart shows net financial debt only (govt-net-debt-to-gdp).
  "govt-net-debt-to-gdp",
  "employment-all-classes",
  "employment-private-sector",
  "employment-public-sector",
  "employment-self-employed",
  "cpi-all-items",
  "house-price-to-income",
  "housing-starts-canada",
  "population-canada",
  "emigrants-annual",
  "returning-emigrants-annual",
  "pr-admissions-annual-historical",
  // Temporarily disabled: the NPR-by-type series only start 2021 Q3, which was
  // dragging the shared chart window forward to 2021. Commented out with the
  // "Temporary foreign workers" indicator below so the window can reach back
  // to 2015 (the next-shortest series: business formation and PR admissions).
  // "npr-work-permit-holders",
  // "npr-total",
  "pr-admissions-total",
  "pr-admissions-economic",
  "pr-admissions-family",
  "pr-admissions-refugee",
  "pr-admissions-other",
  "pr-admissions-economic-historical",
  "pr-admissions-family-historical",
  "pr-admissions-refugee-historical",
  "pr-admissions-other-historical",
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// The x window charts render in — a fixed 2000 start through the latest point
// any series reports. Set at the top of buildIndicators.
let sharedDomain: [number, number] = [2000, 2001];

// Real GDP per capita is the one exception: it starts earlier to show its
// deeper history (data begins 1981).
const GDP_START = 1980;

// Trims a series to a window start (default: the shared 2000 start; GDP passes
// GDP_START). Series with longer histories are cut back to it; series that
// begin later are left untouched and simply render partway into the window.
function clip(
  ps: EconomySeriesPoint[] | null,
  start = sharedDomain[0],
): EconomySeriesPoint[] | null {
  if (!ps) return null;
  const kept = ps.filter((p) => p.year >= start - 1e-6);
  return kept.length > 1 ? kept : null;
}

function points(
  get: Getter,
  slug: string,
  start = sharedDomain[0],
): EconomySeriesPoint[] | null {
  const series = get(slug)?.data.series.find(
    (s) => s.jurisdiction.slug === "ca",
  );
  return clip(series && series.points.length > 1 ? series.points : null, start);
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

// Charts render in the shared x window (see buildIndicators) so the timelines
// line up. A chart may pass an earlier `start` to reach further back — only
// Real GDP per capita does, to show its deeper history.
const line = (
  spec: Omit<LineSpec, "kind" | "xDomain" | "xLabels">,
  start = sharedDomain[0],
): LineSpec => {
  const domain: [number, number] = [start, sharedDomain[1]];
  return {
    kind: "line",
    xDomain: domain,
    xLabels: domainLabels(domain),
    ...spec,
  };
};

// Splices an IRCC permanent-resident series into one annual line: archived
// annual values for years before the cutover, then the ongoing monthly series
// summed to complete calendar years from the cutover on. Complete years only —
// a partial current year would read as a false collapse. Both slugs are
// clipped to the shared window start by points().
function spliceIrccAdmissions(
  get: Getter,
  historicalSlug: string,
  monthlySlug: string,
  cutover = 2015,
): { year: number; value: number }[] {
  const historical = points(get, historicalSlug);
  const monthly = points(get, monthlySlug);
  const byYear = new Map<number, { sum: number; n: number }>();
  for (const p of monthly ?? []) {
    const y = Math.floor(p.year);
    const e = byYear.get(y) ?? { sum: 0, n: 0 };
    e.sum += p.value;
    e.n += 1;
    byYear.set(y, e);
  }
  const out: { year: number; value: number }[] = [];
  for (const p of historical ?? []) {
    if (Math.floor(p.year) < cutover) out.push({ year: p.year, value: p.value });
  }
  for (const [y, e] of [...byYear].sort((a, b) => a[0] - b[0])) {
    if (y >= cutover && e.n === 12) out.push({ year: y, value: e.sum });
  }
  out.sort((a, b) => a.year - b.year);
  return out;
}

const INDICATORS: SotnIndicator[] = [
  {
    n: "01",
    title: "GDP per capita",
    verdict: "lag",
    wide: true,
    headline: "Living standards have gone sideways since 2022.",
    body: "Real output per person, in chained 2017 dollars — the clearest single measure of whether living standards are rising. StatCan's quarterly series runs within about two months of the present, and it shows a country producing no more per person than it did four years ago.",
    build: (get) => {
      // GDP per capita is the one chart that reaches back past the shared 2000
      // start (data begins 1981).
      const ps = points(get, "gdp-per-capita-canada", GDP_START);
      if (!ps) return null;
      const latest = last(ps);
      // Index to the first point (= 100) so the chart reads as cumulative
      // growth in living standards rather than an abstract dollar level: the
      // long climb and the post-2022 plateau both show at a glance. The
      // headline stat keeps the concrete dollar figure.
      const baseYear = Math.floor(ps[0].year);
      const indexed = ps.map((p) => (p.value / ps[0].value) * 100);
      return {
        stat: `$${int(latest.value)}`,
        statSub: `Real GDP per capita, chained 2017 $ · ${quarterLabel(latest)}`,
        ...sourceLink(get, "gdp-per-capita-canada"),
        spec: line({
          unit: `Real GDP per capita (index, ${baseYear} = 100)`,
          fmt: "index",
          // Indexed series: frame around 100 with a floating baseline there,
          // rather than anchoring the axis at zero.
          baseline: 100,
          legend: [{ label: "Canada", color: "au" }],
          series: [{ color: "au", xs: xs(ps), points: indexed }],
        }, GDP_START),
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
  /* Removed — redundant with "Employment by age" (02), which already carries
     the 15-and-over line monthly. Kept commented for easy restore.
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
  */
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
    title: "Investment position",
    verdict: "lag",
    headline: "Canada now holds far more investment abroad than the world holds here.",
    body: "The accumulated book value of direct investment — how much foreign capital is parked in Canada versus how much Canadian capital is parked abroad (StatCan table 36-10-0008, annual since 1987). In the late 1980s more foreign investment sat in Canada than Canadian investment sat abroad; the two crossed around 2000 and the gap has widened steadily since. Book value, not inflation-adjusted.",
    build: (get) => {
      const inCanada = points(get, "fdi-position-in-canada");
      const abroad = points(get, "cdi-position-abroad");
      if (!inCanada || !abroad) return null;
      const aligned = align([inCanada, abroad]);
      if (!aligned) return null;
      // Plot in $ billions; the raw series are in $ millions.
      const inB = aligned.values[0].map((v) => v / 1000);
      const outB = aligned.values[1].map((v) => v / 1000);
      // Net international direct-investment position: what sits in Canada minus
      // what Canadians hold abroad. Negative = Canada is a net outward owner.
      const net = inB[inB.length - 1] - outB[outB.length - 1];
      const latest = last(aligned.base);
      return {
        stat: `${net < 0 ? "−" : "+"}$${int(Math.abs(net))}B`,
        statSub: `Net direct investment position · ${Math.floor(latest.year)}`,
        ...sourceLink(get, "fdi-position-in-canada"),
        spec: line({
          unit: "Direct investment position: in Canada vs abroad ($B)",
          fmt: "count",
          legend: [
            { label: "Foreign-owned in Canada", color: "au" },
            { label: "Canadian-owned abroad", color: "ink", dash: true },
          ],
          series: [
            { color: "au", xs: xs(aligned.base), points: inB },
            { color: "ink", dash: true, xs: xs(aligned.base), points: outB },
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
    title: "Net financial debt",
    verdict: "lead",
    headline: "Net financial debt sits near its lowest since 1990, far below the mid-1990s peak.",
    body: "Every level of government — federal, provincial, local, CPP and QPP — on a national-balance-sheet basis. This is net financial debt: total liabilities minus financial assets (the pension plans' holdings included). It excludes tangible capital assets like roads and buildings, and it is the honest measure of the public sector's financial position. Gross debt ignores the assets held against those liabilities and overstates the burden; a net-worth measure would wrongly net out non-financial assets. This is neither — just liabilities net of financial assets.",
    build: (get) => {
      const net = points(get, "govt-net-debt-to-gdp");
      if (!net) return null;
      const latest = last(net);
      return {
        stat: `${Math.round(latest.value)}%`,
        statSub: `General government net financial debt to GDP · ${quarterLabel(latest)}`,
        ...sourceLink(get, "govt-net-debt-to-gdp"),
        spec: line({
          unit: "Government net financial debt, share of GDP",
          fmt: "pct",
          legend: [{ label: "Net financial debt", color: "au" }],
          series: [{ color: "au", xs: xs(net), points: net.map((p) => p.value) }],
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
    verdict: "lag",
    headline: "Per person, Canada builds barely half as many homes as it did in the 1970s.",
    body: "Dwelling units started each year per 1,000 people, from CMHC's starts and completions survey against StatCan's population estimates. In absolute terms starts are back near their 1970s highs — but the population has more than doubled since then, so on a per-person basis homebuilding runs at roughly half the mid-1970s rate. This is the honest read on whether supply is keeping up with the people who need homes.",
    build: (get) => {
      const ps = points(get, "housing-starts-canada");
      const pop = points(get, "population-canada");
      if (!ps || !pop) return null;
      // Population is quarterly; collapse it to a calendar-year average so it
      // divides the annual starts flow cleanly. Then express starts per 1,000
      // people — the only way to compare a period over which the population
      // more than doubled.
      const popByYear = new Map<number, { sum: number; n: number }>();
      for (const p of pop) {
        const y = Math.floor(p.year);
        const e = popByYear.get(y) ?? { sum: 0, n: 0 };
        e.sum += p.value;
        e.n += 1;
        popByYear.set(y, e);
      }
      const perCapita = ps.flatMap((p) => {
        const e = popByYear.get(Math.floor(p.year));
        return e ? [{ year: p.year, value: (p.value / (e.sum / e.n)) * 1000 }] : [];
      });
      if (perCapita.length < 2) return null;
      const latest = perCapita[perCapita.length - 1];
      return {
        stat: latest.value.toFixed(1),
        statSub: `Dwelling units started per 1,000 people · ${Math.floor(latest.year)}`,
        ...sourceLink(get, "housing-starts-canada"),
        spec: line({
          unit: "Housing starts per 1,000 people",
          fmt: "num",
          legend: [{ label: "Starts per 1,000", color: "au" }],
          series: [
            {
              color: "au",
              xs: perCapita.map((p) => p.year),
              points: perCapita.map((p) => p.value),
            },
          ],
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
    body: "Permanent residents admitted per calendar year. Two IRCC sources are spliced into one continuous line: the archived by-category series (1980–2015) for the historical years, and IRCC's ongoing monthly admissions (summed to calendar years) from 2015 on. Handled well, this is an engine of growth; handled poorly, it strains the housing and services shown elsewhere on this page.",
    build: (get) => {
      const series = spliceIrccAdmissions(
        get,
        "pr-admissions-annual-historical",
        "pr-admissions-total",
      );
      if (series.length < 2) return null;
      const latest = series[series.length - 1];
      return {
        stat: int(latest.value),
        statSub: `Permanent residents admitted · ${Math.floor(latest.year)}`,
        ...sourceLink(get, "pr-admissions-total"),
        spec: line({
          unit: "Permanent residents admitted per year",
          fmt: "count",
          legend: [{ label: "PR admissions", color: "au" }],
          series: [
            {
              color: "au",
              xs: series.map((p) => p.year),
              points: series.map((p) => p.value),
            },
          ],
        }),
      };
    },
  },
  /* Temporarily disabled — the NPR-by-type series only start 2021 Q3, which
     forced the shared chart window forward to 2021. Re-enable together with
     the "npr-work-permit-holders" / "npr-total" slugs above; note that doing
     so pulls every chart's window back to 2021.
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
  */
  {
    n: "16",
    title: "By class",
    verdict: "mixed",
    headline: "A shrinking intake, still anchored by the economic class.",
    body: "Permanent residents admitted per year by immigration class. Two IRCC sources are spliced per class: the archived by-category series through 2014, then the ongoing monthly admissions (summed to calendar years) from 2015 on. IRCC rounds counts and suppresses small cells, so values are approximate; the archived 'Other' bucket is narrower than today's, so that line's pre-2015 level isn't directly comparable. Students are not a PR class — they appear under work and study permits.",
    build: (get) => {
      const economic = spliceIrccAdmissions(get, "pr-admissions-economic-historical", "pr-admissions-economic");
      const family = spliceIrccAdmissions(get, "pr-admissions-family-historical", "pr-admissions-family");
      const refugee = spliceIrccAdmissions(get, "pr-admissions-refugee-historical", "pr-admissions-refugee");
      const other = spliceIrccAdmissions(get, "pr-admissions-other-historical", "pr-admissions-other");
      const total = spliceIrccAdmissions(get, "pr-admissions-annual-historical", "pr-admissions-total");
      if (economic.length < 2 || total.length < 2) return null;
      const latest = total[total.length - 1];
      const pts = (s: { year: number; value: number }[]) => ({
        xs: s.map((p) => p.year),
        points: s.map((p) => p.value),
      });
      return {
        stat: int(latest.value),
        statSub: `Permanent residents admitted, by class · ${Math.floor(latest.year)}`,
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
            { color: "au", ...pts(economic) },
            { color: "ink", dash: true, ...pts(total) },
            { color: "clay", ...pts(family) },
            { color: "stone", ...pts(refugee) },
            { color: "sand", ...pts(other) },
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
  // Standardize charts on one x window: a fixed start of 2000 through the
  // latest point any series reports. Series that don't reach back to 2000
  // begin partway in. Real GDP per capita is the exception — it passes
  // GDP_START to show its deeper history.
  let maxEnd = -Infinity;
  for (const slug of SOTN_MEASURE_SLUGS) {
    const series = get(slug)?.data.series.find(
      (s) => s.jurisdiction.slug === "ca",
    );
    if (!series || series.points.length < 2) continue;
    maxEnd = Math.max(maxEnd, series.points[series.points.length - 1].year);
  }
  sharedDomain = [2000, Number.isFinite(maxEnd) ? maxEnd : 2001];

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
