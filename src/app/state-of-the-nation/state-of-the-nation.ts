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

import type { EconomySeriesPoint, EconomySeriesResponse } from "@/lib/api/economy";
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
  "business-exits",
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

// First / middle / last tick labels: month-year for short dated series,
// plain years otherwise.
function xLabels(ps: EconomySeriesPoint[]): [string, string, string] {
  const span = last(ps).year - ps[0].year;
  const label = (p: EconomySeriesPoint) =>
    p.date && span < 8 ? monthLabel(p) : String(Math.floor(p.year));
  return [label(ps[0]), label(ps[Math.floor((ps.length - 1) / 2)]), label(last(ps))];
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
  build: (get: Getter) => (Pick<SotnView, "stat" | "statSub" | "source"> & { spec: ChartSpec }) | null;
};

const line = (
  spec: Omit<LineSpec, "kind">,
): LineSpec => ({ kind: "line", ...spec });

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
        source: "Statistics Canada (table 36-10-0706)",
        spec: line({
          unit: "Economic output per person",
          fmt: "money",
          xLabels: xLabels(ps),
          legend: [{ label: "Canada", color: "au" }],
          series: [{ color: "au", points: ps.map((p) => p.value) }],
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
        source: "Statistics Canada (table 14-10-0287)",
        spec: line({
          unit: "Who's working, by age group",
          fmt: "pct",
          xLabels: xLabels(aligned.base),
          legend: [
            { label: "25–54", color: "au" },
            { label: "15–24", color: "clay" },
            { label: "55–64", color: "stone" },
            { label: "15+", color: "ink", dash: true },
          ],
          series: [
            { color: "au", points: aligned.values[0] },
            { color: "clay", points: aligned.values[1] },
            { color: "stone", points: aligned.values[2] },
            { color: "ink", dash: true, points: aligned.values[3] },
          ],
        }),
      };
    },
  },
  {
    n: "03",
    title: "Business formation",
    verdict: "lag",
    headline: "More businesses now close for good than start.",
    body: "Businesses appearing for the first time versus permanently ceasing operations, monthly and seasonally adjusted — true births and deaths, not seasonal reopenings. Experimental estimates (Statistics Canada); an exit is only confirmed once a business stays closed, so the exits line ends about six months before the entrants line.",
    build: (get) => {
      const entrants = points(get, "business-entrants");
      const exits = points(get, "business-exits");
      if (!entrants || !exits) return null;
      // Exits lag entrants ~6 months: chart both full-length (the exits line
      // simply stops early), and compute net formation only for the months
      // where both exist.
      const exitByKey = new Map(exits.map((p) => [p.date ?? p.year, p.value]));
      const overlap = entrants.filter((p) => exitByKey.has(p.date ?? p.year));
      if (overlap.length === 0) return null;
      const lastCommon = last(overlap);
      const net = lastCommon.value - exitByKey.get(lastCommon.date ?? lastCommon.year)!;
      return {
        stat: `${net < 0 ? "−" : "+"}${int(Math.abs(net))}`,
        statSub: `Net business formation (entrants − exits) · ${monthLabel(lastCommon)}`,
        source: "Statistics Canada (table 33-10-0270)",
        spec: line({
          unit: "Businesses starting vs closing for good",
          fmt: "count",
          xLabels: xLabels(entrants),
          legend: [
            { label: "Entrants", color: "au" },
            { label: "Exits", color: "ink", dash: true },
          ],
          series: [
            { color: "au", points: entrants.map((p) => p.value) },
            { color: "ink", dash: true, points: exits.map((p) => p.value) },
          ],
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
        source: "World Bank, World Development Indicators",
        spec: line({
          unit: "The share of Canadians who work",
          fmt: "pct",
          xLabels: xLabels(ps),
          legend: [{ label: "Canada", color: "au" }],
          series: [{ color: "au", points: ps.map((p) => p.value) }],
        }),
      };
    },
  },
  {
    n: "05",
    title: "Wage growth",
    verdict: "mixed",
    headline: "Average pay keeps pulling away from the median — gains tilt to the top.",
    body: "Hourly wages for all employees, in current dollars (not adjusted for inflation). StatCan's public API carries no 10th or 90th percentile series, so average vs median is the closest available dispersion signal: when the average pulls away from the median, gains are concentrating at the top.",
    build: (get) => {
      const avg = points(get, "average-hourly-wage");
      const med = points(get, "median-hourly-wage");
      if (!avg || !med) return null;
      const aligned = align([avg, med]);
      if (!aligned) return null;
      const latest = last(aligned.base);
      return {
        stat: `$${last(avg).value.toFixed(2)}`,
        statSub: `Average hourly wage · ${Math.floor(latest.year)}`,
        source: "Statistics Canada (table 14-10-0064)",
        spec: line({
          unit: "What Canadians earn per hour",
          fmt: "money",
          xLabels: xLabels(aligned.base),
          legend: [
            { label: "Average", color: "au" },
            { label: "Median", color: "ink", dash: true },
          ],
          series: [
            { color: "au", points: aligned.values[0] },
            { color: "ink", dash: true, points: aligned.values[1] },
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
    body: "Quarterly foreign-direct-investment flows into Canada and Canadian direct investment abroad. Outflows are not a loss — they are Canadian firms investing elsewhere — but the persistent gap shows where capital would rather be. Flows can turn negative when investment is withdrawn.",
    build: (get) => {
      const inflows = points(get, "fdi-inflows");
      const outflows = points(get, "fdi-outflows");
      if (!inflows || !outflows) return null;
      const aligned = align([inflows, outflows]);
      if (!aligned) return null;
      const net =
        aligned.values[0][aligned.values[0].length - 1] -
        aligned.values[1][aligned.values[1].length - 1];
      const latest = last(aligned.base);
      return {
        stat: `${net < 0 ? "−" : "+"}$${int(Math.abs(net) / 1000)}B`,
        statSub: `Net direct investment flow · ${quarterLabel(latest)}`,
        source: "Statistics Canada (table 36-10-0025)",
        spec: line({
          unit: "Investment coming into Canada vs leaving it",
          fmt: "count",
          xLabels: xLabels(aligned.base),
          legend: [
            { label: "Into Canada", color: "au" },
            { label: "Canadian investment abroad", color: "ink", dash: true },
          ],
          series: [
            { color: "au", points: aligned.values[0] },
            { color: "ink", dash: true, points: aligned.values[1] },
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
        source: "World Bank, World Development Indicators",
        spec: line({
          unit: "How much of the economy goes to building",
          fmt: "pct",
          xLabels: xLabels(ps),
          legend: [{ label: "Canada", color: "au" }],
          series: [{ color: "au", points: ps.map((p) => p.value) }],
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
        source: "Statistics Canada (table 38-10-0237)",
        spec: line({
          unit: "What every level of government owes",
          fmt: "pct",
          xLabels: xLabels(aligned.base),
          legend: [
            { label: "Gross debt", color: "au" },
            { label: "Net liabilities", color: "ink", dash: true },
          ],
          series: [
            { color: "au", points: aligned.values[0] },
            { color: "ink", dash: true, points: aligned.values[1] },
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
        source: "Statistics Canada (table 14-10-0288)",
        spec: line({
          unit: "Where Canadians work: public vs private",
          fmt: "pct",
          xLabels: xLabels(aligned.base),
          legend: [
            { label: "Public sector", color: "au" },
            { label: "Private sector", color: "ink", dash: true },
            { label: "Self-employed", color: "stone" },
          ],
          series: [
            { color: "au", points: pubShare },
            { color: "ink", dash: true, points: share(privV) },
            { color: "stone", points: share(selfV) },
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
        source: "Statistics Canada (table 18-10-0004)",
        spec: line({
          unit: "Consumer prices vs the 2% target",
          fmt: "index",
          xLabels: xLabels(cpi),
          legend: [
            { label: "CPI", color: "au" },
            { label: "2% target path", color: "ink", dash: true },
          ],
          series: [
            { color: "au", points: cpi.map((p) => p.value) },
            { color: "ink", dash: true, points: target },
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
        source: "OECD Analytical House Prices Database",
        spec: line({
          unit: "Home prices vs incomes (100 = the long-term norm)",
          fmt: "index",
          xLabels: xLabels(ps),
          legend: [{ label: "Canada", color: "au" }],
          series: [{ color: "au", points: ps.map((p) => p.value) }],
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
        source: "CMHC via Statistics Canada (table 34-10-0126)",
        spec: line({
          unit: "Homes started each year",
          fmt: "count",
          xLabels: xLabels(ps),
          legend: [{ label: "Housing starts", color: "au" }],
          series: [{ color: "au", points: ps.map((p) => p.value) }],
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
        source: "Statistics Canada (table 17-10-0008)",
        spec: line({
          unit: "People leaving Canada for good",
          fmt: "count",
          xLabels: xLabels(aligned.base),
          legend: [{ label: "Net emigration", color: "au" }],
          series: [{ color: "au", points: net }],
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
        source: "Statistics Canada (table 17-10-0008)",
        spec: line({
          unit: "New permanent residents each year",
          fmt: "count",
          xLabels: xLabels(ps),
          legend: [{ label: "Immigrants", color: "au" }],
          series: [{ color: "au", points: ps.map((p) => p.value) }],
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
        source: "Statistics Canada (table 17-10-0121)",
        spec: line({
          unit: "People in Canada on temporary permits",
          fmt: "count",
          xLabels: xLabels(aligned.base),
          legend: [
            { label: "Work permits", color: "au" },
            { label: "All non-permanent residents", color: "ink", dash: true },
          ],
          series: [
            { color: "au", points: aligned.values[0] },
            { color: "ink", dash: true, points: aligned.values[1] },
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
        source: "Immigration, Refugees and Citizenship Canada",
        spec: line({
          unit: "Permanent residents by immigration class",
          fmt: "count",
          xLabels: xLabels(aligned.base),
          legend: [
            { label: "Economic", color: "au" },
            { label: "Total", color: "ink", dash: true },
            { label: "Family", color: "clay" },
            { label: "Refugee", color: "stone" },
            { label: "Other", color: "sand" },
          ],
          series: [
            { color: "au", points: aligned.values[1] },
            { color: "ink", dash: true, points: aligned.values[0] },
            { color: "clay", points: aligned.values[2] },
            { color: "stone", points: aligned.values[3] },
            { color: "sand", points: aligned.values[4] },
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
