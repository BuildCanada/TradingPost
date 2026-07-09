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

// The API serves annual points as { year, value } and monthly points
// (measure.frequency === "monthly") as { date, value }. getEconomicSeries
// normalizes both to a numeric `year` time axis — fractional for monthly
// (year + monthIndex / 12) — so charts keep a single numeric x dimension,
// with the ISO first-of-month date preserved for date formatting.
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
  econ_oecd_oda: "OECD DAC1",
  econ_owid_life_satisfaction: "World Happiness Report via Our World in Data",
  econ_owid_homicide_rate: "UNODC via Our World in Data",
  econ_owid_corruption_perceptions:
    "Transparency International via Our World in Data",
  econ_owid_co2_per_capita: "Global Carbon Budget via Our World in Data",
};

export function humanizeSourceName(name: string): string {
  if (SOURCE_NAMES[name]) return SOURCE_NAMES[name];
  if (name.startsWith("econ_worldbank"))
    return "World Bank, World Development Indicators";
  if (name.startsWith("econ_oecd")) return "OECD";
  if (name.startsWith("econ_statcan")) return "Statistics Canada";
  return name;
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
): Promise<EconomySeriesResponse> {
  const response = await apiFetch<EconomySeriesResponse>("/kpis/series", {
    revalidate: REVALIDATE,
    params: { measure },
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
