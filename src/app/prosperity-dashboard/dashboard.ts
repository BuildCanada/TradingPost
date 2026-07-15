// Layout of the single-page prosperity dashboard (modelled on
// lookingforgrowth.uk's State of the Nation): a headline chart followed by
// themed sections rendered as anchored blocks on one page. Measures must
// exist in york_factory's /kpis/series endpoint; charts the API can't serve
// yet are listed under `planned` so the section still shows its intent.
// The per-section subpages keep using the older catalog in indicators.ts.

import type { IndicatorBenchmark } from "./indicators";

export type DashboardSeries = { slug: string; label: string };

export type DashboardIndicator = {
  // For single-measure charts this is the measure slug; for multi-series
  // charts it is only the chart's #anchor id.
  slug: string;
  heading: string;
  blurb: string;
  benchmark?: IndicatorBenchmark;
  // Overlay several measures as lines on one chart. All series must share
  // the same unit and frequency; the first renders emphasized in brand red.
  series?: DashboardSeries[];
};

export type PlannedIndicator = {
  heading: string;
  // The series the backend needs to ingest before this chart can ship.
  needs: string;
};

export type DashboardSection = {
  id: string;
  title: string;
  description?: string;
  // Full-width hero treatment for every chart in the section.
  hero?: boolean;
  indicators: DashboardIndicator[];
  planned?: PlannedIndicator[];
};

