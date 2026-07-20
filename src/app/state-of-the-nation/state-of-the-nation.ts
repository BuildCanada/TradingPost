// The State of the Nation indicators, in the design's layout with the
// dashboard's real chart order and contents:
//   Headline — GDP per capita
//   Economy — unemployment by age, business creation, wages, inflation
//   Government Sustainability — debt to GDP, private vs public employment
//   Housing — house price to income, housing starts
//   Immigration — Canadians leaving, admissions to Canada
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
  // Every table the chart's numbers come from (e.g. a per-1,000 chart credits
  // both its own series and the population divisor). `url` is the public
  // landing page for the source (humanizeSourceUrl maps raw API endpoints to
  // human pages); null when the API reports no URL.
  sources: { name: string; url: string | null }[];
  spec: ChartSpec;
  // Renders full-width above its section's card grid.
  wide?: boolean;
};

type Getter = (slug: string) => EconomySeriesResponse | null;

// All series are fetched Canada-only; the comparisons this page draws are
// against Canada's own record.
export const SOTN_MEASURE_SLUGS = [
  "gdp-per-capita-canada",
  // Unemployment by age — a more meaningful labour-market read than the
  // employment rate. Employment-rate-by-age slugs are no longer charted.
  "unemployment-rate-25-to-54",
  "unemployment-rate-15-to-24",
  "unemployment-rate-55-to-64",
  // Business entries chart: LEAP annual firm entrants, national total,
  // 2001–2023 (StatCan 33-10-0087). A single consistent long-run series —
  // preferred over the churny quarterly 33-10-0165 and the shorter monthly
  // 33-10-0270 entrants, which are no longer charted here.
  "business-entrants-annual",
  // "employment-rate" (annual 15+) removed with the "Employment" chart below —
  // redundant with "Employment by age", which carries the 15+ line monthly.
  // "employment-rate",
  "average-hourly-wage",
  "median-hourly-wage",
  // Investment position (fdi/cdi) and capital formation moved to V2 — their
  // charts add noise to the core story, so the series are no longer fetched.
  // "fdi-position-in-canada",
  // "cdi-position-abroad",
  // "capital-formation-pct-gdp",
  // Gross debt is deliberately not fetched or charted — it ignores the
  // financial assets governments hold and overstates the burden. The debt
  // chart shows net debt excluding the CPP/QPP pension holdings, whose ~$1T
  // in assets are earmarked for future pensions rather than available to pay
  // down debt — netting them out (as StatCan's headline 38-10-0237 net figure
  // does) understates the burden. Computed upstream from table 10-10-0015.
  "govt-net-debt-excl-pension-to-gdp",
  "employment-all-classes",
  "employment-private-sector",
  "employment-public-sector",
  "employment-self-employed",
  "cpi-all-items",
  // Housing affordability is charted as the mortgage debt service ratio (an
  // actual % of disposable income) rather than the OECD's indexed price-to-
  // income measure — a non-indexed, quarterly carrying-cost read.
  "mortgage-debt-service-ratio",
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
  // Per-class PR series powered the "by class" chart, now killed — no longer fetched.
  // "pr-admissions-economic",
  // "pr-admissions-family",
  // "pr-admissions-refugee",
  // "pr-admissions-other",
  // "pr-admissions-economic-historical",
  // "pr-admissions-family-historical",
  // "pr-admissions-refugee-historical",
  // "pr-admissions-other-historical",
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// The x window charts render in — a fixed 1980 start through the latest point
// any series reports. Set at the top of buildIndicators.
let sharedDomain: [number, number] = [1980, 1981];

// Trims a series to a window start (default: the shared 1980 start). Series
// with longer histories are cut back to it; series that begin later are left
// untouched and simply render partway into the window. The optional `start`
// lets a chart reach back further if ever needed.
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

// Attribution names + public links for a chart, one per measure whose numbers
// feed it (deduped — measures from the same table credit it once). Pass every
// slug the chart draws on, including divisors like population.
function sourceLinks(
  get: Getter,
  ...slugs: string[]
): { sources: { name: string; url: string | null }[] } {
  const sources: { name: string; url: string | null }[] = [];
  for (const slug of slugs) {
    const source = get(slug)?.meta.source;
    if (!source) continue;
    const name = humanizeSourceName(source.name);
    if (sources.some((s) => s.name === name)) continue;
    sources.push({ name, url: humanizeSourceUrl(source.name, source.url) });
  }
  return { sources };
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
    | (Pick<SotnView, "stat" | "statSub" | "sources"> & {
        spec: ChartSpec;
      })
    | null;
};

// Charts render in the shared x window (see buildIndicators) so the timelines
// line up. A chart may pass an earlier `start` to reach further back, though
// none currently does — every chart uses the shared 1980 start.
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
      const ps = points(get, "gdp-per-capita-canada");
      if (!ps) return null;
      const latest = last(ps);
      return {
        stat: `$${int(latest.value)}`,
        statSub: `Real GDP per capita, chained 2017 $ · ${quarterLabel(latest)}`,
        ...sourceLinks(get, "gdp-per-capita-canada"),
        spec: line({
          unit: `Gross Domestic Product (GDP) per capita, chained 2017 dollars`,
          fmt: "money",
          // Real dollar levels, not an index. Frame around the base-year level
          // with a floating baseline rather than anchoring the axis at zero, so
          // the long climb and the post-2022 plateau both read at a glance.
          baseline: ps[0].value,
          legend: [{ label: `Canada`, color: "au" }],
          series: [{ color: "au", xs: xs(ps), points: ps.map((p) => p.value) }],
        }),
      };
    },
  },
  {
    n: "02",
    title: "Unemployment by age",
    verdict: "mixed",
    headline: "Core-age unemployment stays low, but the young are locked out.",
    body: "Share of each age group's labour force that is unemployed, monthly and seasonally adjusted. The 25–54 core-working-age line is the cleanest read — it strips out students and retirees. Youth unemployment runs far higher and moves first when the labour market turns.",
    build: (get) => {
      const core = points(get, "unemployment-rate-25-to-54");
      const youth = points(get, "unemployment-rate-15-to-24");
      const older = points(get, "unemployment-rate-55-to-64");
      if (!core || !youth || !older) return null;
      const aligned = align([core, youth, older]);
      if (!aligned) return null;
      const latest = last(core);
      return {
        stat: `${latest.value.toFixed(1)}%`,
        statSub: `Unemployment rate, 25–54 · ${monthLabel(latest)}`,
        ...sourceLinks(get, "unemployment-rate-25-to-54"),
        spec: line({
          unit: "Unemployment rate by age group",
          fmt: "pct",
          legend: [
            { label: "25–54", color: "au" },
            { label: "15–24", color: "clay" },
            { label: "55–64", color: "stone" },
          ],
          series: [
            { color: "au", xs: xs(aligned.base), points: aligned.values[0] },
            { color: "clay", xs: xs(aligned.base), points: aligned.values[1] },
            { color: "stone", xs: xs(aligned.base), points: aligned.values[2] },
          ],
        }),
      };
    },
  },
  {
    n: "03",
    title: "New Business Creation",
    verdict: "lag",
    headline: "Per person, Canadians are starting fewer businesses than two decades ago.",
    body: "New employer businesses entering the private sector each year — firms hiring their first paid employee (true formation, not seasonal reopenings) — expressed per 1,000 people so it holds up as the population grows. Annual firm counts from Statistics Canada's Longitudinal Employment Analysis Program (LEAP), summed to a national total across the provinces and territories, divided by StatCan's population estimates. Source table 33-10-0087, 2001–2023.",
    build: (get) => {
      const series = points(get, "business-entrants-annual");
      const pop = points(get, "population-canada");
      if (!series || series.length < 2 || !pop) return null;
      // Population is quarterly; collapse to a calendar-year average so it
      // divides the annual entrant flow cleanly. Then express per 1,000 people.
      const popByYear = new Map<number, { sum: number; n: number }>();
      for (const p of pop) {
        const y = Math.floor(p.year);
        const e = popByYear.get(y) ?? { sum: 0, n: 0 };
        e.sum += p.value;
        e.n += 1;
        popByYear.set(y, e);
      }
      const perCapita = series.flatMap((p) => {
        const e = popByYear.get(Math.floor(p.year));
        return e ? [{ year: p.year, value: (p.value / (e.sum / e.n)) * 1000 }] : [];
      });
      if (perCapita.length < 2) return null;
      const latest = perCapita[perCapita.length - 1];
      return {
        stat: latest.value.toFixed(1),
        statSub: `New businesses started per 1,000 people · ${Math.floor(latest.year)}`,
        ...sourceLinks(get, "business-entrants-annual", "population-canada"),
        spec: line({
          unit: "New businesses started per 1,000 people",
          fmt: "num",
          legend: [{ label: "Entrants per 1,000", color: "au" }],
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
        ...sourceLinks(get, "employment-rate"),
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
        ...sourceLinks(get, "average-hourly-wage"),
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
  /* Moved to V2 — investment position and capital formation add noise to the
     core story. Kept commented for easy restore.
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
        ...sourceLinks(get, "fdi-position-in-canada"),
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
        ...sourceLinks(get, "capital-formation-pct-gdp"),
        spec: line({
          unit: "Gross capital formation, share of GDP",
          fmt: "pct",
          legend: [{ label: "Canada", color: "au" }],
          series: [{ color: "au", xs: xs(ps), points: ps.map((p) => p.value) }],
        }),
      };
    },
  },
  */
  {
    n: "08",
    title: "Net debt",
    verdict: "lead",
    headline: "Net debt is roughly half its mid-1990s peak — but has been climbing back since 2023.",
    body: "Every level of government — federal, provincial, and local — on a national-balance-sheet basis: total liabilities minus the financial assets held against them, but excluding the Canada and Quebec Pension Plans. The CPP and QPP hold close to $1 trillion, yet that money is set aside for future pensions, not available to pay down government debt — netting it out, as the headline national-accounts figure does, flatters the picture. Excluded, net debt reached above 100 per cent of GDP in the mid-1990s fiscal crisis, fell to its low in 2023, and has edged up since.",
    build: (get) => {
      const net = points(get, "govt-net-debt-excl-pension-to-gdp");
      if (!net) return null;
      const latest = last(net);
      return {
        stat: `${Math.round(latest.value)}%`,
        statSub: `General government net debt, excl. CPP/QPP, to GDP · ${quarterLabel(latest)}`,
        ...sourceLinks(get, "govt-net-debt-excl-pension-to-gdp"),
        spec: line({
          unit: "Government net debt (excl. CPP/QPP), share of GDP",
          fmt: "pct",
          legend: [{ label: "Net debt (excl. pensions)", color: "au" }],
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
        ...sourceLinks(get, "employment-all-classes"),
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
    title: "Inflation",
    verdict: "lag",
    headline: "Inflation broke above target in 2021–22 and is only now easing back toward 2%.",
    body: "The 12-month change in the all-items Consumer Price Index — the headline inflation rate, month by month. The dashed line is the Bank of Canada's 2% target. After four decades of gradual disinflation from the double-digit early 1980s, inflation spiked above 8% in 2022 before easing back toward target.",
    build: (get) => {
      // Raw (unclipped) monthly CPI so the year-over-year rate is defined right
      // at the 1980 window start — computing 1980's rate needs 1979's index.
      const raw = get("cpi-all-items")?.data.series.find(
        (s) => s.jurisdiction.slug === "ca",
      )?.points;
      if (!raw || raw.length < 13) return null;
      const byMonth = new Map(
        raw.filter((p) => p.date).map((p) => [p.date!, p.value]),
      );
      // 12-month percentage change for each month with a value a year earlier,
      // kept from the shared window start on.
      const rate = raw.flatMap((p) => {
        if (!p.date) return [];
        const prior = byMonth.get(
          `${Number(p.date.slice(0, 4)) - 1}${p.date.slice(4)}`,
        );
        if (prior === undefined || p.year < sharedDomain[0]) return [];
        return [{ year: p.year, value: (p.value / prior - 1) * 100 }];
      });
      if (rate.length < 2) return null;
      const rateXs = rate.map((p) => p.year);
      return {
        stat: `${rate[rate.length - 1].value.toFixed(1)}%`,
        statSub: `CPI inflation, 12-month change · ${monthLabel(raw[raw.length - 1])}`,
        ...sourceLinks(get, "cpi-all-items"),
        spec: line({
          unit: "Inflation (CPI) vs 2% target",
          fmt: "pct1",
          legend: [
            { label: "Inflation (12-month)", color: "au" },
            { label: "2% target", color: "ink", dash: true },
          ],
          series: [
            { color: "au", xs: rateXs, points: rate.map((p) => p.value) },
            { color: "ink", dash: true, xs: rateXs, points: rate.map(() => 2) },
          ],
        }),
      };
    },
  },
  {
    n: "11",
    title: "Housing Affordability",
    verdict: "lag",
    headline: "Mortgage payments now claim a near-record share of household income.",
    body: "The mortgage debt service ratio — obligated principal and interest payments as a share of household disposable income, seasonally adjusted. It measures the real carrying-cost burden of housing, not just prices. After holding near six per cent through the 2000s, it climbed to a record 8.2 per cent in 2023 as interest rates rose, and remains close to that high.",
    build: (get) => {
      const ps = points(get, "mortgage-debt-service-ratio");
      if (!ps) return null;
      const latest = last(ps);
      return {
        stat: `${latest.value.toFixed(1)}%`,
        statSub: `Mortgage payments as a share of disposable income · ${quarterLabel(latest)}`,
        ...sourceLinks(get, "mortgage-debt-service-ratio"),
        spec: line({
          unit: "Mortgage debt service ratio, % of disposable income",
          fmt: "pct",
          legend: [{ label: "Mortgage debt service ratio", color: "au" }],
          series: [{ color: "au", xs: xs(ps), points: ps.map((p) => p.value) }],
        }),
      };
    },
  },
  {
    n: "12",
    title: "Housing Starts",
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
        ...sourceLinks(get, "housing-starts-canada", "population-canada"),
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
    title: "Canadians Leaving Canada",
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
        ...sourceLinks(get, "emigrants-annual"),
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
    title: "Admissions to Canada",
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
        ...sourceLinks(get, "pr-admissions-total"),
        spec: line({
          unit: "Permanent residents admitted to Canada per year",
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
        ...sourceLinks(get, "npr-work-permit-holders"),
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
  /* Killed — the "by class" breakdown adds noise. Kept commented for easy restore.
  {
    n: "16",
    title: "Immigration by type",
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
        ...sourceLinks(get, "pr-admissions-total"),
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
  */
];

export const SOTN_INDICATOR_COUNT = INDICATORS.length;

// Section grouping for the page: charts keep their continuous 01–16
// numbering; each section renders its own header and card grid.
const SECTION_DEFS = [
  {
    id: "economy",
    title: "Economy",
    // Inflation (10) lives here now for balance; investment position (06) and
    // capital formation (07) moved to V2.
    ns: ["01", "02", "03", "05", "10"],
  },
  {
    id: "government-sustainability",
    title: "Government Sustainability",
    ns: ["08", "09"],
  },
  { id: "housing", title: "Housing", ns: ["11", "12"] },
  { id: "immigration", title: "Immigration", ns: ["13", "14"] },
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
  // Standardize charts on one x window: a fixed start of 1980 through the
  // latest point any series reports. Series that don't reach back to 1980
  // begin partway in, leaving their early years blank.
  let maxEnd = -Infinity;
  for (const slug of SOTN_MEASURE_SLUGS) {
    const series = get(slug)?.data.series.find(
      (s) => s.jurisdiction.slug === "ca",
    );
    if (!series || series.points.length < 2) continue;
    maxEnd = Math.max(maxEnd, series.points[series.points.length - 1].year);
  }
  sharedDomain = [1980, Number.isFinite(maxEnd) ? maxEnd : 1981];

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
