import type { EconomySeriesUnit } from "@/lib/api/economy";

// Every presentation of a unit symbol lives in this one table — the Grapher
// display config (indicator/section charts), the canvas axis title, and the
// canvas tooltip formatter — so adding a unit means adding one row. The API's
// unit object only carries identity (symbol/base_unit/scale); once
// york_factory ships display config with it, this table goes away.

type UnitDisplay = {
  // Grapher display column config.
  name: string;
  shortUnit: string;
  numDecimalPlaces: number;
  conversionFactor?: number;
  // Canvas (Chart.js) presentation.
  axisLabel: string;
  formatValue: (value: number) => string;
};

const int = (value: number) => Math.round(value).toLocaleString("en-CA");

const UNIT_DISPLAY: Record<string, UnitDisplay> = {
  "%": {
    name: "%",
    shortUnit: "%",
    numDecimalPlaces: 1,
    axisLabel: "%",
    formatValue: (v) => `${v.toFixed(1)}%`,
  },
  intl_$: {
    name: "international-$",
    shortUnit: "$",
    numDecimalPlaces: 0,
    axisLabel: "international-$",
    formatValue: (v) => `$${int(v)}`,
  },
  intl_$_per_hour: {
    name: "international-$ per hour worked",
    shortUnit: "$",
    numDecimalPlaces: 1,
    axisLabel: "international-$ / hour",
    formatValue: (v) => `$${v.toFixed(2)}/h`,
  },
  // Values arrive in millions; convert to dollars so Grapher's magnitude
  // abbreviations ("$2.4 trillion") come out true.
  $M: {
    name: "CAD",
    shortUnit: "$",
    numDecimalPlaces: 0,
    conversionFactor: 1_000_000,
    axisLabel: "million $",
    formatValue: (v) => `$${int(v)}M`,
  },
  index: {
    name: "index",
    shortUnit: "",
    numDecimalPlaces: 1,
    axisLabel: "index",
    formatValue: (v) => v.toFixed(1),
  },
  ratio: {
    name: "ratio",
    shortUnit: "",
    numDecimalPlaces: 3,
    axisLabel: "ratio",
    formatValue: (v) => v.toFixed(3),
  },
  units: {
    name: "dwelling units",
    shortUnit: "",
    numDecimalPlaces: 0,
    axisLabel: "dwelling units",
    formatValue: int,
  },
  hours: {
    name: "hours per year",
    shortUnit: "",
    numDecimalPlaces: 0,
    axisLabel: "hours / year",
    formatValue: (v) => `${int(v)} h`,
  },
  score: {
    name: "score",
    shortUnit: "",
    numDecimalPlaces: 2,
    axisLabel: "score",
    formatValue: (v) => v.toFixed(2),
  },
  births_per_woman: {
    name: "births per woman",
    shortUnit: "",
    numDecimalPlaces: 2,
    axisLabel: "births per woman",
    formatValue: (v) => v.toFixed(2),
  },
  per_100_people: {
    name: "per 100 people",
    shortUnit: "",
    numDecimalPlaces: 1,
    axisLabel: "per 100 people",
    formatValue: (v) => v.toFixed(1),
  },
  rate_per_100k: {
    name: "per 100,000 people",
    shortUnit: "",
    numDecimalPlaces: 2,
    axisLabel: "per 100,000",
    formatValue: (v) => v.toFixed(1),
  },
  t_co2_per_capita: {
    name: "tonnes of CO₂ per person",
    shortUnit: "t",
    numDecimalPlaces: 1,
    axisLabel: "t CO₂ / person",
    formatValue: (v) => v.toFixed(1),
  },
  ug_m3: {
    name: "µg/m³",
    shortUnit: "µg/m³",
    numDecimalPlaces: 1,
    axisLabel: "µg/m³",
    formatValue: (v) => v.toFixed(1),
  },
  tonne_km_millions: {
    name: "million ton-km",
    shortUnit: "",
    numDecimalPlaces: 0,
    axisLabel: "million ton-km",
    formatValue: int,
  },
};

export function displayUnit(unit: EconomySeriesUnit): {
  unit: string;
  shortUnit: string;
  numDecimalPlaces: number;
  conversionFactor?: number;
} {
  const display = UNIT_DISPLAY[unit.symbol];
  if (!display) {
    return { unit: unit.base_unit, shortUnit: unit.symbol, numDecimalPlaces: 1 };
  }
  return {
    unit: display.name,
    shortUnit: display.shortUnit,
    numDecimalPlaces: display.numDecimalPlaces,
    ...(display.conversionFactor
      ? { conversionFactor: display.conversionFactor }
      : {}),
  };
}

export function axisLabel(unitSymbol: string): string {
  return UNIT_DISPLAY[unitSymbol]?.axisLabel ?? unitSymbol;
}

export function formatValue(value: number, unitSymbol: string): string {
  const display = UNIT_DISPLAY[unitSymbol];
  return display ? display.formatValue(value) : value.toLocaleString("en-CA");
}
