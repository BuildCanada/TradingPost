# State of the Nation — new measures spec

york_factory (branch `mikaal/state-of-the-nation-additions`) now serves 34 new
measures covering employment, wages, business formation, investment, government
debt, and immigration. This doc is everything the frontend needs to chart them.

All measures are served by the existing endpoint:

```
GET /api/v1/kpis/series?measure=<slug>
GET /api/v1/kpis/series?measure=<slug>&from=2000&to=2026
GET /api/v1/kpis/series?measure=<slug>&jurisdictions=ca
```

## API change: quarterly series

Until now `points` came in two shapes: annual `{ year, value }` and monthly
`{ date, value }`. There is now a third measure frequency, `quarterly`, which
serializes **the same way as monthly**: `{ date, value }`, where `date` is the
first day of the quarter (`"2026-01-01"` = Q1 2026).

Switch on `data.measure.frequency`:

| `measure.frequency` | point shape | example |
|---|---|---|
| `annual` | `{ year, value }` | `{ "year": 2024, "value": 435421 }` |
| `monthly` | `{ date, value }` | `{ "date": "2026-06-01", "value": 60.8 }` |
| `quarterly` | `{ date, value }` | `{ "date": "2026-01-01", "value": 20133.0 }` |

If your chart code currently assumes `points[0].date != null` implies monthly
spacing, update it — quarterly points are 3 months apart. Anything keyed off
`frequency` rather than point shape needs the new `"quarterly"` value handled.

Everything else is unchanged: `meta.source` carries `name`, `url`,
`last_fetched_at`, `license`, `attribution`. **Attribution must be displayed**
for all of these (Statistics Canada Open Licence; IRCC is Open Government
Licence – Canada) — same treatment as the existing OWID/StatCan charts.

All new series are **Canada-only** (single series, jurisdiction slug `ca`)
except `capital-formation-pct-gdp`, which has the full G7 + OECD + computed-G7
jurisdiction set like the other World Bank measures.

There is also a new measure `category` value, `population`, alongside the
existing `economy` / `welfare` / etc.

---

## 1. Employment by age group

Monthly, seasonally adjusted, percent, 1976→present. Source: StatCan LFS
table 14-10-0287. All four share unit and frequency, so they work as a
combined overlay chart.

| slug | series |
|---|---|
| `employment-rate-15-plus` | Employment rate, 15 years and over |
| `employment-rate-15-to-24` | Employment rate, 15–24 |
| `employment-rate-25-to-54` | Employment rate, 25–54 (core working age) |
| `employment-rate-55-to-64` | Employment rate, 55–64 |

Note: the existing annual `employment-rate` (World Bank, G7 comparison) is a
different measure and stays as-is; these are the Canadian monthly detail.

## 2. Private vs public employment

Monthly, seasonally adjusted, **thousands of persons**, 1976→present.
Source: StatCan LFS table 14-10-0288.

| slug | series |
|---|---|
| `employment-all-classes` | Total employed, all classes |
| `employment-public-sector` | Public sector employees |
| `employment-private-sector` | Private sector employees |
| `employment-self-employed` | Self-employed |

**Shares are not stored** — compute client-side, e.g. public share =
`employment-public-sector / employment-all-classes`. The three components sum
to the total (within rounding), so a 100%-stacked area chart works.

## 3. Wages

Annual, current dollars per hour, 1997→present. Source: StatCan LFS table
14-10-0064 (all employees, all industries, full- and part-time).

| slug | series |
|---|---|
| `average-hourly-wage` | Average hourly wage rate |
| `median-hourly-wage` | Median hourly wage rate |

**The requested 10th/90th percentile series do not exist** in StatCan's public
API — verified against every LFS wage table and the full cube catalog. They
would require LFS microdata or a custom tabulation. Average vs median is the
closest available dispersion signal (the gap widening = top-heavy wage growth).
Copy for this chart should not promise percentiles.

## 4. New business formation

Monthly, seasonally adjusted, counts of businesses, 2015→present. Source:
StatCan table 33-10-0270 (business sector industries).

| slug | series | higher_is_bad |
|---|---|---|
| `business-entrants` | Businesses appearing for the first time (true new-business formation) | false |
| `business-exits` | Businesses permanently ceasing operations | true |
| `active-businesses` | Businesses with 1+ employees | false |

