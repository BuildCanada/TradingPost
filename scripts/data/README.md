# scripts/data

Checked-in intermediates for the `scripts/gen-*.mjs` generators. Each one is a
small, human-auditable extract of a larger official file, so the generators can
run with no extra dependencies and a reviewer can diff the numbers.

## toronto-ward-census-2021.csv

Per-ward figures for Toronto's 25-ward model, extracted from the City of
Toronto's own ward profiles. Consumed by `scripts/gen-ward-profiles.mjs`, which
emits `src/app/toronto/vote/2026/wardStats.ts`.

- Dataset: Ward Profiles (25-Ward Model), City of Toronto Open Data
  https://open.toronto.ca/dataset/ward-profiles-25-ward-model/
- Underlying source: Statistics Canada, 2021 and 2016 Census of Population
- Files used:
  - `2023-wardprofiles-2011-2021-censusdata_rev0719.xlsx`
    (sheets "2021 One Variable" and "2016 Census One Variable")
  - `2023-wardprofiles-geographicareas.xlsx` (ward land area)

The `ward` column is the zero-padded ward token used throughout the app
("01".."25"), plus one `toronto` row holding the citywide figure for each
column so the UI can show every ward against the city.

Column provenance, by row number in the "2021 One Variable" sheet:

| column | source row |
| --- | --- |
| `pop_2021` | 19 — Total - Age |
| `pop_2016` | 19 of the "2016 Census One Variable" sheet |
| `median_age` | 40 — Median age |
| `dwellings_total` | 44 — Total - Occupied private dwellings by structural type |
| `single_detached` | 45 — Single-detached house |
| `apt_5plus` | 50 — Apartment in a building that has five or more storeys |
| `tenure_total` | 55 — Total - Tenure (includes band housing) |
| `owned` | 56 — Owned |
| `rented` | 59 — Rented |
| `hhtype_total` | 114 — Total - Household type |
| `one_person_hh` | 124 — One-person households |
| `privhh_pop` | 144 — Total - Immigrant status and period of immigration |
| `immigrants` | 146 — Immigrants |
| `edu_total_15plus` | 997 — Total - Highest certificate, diploma or degree |
| `bachelor_plus` | 1007 — Bachelor's degree or higher |
| `med_hh_income` | 1385 — Median total income of households in 2020 ($) |
| `avg_rent` | 1392 — Average monthly shelter costs for rented dwellings ($) |
| `tenant_burden_30` | 1393 — % of tenant households spending 30%+ on shelter |
| `avg_owner_cost` | 1396 — Average monthly shelter costs for owned dwellings ($) |
| `owner_burden_30` | 1397 — % of owner households spending 30%+ on shelter |
| `lim_at_rate` | 1405 — Prevalence of low income (LIM-AT), % |
| `area_sq_km` | ward land area, from the geographic-areas file |

Counts are Statistics Canada's, and are rounded to the nearest 5 at source, so
percentages derived from them carry that rounding. Refresh this file when the
City publishes ward profiles for the 2026 Census.

## toronto-ward-councillors.csv

The councillor sitting for each of Toronto's 25 wards. Consumed by the same
generator, which emits `src/app/toronto/vote/2026/wardCouncillors.ts`.

- Dataset: Ward and Elected Councillor, City of Toronto Open Data
  https://open.toronto.ca/dataset/wards-and-elected-councillors/
- Columns: the zero-padded `ward` token, the `councillor` holding it, and the
  `date_effective` the City records for that row.

Refresh after any by-election, and again once the 2026 results are declared.
Whether a councillor is seeking re-election is deliberately *not* recorded
here — that is read off the live candidate roster at render time, so it cannot
go stale. See `wardProfile()` in `src/app/toronto/vote/2026/wardProfiles.ts`.
