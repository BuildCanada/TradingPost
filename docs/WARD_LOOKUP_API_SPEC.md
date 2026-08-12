# Postal code → ward lookup — backend spec

The Toronto 2026 election page (`/toronto/elections/2026`) wants a "find your
ward" input: someone types a postal code, we show the ward they vote in and link
to `/toronto/elections/2026/wards/<n>`.

Everything needed already exists in york_factory except two things: **Toronto
ward geometry has never been ingested**, and **no endpoint joins a postal code
to a ward**. This doc covers both, plus one loader bug that blocks the ingest.

## What already works

Confirmed against production (`https://yorkfactory.buildcanada.com/api/v1`):

- `warehouse.postal_codes` is populated with full 6-character codes and
  lat/long. `GET /elections/toronto-2026/pledges/eligibility?postal_code=M4C1S9`
  returns `{"eligible":true,"reason":"inside_boundary","city":"TORONTO"}`, which
  only resolves that way if the postal record was found *and* its centroid
  tested against PostGIS geometry.
- `Warehouse::GeoBoundary` holds `geography(MultiPolygon,4326)` geometry, and
  `Warehouse::Election::PledgeEligibility#contains?` already does exactly the
  `ST_Intersects` we need — just against `csd` rather than ward boundaries.
- `Warehouse::Source` `ward_toronto` is seeded (`db/seeds.rb:150`) pointing at
  Toronto's 25-ward-model shapefile, with `BoundaryLoader` field mappings
  already written for it (`uid: "AREA_S_CD"`, `name_en: "AREA_NAME"`,
  `province_code: "35"`).

## Blocker 1 — boundary_type mismatch (must fix before ingest)

`BoundaryLoader::BOUNDARY_TYPE_MAP` maps the municipal ward sources to types
that `GeoBoundary`'s enum does not define:

| source | `BOUNDARY_TYPE_MAP` emits | `GeoBoundary::BOUNDARY_TYPES` has |
|---|---|---|
| `ward_toronto` | `"med"` | `"ward"` |
| `sbw_tdsb`, `sbw_tcdsb`, `sbw_viamonde`, `sbw_monavenir` | `"sbed"` | `"school_board_ward"` |

`import_shapefile` writes via `upsert_all`, which bypasses enum casting, so rows
would land in the table with `boundary_type = 'med'` and then be invisible to
`GeoBoundary.by_type("ward")` — and `by_type("med")` raises `ArgumentError`,
since the enum has no such member. Either rename the map values to `ward` /
`school_board_ward`, or add `med` / `sbed` to `BOUNDARY_TYPES`. **The map values
are the wrong ones** — `ward` is the documented type and what the crosswalk and
`geo/boundaries` callers already use. Note `code_system` derives from the same
string (`"#{boundary_type}_#{CENSUS_YEAR}"`), so it changes with it.

Production currently has `boundary_type=ward` → `count: 0`, versus `csd` 5142,
`fsa` 1641, `fed` 343. The school board ward sources are presumably in the same
state.

## Blocker 2 — geo_uid collision across cities

`ward_toronto` takes `geo_uid` straight from `AREA_S_CD`, which is the
zero-padded ward number, `"01"`–`"25"`. The unique index is
`(boundary_type, geo_uid, census_year)`, so the first other municipality's ward
layer we load will collide on `"01"` and silently upsert over Toronto's ward 1.

Brampton and Hamilton elections are already in the system, so this will bite.
Suggest a `uid_prefix` in `CUSTOM_FIELD_MAP` for `ward_toronto` — the mechanism
already exists and is used by the PED sources — keyed by CSD so it stays
meaningful: `"3520005-01"`. Whatever shape you choose, **the endpoint below must
return the bare ward number separately**, because the frontend routes on it.

## Ingest

Once the type mapping is fixed:

```ruby
Warehouse::Source.find_by(name: "ward_toronto").fetcher.fetch
```

`geo:pipeline` already picks up `ward_%` sources, but the source is
`fetch_frequency: "manual"`, so this needs running deliberately. Expect 25 rows
at `boundary_type: "ward"`, `province_code: "35"`, `census_year` = the loader's
`CENSUS_YEAR`.

Sanity check after loading — every ward present, no null geometry:

```
GET /api/v1/geo/boundaries?boundary_type=ward&province_code=ON
```

