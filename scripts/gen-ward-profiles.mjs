// Generate Toronto's per-ward Census statistics (wardStats.ts) from the
// checked-in extract of the City's own ward profiles.
//
//   node scripts/gen-ward-profiles.mjs
//
// Inputs  scripts/data/toronto-ward-census-2021.csv  (see scripts/data/README.md
//         for every column's provenance in the City's XLSX)
//         scripts/data/toronto-ward-councillors.csv
// Outputs src/app/toronto/vote/2026/wardStats.ts
//         src/app/toronto/vote/2026/wardCouncillors.ts
//
// The statistics are the generated half of a ward's profile; the hand-written
// half — the brief prose — lives in wardProfiles.ts and this script never
// touches it. Same split as wardGeo.ts (generated) and candidates.ts (by hand).
//
// Every stat is emitted pre-formatted as a display string, with the citywide
// figure alongside it, because the only consumer is a UI that wants to print
// "45.5%" next to "48.1% citywide" — not to do arithmetic. Deliberately
// dependency-free: this runs once per Census release.

import { readFileSync, writeFileSync } from "node:fs";

const INPUT = "scripts/data/toronto-ward-census-2021.csv";
const OUT = "src/app/toronto/vote/2026/wardStats.ts";
const COUNCILLORS_INPUT = "scripts/data/toronto-ward-councillors.csv";
const COUNCILLORS_OUT = "src/app/toronto/vote/2026/wardCouncillors.ts";

// ── Read ───────────────────────────────────────────────────────────────────

const lines = readFileSync(INPUT, "utf8").trim().split(/\r?\n/);
const header = lines[0].split(",");
const rows = new Map(
  lines.slice(1).map((line) => {
    const cells = line.split(",");
    const row = Object.fromEntries(header.map((h, i) => [h, cells[i]]));
    return [row.ward, row];
  }),
);

const city = rows.get("toronto");
if (!city) throw new Error(`${INPUT}: no "toronto" row for citywide figures`);

const WARDS = [...rows.keys()].filter((w) => w !== "toronto").sort();
if (WARDS.length !== 25) {
  throw new Error(`${INPUT}: expected 25 wards, found ${WARDS.length}`);
}

// ── Format ─────────────────────────────────────────────────────────────────

const num = (row, key) => {
  const raw = row[key];
  if (raw === undefined || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new Error(`${key}: not a number (${raw})`);
  return n;
};

const need = (row, key) => {
  const n = num(row, key);
  if (n === null) throw new Error(`ward ${row.ward}: ${key} is empty`);
  return n;
};

const count = (n) => n.toLocaleString("en-CA");
const money = (n) => `$${n.toLocaleString("en-CA")}`;
const pct = (n) => `${n.toFixed(1)}%`;
const share = (part, whole) => pct((part / whole) * 100);
const signedPct = (n) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(1)}%`;

/** Population change since the 2016 Census, as a display string. A ward that
 *  moved by less than 0.05% would print as "+0.0% since 2016", which reads as
 *  a rounding artefact rather than the fact it is, so it is spelled out. */
const popChange = (row) => {
  const change = (need(row, "pop_2021") / need(row, "pop_2016") - 1) * 100;
  if (Math.abs(change) < 0.05) return "No change since 2016";
  return `${signedPct(change)} since 2016`;
};

// Each entry is one row of the ward profile: a label, the ward's value, the
// citywide value to read it against, and an optional note under it. `city`
// returns null where a citywide comparison is meaningless (density).
const STATS = [
  {
    label: "Population",
    ward: (r) => count(need(r, "pop_2021")),
    note: (r) => popChange(r),
  },
  {
    label: "Residents per km²",
    ward: (r) => count(Math.round(need(r, "pop_2021") / need(r, "area_sq_km"))),
    city: () => null,
    note: (r) => `${need(r, "area_sq_km").toFixed(1)} km² of land`,
  },
  {
    label: "Median household income",
    ward: (r) => money(need(r, "med_hh_income")),
  },
  {
    label: "Renter households",
    ward: (r) => share(need(r, "rented"), need(r, "tenure_total")),
    note: (r) => `${money(need(r, "avg_rent"))} average monthly rent`,
  },
  {
    label: "Renters spending 30%+ of income on housing",
    ward: (r) => pct(need(r, "tenant_burden_30")),
  },
  {
    label: "Homes in buildings of five storeys or more",
    ward: (r) => share(need(r, "apt_5plus"), need(r, "dwellings_total")),
    note: (r) =>
      `${share(need(r, "single_detached"), need(r, "dwellings_total"))} single-detached`,
  },
  {
    label: "Residents born outside Canada",
    ward: (r) => share(need(r, "immigrants"), need(r, "privhh_pop")),
  },
  {
    label: "Residents in low income",
    ward: (r) => pct(need(r, "lim_at_rate")),
    note: () => "Low-income measure, after tax",
  },
];

const statsFor = (row) =>
  STATS.map((stat) => {
    const entry = { label: stat.label, value: stat.ward(row) };
    const cityValue = stat.city ? stat.city(row) : stat.ward(city);
    if (cityValue !== null) entry.cityValue = cityValue;
    const note = stat.note ? stat.note(row) : null;
    if (note !== null) entry.note = note;
    return entry;
  });

// Serialised by hand rather than with JSON.stringify over an object, because
// JS reorders integer-like keys ("10" before "01") and the emitted file should
// read 01..25 for whoever reviews the diff.
const table =
  "{\n" +
  WARDS.map(
    (w) =>
      `  "${w}": ${JSON.stringify(statsFor(rows.get(w)), null, 2).replace(/\n/g, "\n  ")},`,
  ).join("\n") +
  "\n}";

// ── Emit ───────────────────────────────────────────────────────────────────

const file = `// AUTO-GENERATED — do not edit by hand.
// Toronto's per-ward Census statistics, formatted for display.
// Source: Ward Profiles (25-Ward Model), City of Toronto Open Data, from
// Statistics Canada's 2021 and 2016 Census of Population.
// https://open.toronto.ca/dataset/ward-profiles-25-ward-model/
// Regenerate with: node scripts/gen-ward-profiles.mjs
// The hand-written briefs that accompany these live in ./wardProfiles.ts.

