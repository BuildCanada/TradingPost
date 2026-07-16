import { apiFetch } from "./client";

export interface EconomySeriesUnit {
  id: number;
  symbol: string;
  kind: "absolute" | "rate" | "ratio" | string;
  base_unit: string;
  scale: number | null;
  currency_code: string | null;
  denominator_unit: string | null;
  denominator_scale: number | null;
}

export interface EconomySeriesMeasure {
  slug: string;
  name: string;
  description: string | null;
  category: string;
  frequency: string;
  higher_is_bad: boolean;
  unit: EconomySeriesUnit;
}

export interface EconomySeriesJurisdiction {
  slug: string;
  code: string;
  name: string;
  level: string;
}

// The API serves annual points as { year, value }; monthly and quarterly
// points (per measure.frequency) both come as { date, value }, where a
// quarterly date is the first day of the quarter. getEconomicSeries
// normalizes all shapes to a numeric `year` time axis — fractional for dated
// points (year + monthIndex / 12) — so charts keep a single numeric x
// dimension, with the ISO date preserved for date formatting.
export interface EconomySeriesPoint {
  year: number;
  date?: string;
  value: number;
}

interface RawSeriesPoint {
  year?: number;
  date?: string;
  value: number;
}

export interface EconomySeries {
  jurisdiction: EconomySeriesJurisdiction;
  computed: boolean;
  points: EconomySeriesPoint[];
}

export interface EconomySeriesSource {
  name: string;
  url: string | null;
  last_fetched_at: string | null;
}

export interface EconomySeriesResponse {
  data: {
    measure: EconomySeriesMeasure;
    series: EconomySeries[];
  };
  meta: {
    source: EconomySeriesSource | null;
    year_range: [number, number] | [];
  };
}

// The API reports source names as internal pipeline identifiers
// (e.g. "econ_worldbank_gdp_growth"); map them to public attributions.
const SOURCE_NAMES: Record<string, string> = {
  econ_oecd_labour_productivity: "OECD Productivity Database",
  econ_oecd_real_minimum_wage: "OECD Earnings Database",
  econ_oecd_hours_worked: "OECD Employment Database",
  econ_oecd_household_debt: "OECD National Accounts at a Glance",
  econ_oecd_house_price_to_income: "OECD Analytical House Prices Database",
  econ_oecd_real_house_prices: "OECD Analytical House Prices Database",
  econ_statcan_gini_after_tax: "Statistics Canada (table 11-10-0134)",
  econ_statcan_low_income_dynamics: "Statistics Canada (table 11-10-0024)",
  econ_statcan_housing_starts: "CMHC via Statistics Canada (table 34-10-0126)",
  econ_statcan_rental_vacancy: "CMHC via Statistics Canada (table 34-10-0127)",
  econ_statcan_crime_severity: "Statistics Canada (table 35-10-0026)",
  econ_statcan_crime_rate: "Statistics Canada (table 35-10-0177)",
  econ_statcan_cpi_essentials: "Statistics Canada (table 18-10-0004)",
  econ_statcan_gdp_monthly: "Statistics Canada (table 36-10-0434)",
  econ_oecd_oda: "OECD DAC1",
  econ_owid_life_satisfaction: "World Happiness Report via Our World in Data",
  econ_owid_homicide_rate: "UNODC via Our World in Data",
  econ_owid_corruption_perceptions:
    "Transparency International via Our World in Data",
  econ_owid_co2_per_capita: "Global Carbon Budget via Our World in Data",
  econ_statcan_gdp_per_capita: "Statistics Canada (table 36-10-0706)",
  econ_statcan_employment_rate_by_age: "Statistics Canada (table 14-10-0287)",
  econ_statcan_employment_by_class: "Statistics Canada (table 14-10-0288)",
  econ_statcan_hourly_wages: "Statistics Canada (table 14-10-0064)",
  econ_statcan_business_dynamics: "Statistics Canada (table 33-10-0270)",
  econ_statcan_fdi_flows: "Statistics Canada (table 36-10-0025)",
  econ_statcan_investment_position: "Statistics Canada (table 36-10-0008)",
  econ_statcan_capital_formation: "Statistics Canada (table 36-10-0104)",
  econ_statcan_govt_debt_to_gdp: "Statistics Canada (table 38-10-0237)",
  econ_statcan_population_components: "Statistics Canada (table 17-10-0008)",
  econ_statcan_population_total: "Statistics Canada (table 17-10-0009)",
  econ_statcan_npr_by_type: "Statistics Canada (table 17-10-0121)",
  econ_ircc_pr_admissions: "Immigration, Refugees and Citizenship Canada",
};