Entrants/exits measure genuine business creation and death — unlike the same
table's "openings/closings", which count any month a business crosses 0↔1+
employees (including seasonal reopenings). StatCan's dedicated entry/exit
table (33-10-0165, with entry/exit *rates*) stopped publishing at 2019 Q4, so
this monthly table is the live source.

Two footnotes for the chart: StatCan labels these **experimental estimates**,
and **`business-exits` runs ~6 months behind `business-entrants`** (an exit is
only confirmed once the business stays closed) — expect the exits line to end
earlier than the entrants line, and don't render the gap as a decline. Net
formation (entrants − exits) can be derived client-side where both months
exist.

## 5. Investment flows (FDI)

Quarterly, millions of CAD (total net flows), 2007→present. Source: StatCan
table 36-10-0025 (balance of payments).

| slug | series |
|---|---|
| `fdi-inflows` | Foreign direct investment **into** Canada |
| `fdi-outflows` | Canadian direct investment **abroad** |

These are flows, not stocks; values can be negative in principle
(disinvestment). "Outflows" is not bad per se — it's Canadian firms investing
abroad — so avoid red/green framing.

## 6. Capital formation

| slug | frequency | unit | coverage |
|---|---|---|---|
| `gross-fixed-capital-formation` | quarterly | chained 2017 $M, SAAR | Canada, 1961→ |
| `business-gross-fixed-capital-formation` | quarterly | chained 2017 $M, SAAR | Canada, 1961→ |
| `capital-formation-pct-gdp` | annual | % of GDP | **G7 comparison** (World Bank) |

The two StatCan series are levels (seasonally adjusted at annual rates); the
World Bank one is the cross-country comparison chart. Reasonable layout:
featured chart = `capital-formation-pct-gdp` (Canada vs G7), detail charts =
the quarterly Canadian levels.

## 7. Government debt-to-GDP (all levels)

Quarterly, percent of GDP, 1990→present, `higher_is_bad: true`. Source:
StatCan table 38-10-0237 — general government consolidated: federal +
provincial/territorial + local + CPP/QPP, national balance sheet accounts
basis.

| slug | series | latest (Q1 2026) |
|---|---|---|
| `govt-gross-debt-to-gdp` | Gross debt to GDP | ~132% |
| `govt-net-debt-to-gdp` | Net financial liabilities to GDP | ~21% |

The gross/net gap is large because net subtracts financial assets (including
CPP/QPP assets). Show both or label carefully — "net" here is much lower than
the federal-budget "net debt" figures people know from the news, because of
the NBSA market-value methodology. Don't average or mix them.

## 8. Immigration & population (new `population` category)

### Components of population growth — annual, persons, 1971→present

Source: StatCan table 17-10-0008. **Reference years run July 1–June 30**: the
point `year: 2024` covers July 2023–June 2024. Label as "July–June year" or
"demographic year" to avoid mismatch with calendar-year IRCC numbers.

| slug | series |
|---|---|
| `immigrants-annual` | Immigrants (PR admissions) |
| `emigrants-annual` | Emigrants |
| `returning-emigrants-annual` | Returning emigrants |
| `net-non-permanent-residents-annual` | Net change in non-permanent residents (can be negative) |