export const DASHBOARD_SECTIONS: DashboardSection[] = [
  {
    id: "headline",
    title: "Headline",
    hero: true,
    indicators: [
      {
        slug: "gdp-per-capita-canada",
        heading: "GDP per capita",
        blurb:
          "Real output per person, in chained 2017 dollars — the clearest single measure of whether living standards are rising. StatCan's quarterly series runs within about two months of the present, where the World Bank's international comparison lags by a year or more.",
      },
    ],
  },
  {
    id: "economy",
    title: "Economy",
    description:
      "Is Canada's economy growing, hiring, and investing enough to sustain rising living standards?",
    indicators: [
      {
        slug: "employment-rate",
        heading: "Employment",
        blurb:
          "Share of the population aged 15 and over that is employed. The broadest gauge of whether people who could work, do.",
      },
      {
        slug: "employment-by-age",
        heading: "Employment by age group",
        blurb:
          "Share of each age group that is employed, monthly and seasonally adjusted. The 25–54 core-working-age line is the cleanest read — it strips out students and retirees.",
        series: [
          { slug: "employment-rate-25-to-54", label: "25–54" },
          { slug: "employment-rate-15-to-24", label: "15–24" },
          { slug: "employment-rate-55-to-64", label: "55–64" },
          { slug: "employment-rate-15-plus", label: "15+" },
        ],
      },
      {
        slug: "business-formation",
        heading: "New business formation",
        blurb:
          "Businesses appearing for the first time versus permanently ceasing operations, monthly and seasonally adjusted — true births and deaths, not seasonal reopenings. Experimental estimates (Statistics Canada); exits are confirmed ~6 months behind entrants.",
        series: [
          { slug: "business-entrants", label: "Entrants" },
          { slug: "business-exits", label: "Exits" },
        ],
      },
      {
        slug: "wages",
        heading: "Average and median hourly wage",
        blurb:
          "Hourly wages for all employees, in current dollars (not adjusted for inflation). When the average pulls away from the median, gains are concentrating at the top — StatCan's public API carries no wage percentiles, so this gap is the closest available dispersion signal.",
        series: [
          { slug: "average-hourly-wage", label: "Average" },
          { slug: "median-hourly-wage", label: "Median" },
        ],
      },
      {
        slug: "fdi-flows",
        heading: "Investment inflows and outflows",
        blurb:
          "Quarterly foreign-direct-investment flows into Canada and Canadian direct investment abroad. Outflows are not a loss — they are Canadian firms investing elsewhere — but the gap shows where capital would rather be. Flows can turn negative when investment is withdrawn.",
        series: [
          { slug: "fdi-inflows", label: "Into Canada" },
          { slug: "fdi-outflows", label: "Canadian investment abroad" },
        ],
      },
      {
        slug: "capital-formation-pct-gdp",
        heading: "Capital formation",
        blurb:
          "Gross capital formation as a share of GDP — how much of the economy is devoted to building future capacity.",
      },
      {
        slug: "capital-investment",
        heading: "Capital investment (levels)",
        blurb:
          "Gross fixed capital formation in chained 2017 dollars at seasonally adjusted annual rates — the machinery, buildings, and infrastructure Canada adds each quarter, total and business-sector.",
        series: [
          { slug: "gross-fixed-capital-formation", label: "Total" },
          {
            slug: "business-gross-fixed-capital-formation",
            label: "Business sector",
          },
        ],
      },
    ],
  },
  {
    id: "government-sustainability",
    title: "Government Sustainability",
    description:
      "Can Canadian governments keep their books balanced without crowding out the private economy?",
    indicators: [
      {
        slug: "govt-debt-to-gdp",
        heading: "Debt to GDP (all levels of government)",
        blurb:
          "Consolidated general government — federal, provincial, local, and CPP/QPP — on a national-balance-sheet basis. Net debt subtracts financial assets, including the pension plans' holdings, which is why it sits far below the federal-budget figures in the news. The two lines measure different things; don't split the difference.",
        series: [
          { slug: "govt-gross-debt-to-gdp", label: "Gross debt" },
          { slug: "govt-net-debt-to-gdp", label: "Net liabilities" },
        ],
      },
      {
        slug: "employment-by-class",
        heading: "Private vs public employment",
        blurb:
          "Employed Canadians by class of worker, monthly and seasonally adjusted. The three lines sum to total employment — watch the mix: a rising public line means government hiring is outpacing the market economy.",
        series: [
          { slug: "employment-private-sector", label: "Private sector" },
          { slug: "employment-public-sector", label: "Public sector" },
          { slug: "employment-self-employed", label: "Self-employed" },
        ],
      },
    ],
  },
  {
    id: "cost-of-living",
    title: "Cost of Living",
    description:
      "What Canadians pay for the essentials — and whether a home is still within reach.",
    indicators: [
      {
        slug: "cpi-all-items",
        heading: "CPI",
        blurb:
          "The all-items Consumer Price Index, month by month (2002 = 100). The grey line is where prices would sit had they grown at the Bank of Canada's 2% inflation target.",
        // Bank of Canada inflation-control target (2% midpoint), compounded
        // through the CPI's 2002 = 100 index base.
        benchmark: {
          label: "2% target",
          annualRatePct: 2,
          anchorYear: 2002,
          anchorValue: 100,
        },
      },
      {
        slug: "house-price-to-income",
        heading: "Housing price to income ratio",
        blurb:
          "House prices relative to disposable income per person, shown against Canada's long-term average (100). The OECD's headline affordability indicator.",
      },
      {
        slug: "housing-starts-canada",
        heading: "Housing starts",
        blurb:
          "Dwelling units started per year across Canada, from CMHC's starts and completions survey. The supply side of the housing equation.",
      },
    ],
  },
  {
    id: "immigration",
    title: "Immigration",
    description:
      "How many people are coming, who they are, and how many are leaving.",
    indicators: [
      {
        slug: "population-growth-components",
        heading: "Components of population growth",
        blurb:
          "Annual movements of people in and out of Canada, on StatCan's July–June demographic years (the 2024 point covers July 2023 to June 2024). Net emigration is the gap between the emigrant and returning-emigrant lines; the net non-permanent-resident line swings negative when more temporary visas expire than are issued.",
        series: [
          { slug: "immigrants-annual", label: "Immigrants" },
          {
            slug: "net-non-permanent-residents-annual",
            label: "Net non-permanent residents",
          },
          { slug: "emigrants-annual", label: "Emigrants" },
          { slug: "returning-emigrants-annual", label: "Returning emigrants" },
        ],
      },
      {
        slug: "temporary-residents",
        heading: "Temporary residents by type",
        blurb:
          "How many people hold temporary status in Canada on the first day of each quarter — stocks, not flows. Work-permit holders are the closest public measure of \"temporary foreign workers\"; no StatCan series exists under that name. The series only begins in mid-2021.",
        series: [
          { slug: "npr-total", label: "All non-permanent residents" },
          { slug: "npr-work-permit-holders", label: "Work permits" },
          { slug: "npr-study-permit-holders", label: "Study permits" },
          { slug: "npr-asylum-claimants", label: "Asylum claimants" },
          { slug: "npr-work-and-study-permit-holders", label: "Work + study" },
        ],
      },
      {
        slug: "pr-admissions-by-class",
        heading: "Immigration by class",
        blurb:
          "Permanent residents admitted each month, by immigration class, from IRCC's monthly updates. IRCC rounds counts to the nearest 5 and suppresses small cells, so values are approximate and won't exactly match StatCan's July–June figures above. Students are not a PR class — they appear under study permits.",
        series: [
          { slug: "pr-admissions-total", label: "Total" },
          { slug: "pr-admissions-economic", label: "Economic" },
          { slug: "pr-admissions-family", label: "Family" },
          { slug: "pr-admissions-refugee", label: "Refugee" },
          { slug: "pr-admissions-other", label: "Other" },
        ],
      },
    ],
  },
];

export const DASHBOARD_INDICATORS: DashboardIndicator[] =
  DASHBOARD_SECTIONS.flatMap((s) => s.indicators);

// Every measure the dashboard fetches — one per single chart, several per
// multi-series chart.
export const DASHBOARD_MEASURE_SLUGS: string[] = Array.from(
  new Set(
    DASHBOARD_INDICATORS.flatMap(
      (indicator) => indicator.series?.map((s) => s.slug) ?? [indicator.slug],
    ),
  ),
);