## The endpoint

```
GET /api/v1/geo/ward_lookup?postal_code=M4C1S9
```

Add to the existing `namespace :geo` block in `config/routes.rb`, alongside
`crosswalk`, `boundaries`, `addresses`. Public and unauthenticated, matching the
rest of that namespace and the eligibility endpoint.

`postal_code` is required and accepts any spacing/casing —
`Warehouse::PostalCode.normalize` already handles `"m4c1s9"`, `"M4C 1S9"`, etc.

Optional `boundary_type` param defaulting to `ward`, so the same endpoint can
answer school board wards later without a second route.

### Response — resolved

```json
{
  "postal_code": "M4C 1S9",
  "city": "TORONTO",
  "found": true,
  "reason": "resolved",
  "ward": {
    "geo_uid": "3520005-01",
    "ward_number": 19,
    "name_en": "Beaches-East York",
    "boundary_type": "ward",
    "census_year": 2018
  }
}
```

`ward_number` as an **integer**, parsed from the ward code — the frontend builds
`/toronto/elections/2026/wards/19` from it and the existing ward routes use
unpadded numbers. Don't make the client parse `"01"` out of a `geo_uid` whose
format we may change.

### Response — not resolved

Same envelope, `found: false`, `ward: null`, and a `reason` the client can
branch on. Please keep these as stable strings; the UI copy differs per case:

| `reason` | meaning | UI intent |
|---|---|---|
| `malformed_postal_code` | failed `normalize` | "check what you typed" |
| `unknown_postal_code` | not in `warehouse.postal_codes` | "we don't recognize that code" |
| `outside_boundary` | geocoded fine, no ward contains it | "looks like you're outside Toronto" |
| `boundary_data_unavailable` | zero ward boundaries loaded | generic failure, and it's on us |

This mirrors `PledgeEligibility::REASONS` and its `indeterminate?` distinction
between "we couldn't judge" and "we judged you outside" — worth reusing that
split rather than collapsing everything into `found: false`.

HTTP status `200` for all of the above including `found: false` — these are
answers, not errors. `400` only for a missing `postal_code` param.

### Implementation note

The query is `PledgeEligibility#contains?` with the boundary scope swapped:

```ruby
Warehouse::GeoBoundary
  .by_type("ward")
  .where.not(geometry: nil)
  .where(
    "ST_Intersects(geometry, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography)",
    lon: record.longitude, lat: record.latitude
  )
  .order(census_year: :desc)
  .first
```

Ordering by `census_year: :desc` matters once a post-2026 ward model lands
beside the 2018 one. If a point somehow matches two wards of the same vintage,
returning the first is fine — see accuracy below.

Cache-friendly: response depends only on `postal_code`, so a long
`Cache-Control` is safe. The frontend will fetch through a Next route with ISR
either way.

## Accuracy — please don't hide this

A postal code's stored point is the centroid of its delivery points, so codes
straddling a ward line can resolve to the neighbouring ward.
`pledge_eligibility.rb` already measures this at 0.08%–0.9% of a city's codes
for municipal boundaries, and ward lines are far more numerous than city ones,
so the rate here will be higher.

That's acceptable for this feature as long as the API doesn't overstate
certainty. The frontend will present the result as "looks like Ward 19" with a
link to browse all wards, never a hard redirect. If it's cheap, an optional
`distance_to_boundary_m` (via `ST_Distance` to the matched ward's boundary)
would let the UI say "this postal code sits on the edge of Wards 19 and 14" —
nice to have, not required for v1.

## Out of scope

- Address-level lookup. `warehouse.addresses` exists and `geo/addresses#index`
  serves it, but production returns zero rows, so full-address autocomplete is
  a separate project.
- School board wards. The endpoint should accept `boundary_type` so they slot in
  later, but the `sbw_*` sources have the same loader bug and aren't needed now.
- Any change to the pledge flow. `PledgeEligibility` keeps using `csd` for
  residency; this endpoint is read-only and independent.

## Frontend contract summary

What TradingPost needs, minimally:

1. One unauthenticated GET taking a postal code in any format.
2. An integer ward number when resolved.
3. A distinguishable `reason` when not, so we can tell "typo" from "outside
   Toronto" from "our data is down."

Ping me when the endpoint is on staging and I'll wire up the input.