**Net emigration is derived client-side** as
`emigrants-annual − returning-emigrants-annual`. (StatCan's own "net temporary
emigration" series died in a 2016 methodology change and is not served.)

### Non-permanent residents by type — quarterly, persons, 2021 Q3→present

Source: StatCan table 17-10-0121. These are **stocks** (how many people, as of
the first day of the quarter), not flows. Short history — charts will only
have ~20 points; suppress any "20-year trend" framing.

| slug | series |
|---|---|
| `npr-total` | All non-permanent residents |
| `npr-asylum-claimants` | Asylum claimants, protected persons and related |
| `npr-work-permit-holders` | Work permit holders only — **closest proxy for "temporary foreign workers"** |
| `npr-study-permit-holders` | Study permit holders only |
| `npr-work-and-study-permit-holders` | Holding both permits |

There is no series literally called "temporary foreign workers" (the TFWP/IMP
program split isn't in StatCan tables); if the chart is titled "Temporary
foreign workers", footnote that it shows work-permit holders.

### PR admissions by immigration class — monthly, persons, 2015→present

Source: IRCC Permanent Residents Monthly Updates (~2-month publication lag).

| slug | series |
|---|---|
| `pr-admissions-total` | All categories |
| `pr-admissions-economic` | Economic (worker programs, PNP, business, TR-to-PR) |
| `pr-admissions-family` | Sponsored family |
| `pr-admissions-refugee` | Resettled refugees & protected persons |
| `pr-admissions-other` | Humanitarian & compassionate, public policy, permit holders |

The four categories stack to the total → good stacked-area candidate.
**Data caveat for the footnote:** IRCC suppresses cells under 6 and rounds
everything to the nearest 5, so values are approximate and won't exactly match
StatCan's `immigrants-annual` (which also uses July–June years). "Student" is
not a PR class — students appear in `npr-study-permit-holders` above.

---

## History coverage & matched chart windows

Every series is served at its **full published history** — nothing is
truncated on the backend. The series cannot all start at the same date
because the underlying StatCan programs began at different times, so
matching happens client-side with the `from=` parameter. Confirmed coverage
(first data point, verified against loaded data):

| starts | series |
|---|---|
| 1961 | capital formation (both StatCan levels and World Bank % of GDP) |
| 1971 | population components (immigrants, emigrants, returning, net NPR) |
| 1976 | employment rates by age; employment by class of worker |
| 1990 | debt-to-GDP (gross and net) |
| 1997 | average/median hourly wage |
| 2007 | FDI inflows/outflows |
| 2015 | business entrants/exits/active; PR admissions by category |
| 2021 Q3 | non-permanent residents by type |

Recommended convention for visual consistency:

- **Default window: `from=1990`** — 5 of 8 dataset families cover it fully,
  and it spans a full generation. Use it wherever the section's series reach
  that far (employment, wages from 1997, capital formation, debt, population
  components).
- Series that physically can't reach 1990 (FDI, business dynamics, PR
  admissions, NPR) should render their full history and state the start year
  in the chart subtitle (e.g. "since 2015") rather than pad empty space.
- Within a combined/overlay chart, clip all series to the **latest common
  start** so lines begin together.

## Suggested section mapping

Against the existing `SECTIONS` ids in
`src/app/prosperity-dashboard/indicators.ts`:

- `economy` → business formation (3), FDI (2), capital formation (3),
  debt-to-GDP (2)
- `welfare` → employment by age (4), class of worker (4), wages (2)
- **new section** (suggest `id: "population"`, title "Population &
  Immigration") → components (4), NPR (5), PR admissions (5)

Combined-overlay candidates (same unit + frequency within group): employment
rates by age; class-of-worker levels; NPR types; PR admission categories;
gross vs net debt-to-GDP; average vs median wage; entrants vs exits.

## Quick reference — all 34 slugs

```
employment-rate-15-plus            monthly    %
employment-rate-15-to-24           monthly    %
employment-rate-25-to-54           monthly    %
employment-rate-55-to-64           monthly    %
employment-all-classes             monthly    thousands
employment-public-sector           monthly    thousands
employment-private-sector          monthly    thousands
employment-self-employed           monthly    thousands
average-hourly-wage                annual     $/hour
median-hourly-wage                 annual     $/hour
business-entrants                  monthly    count
business-exits                     monthly    count (lags ~6 months)
active-businesses                  monthly    count
fdi-inflows                        quarterly  $M
fdi-outflows                       quarterly  $M
gross-fixed-capital-formation      quarterly  $M (chained 2017, SAAR)
business-gross-fixed-capital-formation  quarterly  $M (chained 2017, SAAR)
capital-formation-pct-gdp          annual     % of GDP (G7 comparison)
govt-gross-debt-to-gdp             quarterly  %
govt-net-debt-to-gdp               quarterly  %
immigrants-annual                  annual     persons (July–June year)
emigrants-annual                   annual     persons (July–June year)
returning-emigrants-annual         annual     persons (July–June year)
net-non-permanent-residents-annual annual     persons (July–June year)
npr-total                          quarterly  persons (stock)
npr-asylum-claimants               quarterly  persons (stock)
npr-work-permit-holders            quarterly  persons (stock)
npr-study-permit-holders           quarterly  persons (stock)
npr-work-and-study-permit-holders  quarterly  persons (stock)
pr-admissions-total                monthly    persons
pr-admissions-economic             monthly    persons
pr-admissions-family               monthly    persons
pr-admissions-refugee              monthly    persons
pr-admissions-other                monthly    persons
```

To develop against this locally: run york_factory (`bin/rails server`), point
`YORK_FACTORY_API_URL=http://localhost:3000/api/v1` in `.env.local`, and the
data is already loaded. Example:
`curl "http://localhost:3000/api/v1/kpis/series?measure=pr-admissions-economic"`.
