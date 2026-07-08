// Shared catalog of the economic indicator measures served by york_factory's
// /kpis/series endpoint — the /economic-indicators page renders every entry
// and the canvas page uses it as the feed picker.

export type Indicator = { slug: string; heading: string; blurb: string };
export type IndicatorSection = {
  id: string;
  title: string;
  description: string;
  indicators: Indicator[];
};

export const SECTIONS: IndicatorSection[] = [
  {
    id: "economy",
    title: "Overall Economy",
    description:
      "Is Canada's economy growing and producing enough to sustain rising living standards?",
    indicators: [
      {
        slug: "gdp-per-capita-ppp",
        heading: "GDP per capita (PPP)",
        blurb:
          "Output per person, adjusted for purchasing power. The clearest single measure of how living standards in Canada compare with peer economies.",
      },
      {
        slug: "gdp-growth-annual",
        heading: "GDP growth",
        blurb:
          "Annual growth in real gross domestic product. Sustained growth is what compounds into higher incomes over a generation.",
      },
      {
        slug: "trade-balance-pct-gdp",
        heading: "Trade balance",
        blurb:
          "External balance on goods and services as a share of GDP. Shows whether Canada sells more to the world than it buys.",
      },
      {
        slug: "labour-productivity-gdp-per-hour",
        heading: "Labour productivity",
        blurb:
          "GDP per hour worked. Productivity growth is the engine of rising wages — and where Canada has fallen furthest behind.",
      },
    ],
  },
  {
    id: "welfare",
    title: "Individual Economics & Welfare",
    description:
      "Does prosperity reach everyday Canadians — in wages, work, and the distribution of income?",
    indicators: [
      {
        slug: "employment-rate",
        heading: "Employment rate",
        blurb:
          "Share of the population aged 15 and over that is employed. The broadest gauge of whether people who could work, do.",
      },
      {
        slug: "real-minimum-wage-ppp",
        heading: "Real minimum wage",
        blurb:
          "Statutory hourly minimum wage at constant prices, in purchasing-power dollars. Italy has no statutory minimum wage, so no G7 average is shown.",
      },
      {
        slug: "average-annual-hours-worked",
        heading: "Hours worked",
        blurb:
          "Average annual hours actually worked per worker. Working more hours for the same income is not prosperity.",
      },
      {
        slug: "household-debt-to-income",
        heading: "Household debt",
        blurb:
          "Household debt as a share of net disposable income. Canadian households carry among the heaviest debt loads in the G7.",
      },
      {
        slug: "gini-index",
        heading: "Income inequality (Gini index)",
        blurb:
          "Gini index of income inequality on a 0–100 scale, where 0 is perfect equality. World Bank estimates, internationally comparable.",
      },
      {
        slug: "gini-after-tax-canada",
        heading: "Income inequality after tax (Canada)",
        blurb:
          "Statistics Canada's official Gini coefficient of adjusted after-tax income — a longer and more current Canada-only series.",
      },
      {
        slug: "bottom-quintile-income-share",
        heading: "Bottom-quintile income share",
        blurb:
          "Share of income that accrues to the poorest 20%. A direct check on whether growth reaches the bottom of the distribution.",
      },
      {
        slug: "age-dependency-ratio",
        heading: "Age dependency ratio",
        blurb:
          "Dependents (under 15 or over 64) per 100 working-age people. A rising ratio means fewer workers supporting more people.",
      },
      {
        slug: "low-income-entry-rate",
        heading: "Low income entry rate",
        blurb:
          "Share of Canadian tax filers not in low income who fell into it the following year. Measures how many people poverty pulls in.",
      },
      {
        slug: "low-income-exit-rate",
        heading: "Low income exit rate",
        blurb:
          "Share of Canadian tax filers in low income who escaped it the following year. Measures how quickly people get back out.",
      },
    ],
  },
  {
    id: "wellbeing",
    title: "Happiness & Wellbeing",
    description:
      "Are Canadians satisfied with their lives — and confident enough in the future to build one here?",
    indicators: [
      {
        slug: "life-satisfaction",
        heading: "Life satisfaction",
        blurb:
          "Average self-reported life evaluation on the 0–10 Cantril ladder — the score the World Happiness Report ranks countries by.",
      },
      {
        slug: "fertility-rate",
        heading: "Fertility rate",
        blurb:
          "Births per woman. A blunt but honest proxy for whether people feel confident enough in the future to start families.",
      },
    ],
  },
  {
    id: "safety",
    title: "Crime & Public Safety",
    description: "Is Canada getting safer or more dangerous?",
    indicators: [
      {
        slug: "crime-severity-index",
        heading: "Crime Severity Index",
        blurb:
          "Statistics Canada's headline crime measure, weighting offences by seriousness (2006 = 100).",
      },
      {
        slug: "police-reported-crime-rate",
        heading: "Police-reported crime rate",
        blurb:
          "Criminal Code incidents (excluding traffic) per 100,000 Canadians.",
      },
      {
        slug: "homicide-rate",
        heading: "Homicide rate",
        blurb:
          "Intentional homicides per 100,000 people — the crime statistic least affected by reporting differences across countries.",
      },
    ],
  },
  {
    id: "governance",
    title: "Governance & Transparency",
    description:
      "Is Canada's government clean, capable, and accountable by international standards?",
    indicators: [
      {
        slug: "corruption-perceptions-index",
        heading: "Corruption perceptions",
        blurb:
          "Transparency International's index from 0 (highly corrupt) to 100 (very clean). Comparable since 2012.",
      },
      {
        slug: "government-effectiveness",
        heading: "Government effectiveness",
        blurb:
          "World Governance Indicators estimate of public service quality and policy execution, from −2.5 (weak) to 2.5 (strong).",
      },
    ],
  },
  {
    id: "infrastructure",
    title: "Infrastructure & Industry",
    description:
      "Is Canada investing in the physical and technological capacity to compete?",
    indicators: [
      {
        slug: "rd-spending-pct-gdp",
        heading: "R&D spending",
        blurb:
          "Gross domestic expenditure on research and development as a share of GDP.",
      },
      {
        slug: "manufacturing-value-added-pct-gdp",
        heading: "Manufacturing value added",
        blurb: "Manufacturing's contribution to GDP.",
      },
      {
        slug: "fixed-broadband-subscriptions",
        heading: "Broadband penetration",
        blurb: "Fixed broadband subscriptions per 100 people.",
      },
      {
        slug: "rail-freight-tonne-km",
        heading: "Rail freight",
        blurb:
          "Goods moved by rail, in million ton-kilometres. A physical-economy pulse check.",
      },
    ],
  },
  {
    id: "international",
    title: "International Relations",
    description: "Does Canada pull its weight in the world?",
    indicators: [
      {
        slug: "oda-pct-gni",
        heading: "Development assistance",
        blurb:
          "Official development assistance as a share of gross national income, against the UN's 0.7% target.",
      },
    ],
  },
  {
    id: "environment",
    title: "Environment",
    description:
      "Is Canada cutting emissions and protecting land while the economy grows? Overlay CO₂ with GDP on the canvas to see decoupling.",
    indicators: [
      {
        slug: "co2-emissions-per-capita",
        heading: "CO₂ emissions per capita",
        blurb:
          "Production-based carbon emissions per person, in tonnes per year.",
      },
      {
        slug: "air-pollution-pm25",
        heading: "Air quality (PM2.5)",
        blurb:
          "Population-weighted exposure to fine particulate matter. The WHO guideline is 5 µg/m³.",
      },
      {
        slug: "protected-areas-pct",
        heading: "Protected areas",
        blurb: "Terrestrial protected areas as a share of total land.",
      },
      {
        slug: "forest-area-pct",
        heading: "Forest coverage",
        blurb: "Forested land as a share of total land area.",
      },
    ],
  },
  {
    id: "housing",
    title: "Housing",
    description:
      "Can Canadians afford a home — and is the country building enough of them?",
    indicators: [
      {
        slug: "house-price-to-income",
        heading: "House price to income",
        blurb:
          "House prices relative to disposable income per person, shown against each country's long-term average (100). The OECD's headline affordability indicator.",
      },
      {
        slug: "real-house-price-index",
        heading: "Real house prices",
        blurb:
          "House prices adjusted for inflation, indexed to 2015. Shows how far prices have outrun the general cost of living.",
      },
      {
        slug: "housing-starts-canada",
        heading: "Housing starts",
        blurb:
          "Dwelling units started per year across Canada, from CMHC's starts and completions survey. The supply side of the housing equation.",
      },
      {
        slug: "rental-vacancy-rate-canada",
        heading: "Rental vacancy rate",
        blurb:
          "Vacancy rate in purpose-built rental apartments across census metropolitan areas. A healthy rental market sits near 3%.",
      },
    ],
  },
];

export const ALL_INDICATORS: Indicator[] = SECTIONS.flatMap(
  (s) => s.indicators,
);

export const MEASURE_SLUGS = new Set(ALL_INDICATORS.map((i) => i.slug));

export function indicatorHeading(slug: string): string {
  return ALL_INDICATORS.find((i) => i.slug === slug)?.heading ?? slug;
}