import type { WardStat } from "@/components/elections/WardProfile";

/** Statistics for each ward, keyed by the zero-padded ward token ("01".."25"),
 *  in the order they should be shown. */
export const WARD_STATS: Record<string, WardStat[]> = ${table};

/** Where these figures come from, worded for the source line shown under a
 *  ward's statistics. */
export const WARD_STATS_SOURCE =
  "the 2021 Census of Population, via the City of Toronto\u2019s ward profiles";
`;

writeFileSync(OUT, file);
console.log(
  `${OUT}: ${WARDS.length} wards × ${STATS.length} stats, ${(Buffer.byteLength(file) / 1024).toFixed(1)} KB`,
);

// ── Sitting councillors ────────────────────────────────────────────────────

/* Who holds each seat today, so a ward page can name the incumbent when they
   register to run again. Whether they have is not knowable here — it comes
   from the live candidate roster — so this file only says who sits, and the
   page decides whether to show them. */

const councillorLines = readFileSync(COUNCILLORS_INPUT, "utf8")
  .trim()
  .split(/\r?\n/);
const councillorHeader = councillorLines[0].split(",");
const councillors = councillorLines.slice(1).map((line) => {
  const cells = line.split(",");
  return Object.fromEntries(councillorHeader.map((h, i) => [h, cells[i]]));
});

if (councillors.length !== 25) {
  throw new Error(
    `${COUNCILLORS_INPUT}: expected 25 councillors, found ${councillors.length}`,
  );
}

const effective = [...new Set(councillors.map((c) => c.date_effective))].sort();

const councillorFile = `// AUTO-GENERATED — do not edit by hand.
// The councillor sitting for each Toronto ward, as of ${effective[effective.length - 1]}.
// Source: Ward and Elected Councillor, City of Toronto Open Data.
// https://open.toronto.ca/dataset/wards-and-elected-councillors/
// Regenerate with: node scripts/gen-ward-profiles.mjs
//
// Refresh this after any by-election, and again once the 2026 results are in.
// Nothing here says whether a councillor is seeking re-election — that is read
// off the live candidate roster; see wardProfiles.ts.

/** The sitting councillor for each ward, keyed by the zero-padded ward token
 *  ("01".."25"). */
export const WARD_COUNCILLORS: Record<string, string> = {
${councillors
  .map((c) => `  "${c.ward}": ${JSON.stringify(c.councillor)},`)
  .join("\n")}
};
`;

writeFileSync(COUNCILLORS_OUT, councillorFile);
console.log(`${COUNCILLORS_OUT}: ${councillors.length} councillors`);