export function humanizeSourceName(name: string): string {
  if (SOURCE_NAMES[name]) return SOURCE_NAMES[name];
  if (name.startsWith("econ_worldbank"))
    return "World Bank, World Development Indicators";
  if (name.startsWith("econ_oecd")) return "OECD";
  if (name.startsWith("econ_statcan")) return "Statistics Canada";
  return name;
}

// For StatsCan sources the API's source URL is its ingestion endpoint
// (StatsCan's POST-only Web Data Service, so browsers get a 405); link to
// the public table page instead. Table numbers match SOURCE_NAMES above.
const STATCAN_TABLES: Record<string, string> = {
  econ_statcan_gini_after_tax: "11-10-0134",
  econ_statcan_low_income_dynamics: "11-10-0024",
  econ_statcan_housing_starts: "34-10-0126",
  econ_statcan_rental_vacancy: "34-10-0127",
  econ_statcan_crime_severity: "35-10-0026",
  econ_statcan_crime_rate: "35-10-0177",
  econ_statcan_cpi_essentials: "18-10-0004",
  econ_statcan_gdp_monthly: "36-10-0434",
  econ_statcan_gdp_per_capita: "36-10-0706",
  econ_statcan_employment_rate_by_age: "14-10-0287",
  econ_statcan_employment_by_class: "14-10-0288",
  econ_statcan_hourly_wages: "14-10-0064",
  econ_statcan_business_dynamics: "33-10-0270",
  econ_statcan_fdi_flows: "36-10-0025",
  econ_statcan_investment_position: "36-10-0008",
  econ_statcan_capital_formation: "36-10-0104",
  econ_statcan_govt_debt_to_gdp: "38-10-0237",
  econ_statcan_population_components: "17-10-0008",
  econ_statcan_population_total: "17-10-0009",
  econ_statcan_npr_by_type: "17-10-0121",
};

export function humanizeSourceUrl(
  name: string,
  url: string | null,
): string | null {
  const table = STATCAN_TABLES[name];
  if (table)
    return `https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=${table.replaceAll("-", "")}01`;
  // IRCC's source URL is the raw open-data CSV; link to the dataset's
  // public landing page instead.
  if (name === "econ_ircc_pr_admissions")
    return "https://open.canada.ca/data/en/dataset/f7e5498e-0ad8-4417-85c9-9b8aff9b9eda";
  // World Bank source URLs are raw API queries (JSON dumps); link to the
  // public indicator page instead. Worldwide Governance Indicators carry a
  // GOV_WGI_ prefix in the API's source=3 dataset that the public catalog
  // doesn't use (GOV_WGI_GE.EST -> GE.EST).
  const worldBank = url?.match(
    /^https:\/\/api\.worldbank\.org\/v2\/country\/[^/]+\/indicator\/([A-Za-z0-9._]+)/,
  );
  if (worldBank)
    return `https://data.worldbank.org/indicator/${worldBank[1].replace(/^GOV_WGI_/, "")}`;
  // OECD source URLs are raw SDMX CSV queries; deep-link the OECD Data
  // Explorer for the same agency + dataflow instead.
  const oecd = url?.match(
    /^https:\/\/sdmx\.oecd\.org\/public\/rest\/data\/([^,]+),([^,]+),/,
  );
  if (oecd)
    return `https://data-explorer.oecd.org/vis?df[ds]=dsDisseminate&df[id]=${encodeURIComponent(oecd[2])}&df[ag]=${encodeURIComponent(oecd[1])}`;
  return url;
}

// Annual data refreshed at most weekly; matches the API's Cache-Control max-age.
const REVALIDATE = 3600;

function normalizePoint(point: RawSeriesPoint): EconomySeriesPoint {
  if (point.date) {
    const [year, month] = point.date.split("-").map(Number);
    return { year: year + (month - 1) / 12, date: point.date, value: point.value };
  }
  return { year: point.year ?? 0, value: point.value };
}

export async function getEconomicSeries(
  measure: string,
  options?: {
    // Comma-separated jurisdiction slugs (e.g. "ca") to fetch a subset of a
    // measure's series; omit for all jurisdictions.
    jurisdictions?: string;
  },
): Promise<EconomySeriesResponse> {
  const response = await apiFetch<EconomySeriesResponse>("/kpis/series", {
    revalidate: REVALIDATE,
    params: {
      measure,
      ...(options?.jurisdictions
        ? { jurisdictions: options.jurisdictions }
        : {}),
    },
  });
  return {
    ...response,
    data: {
      ...response.data,
      series: response.data.series.map((s) => ({
        ...s,
        points: (s.points as RawSeriesPoint[]).map(normalizePoint),
      })),
    },
  };
}
