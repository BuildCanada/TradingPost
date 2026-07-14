// Layout of the single-page prosperity dashboard (modelled on
// lookingforgrowth.uk's State of the Nation): a headline chart followed by
// themed sections rendered as anchored blocks on one page. Measures must
// exist in york_factory's /kpis/series endpoint; charts the API can't serve
// yet are listed under `planned` so the section still shows its intent.
// The per-section subpages keep using the older catalog in indicators.ts.

import type { IndicatorBenchmark } from "./indicators";

export type DashboardIndicator = {
  slug: string;
  heading: string;
  blurb: string;
  benchmark?: IndicatorBenchmark;
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
        slug: "gdp-per-capita-ppp",
        heading: "GDP per capita",
        blurb:
          "Output per person, adjusted for purchasing power. The clearest single measure of how living standards in Canada compare with peer economies.",
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
    ],
    planned: [
      {
        heading: "Employment by age group",
        needs:
          "Employment rate broken down by age cohort (StatCan Labour Force Survey, table 14-10-0327)",
      },
      {
        heading: "New business formation",
        needs:
          "Business openings/entry rate (StatCan experimental business openings, table 33-10-0270)",
      },
      {
        heading: "Wage growth — 10th, 90th percentile, and average",
        needs:
          "Hourly wage distribution percentiles (StatCan Labour Force Survey, table 14-10-0063 or 14-10-0417)",
      },
      {
        heading: "Investment inflows / outflows",
        needs:
          "Foreign direct investment flows in and out of Canada (StatCan table 36-10-0025 or OECD FDI statistics)",
      },
      {
        heading: "Capital formation",
        needs:
          "Gross fixed capital formation, ideally as a share of GDP (StatCan table 36-10-0104 or World Bank NE.GDI.FTOT.ZS)",
      },
    ],
  },
  {
    id: "government-sustainability",
    title: "Government Sustainability",
    description:
      "Can Canadian governments keep their books balanced without crowding out the private economy?",
    indicators: [],
    planned: [
      {
        heading: "Debt to GDP ratio (all levels of government)",
        needs:
          "Consolidated general government net/gross debt as a share of GDP (StatCan table 10-10-0147 or IMF GFS)",
      },
      {
        heading: "Private vs public employment share",
        needs:
          "Employment split by public sector, private sector, and self-employment (StatCan Labour Force Survey, table 14-10-0288)",
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
          "House prices relative to disposable income per person, shown against each country's long-term average (100). The OECD's headline affordability indicator.",
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
    indicators: [],
    planned: [
      {
        heading: "Immigration",
        needs:
          "Permanent-resident admissions over time (IRCC admissions data or StatCan table 17-10-0008)",
      },
      {
        heading: "Net emigration",
        needs:
          "Emigrants and returning emigrants from StatCan's components of population change (table 17-10-0008)",
      },
      {
        heading: "Temporary foreign workers",
        needs:
          "TFW program work-permit holders over time (IRCC temporary residents data or StatCan table 17-10-0121)",
      },
      {
        heading: "Immigration by class",
        needs:
          "Admissions split by economic, family, refugee, and student classes (IRCC admissions by category)",
      },
    ],
  },
];

export const DASHBOARD_INDICATORS: DashboardIndicator[] =
  DASHBOARD_SECTIONS.flatMap((s) => s.indicators);
