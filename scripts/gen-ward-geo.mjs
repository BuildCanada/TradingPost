// Generate a region's ward-map geometry (wardGeo.ts) from a GeoJSON boundary
// file published by that city's open-data portal.
//
//   node scripts/gen-ward-geo.mjs \
//     --input ottawa-wards.geojson \
//     --out src/app/ottawa/elections/2026/wardGeo.ts \
//     --city Ottawa \
//     --source "https://open.ottawa.ca/datasets/ottawa::wards-2022-2026" \
//     --ward-field WARD --name-field NAME
//
// What it does, and why:
//   · Projects lon/lat to a plain spherical Mercator, then fits the whole city
//     into a 300-unit-wide viewBox. Locator maps are a few dozen pixels across,
//     so the projection only has to look right, not measure right.
//   · Simplifies each ring with Douglas–Peucker. Raw municipal boundaries carry
//     survey-grade vertex counts (Ottawa's raw file is ~470 KB); at locator size
//     that detail is invisible but would ship in every page's HTML.
//   · Emits paths rounded to 1 decimal, plus each ward's projected centroid.
//
// Deliberately dependency-free — this runs by hand when a city redraws its
// wards (roughly once a term), so it isn't worth a d3 dependency in the app.

import { readFileSync, writeFileSync } from "node:fs";

// ── Args ───────────────────────────────────────────────────────────────────

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  args[process.argv[i].replace(/^--/, "")] = process.argv[i + 1];
}

const {
  input,
  out,
  city,
  source,
  "ward-field": wardField = "WARD",
  "name-field": nameField = "NAME",
  width: widthArg = "300",
  tolerance: toleranceArg = "0.35",
} = args;

if (!input || !out || !city) {
  console.error(
    "usage: node scripts/gen-ward-geo.mjs --input <geojson> --out <wardGeo.ts> --city <City> [--source <url>] [--ward-field WARD] [--name-field NAME] [--width 300] [--tolerance 0.35]",
  );
  process.exit(1);
}

const WIDTH = Number(widthArg);
/** Douglas–Peucker tolerance, in projected units (same space as WIDTH). */
const TOLERANCE = Number(toleranceArg);

// ── Projection ─────────────────────────────────────────────────────────────

/** Spherical Mercator, in radians-ish units; scaled to the viewBox below. */
function mercator([lon, lat]) {
  const x = (lon * Math.PI) / 180;
  const y = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  return [x, y];
}

/** Every ring of a Polygon / MultiPolygon, as arrays of [lon, lat]. */
function ringsOf(geometry) {
  if (geometry.type === "Polygon") return geometry.coordinates;
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat();
  throw new Error(`unsupported geometry: ${geometry.type}`);
}

// ── Simplification ─────────────────────────────────────────────────────────

/** Perpendicular distance from p to the segment ab. */
function pointToSegment(p, a, b) {
  const [px, py] = p;
  const [ax, ay] = a;
  const [bx, by] = b;
  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(
    0,
    Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)),
  );
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Douglas–Peucker, iterative so a dense ring can't blow the stack. */
function simplify(points, tolerance) {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;

  const stack = [[0, points.length - 1]];
  while (stack.length > 0) {
    const [first, last] = stack.pop();
    let maxDist = -1;
    let index = -1;
    for (let i = first + 1; i < last; i++) {
      const dist = pointToSegment(points[i], points[first], points[last]);
      if (dist > maxDist) {
        maxDist = dist;
        index = i;
      }
    }
    if (maxDist > tolerance && index !== -1) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }

  return points.filter((_, i) => keep[i]);
}

// ── Build ──────────────────────────────────────────────────────────────────

const geojson = JSON.parse(readFileSync(input, "utf8"));

const wards = geojson.features
  .map((feature) => {
    const props = feature.properties;
    const number = parseInt(props[wardField], 10);
    if (Number.isNaN(number)) {
      throw new Error(
        `feature has no numeric "${wardField}": ${JSON.stringify(props).slice(0, 200)}`,
      );
    }
    return {
      number,
      name: String(props[nameField]).trim(),
      rings: ringsOf(feature.geometry).map((ring) => ring.map(mercator)),
    };
  })
  .sort((a, b) => a.number - b.number);

// Fit every ward into the viewBox with one uniform scale, so shapes stay true.
const all = wards.flatMap((w) => w.rings.flat());
const minX = Math.min(...all.map((p) => p[0]));
const maxX = Math.max(...all.map((p) => p[0]));
const minY = Math.min(...all.map((p) => p[1]));
const maxY = Math.max(...all.map((p) => p[1]));

const scale = WIDTH / (maxX - minX);
const height = Math.round((maxY - minY) * scale * 10) / 10;

/** Projected space → viewBox space. SVG y grows downward, so y is flipped. */
function toViewBox([x, y]) {
  return [(x - minX) * scale, (maxY - y) * scale];
}

const round = (n) => Math.round(n * 10) / 10;

const shapes = wards.map((ward) => {
  const rings = ward.rings
    .map((ring) => simplify(ring.map(toViewBox), TOLERANCE))
    // A ring simplified below a triangle no longer encloses anything; islands
    // and river slivers land here and are dropped rather than drawn as spikes.
    .filter((ring) => ring.length >= 4);

  const d = rings
    .map(
      (ring) =>
        `M${ring
          .map(([x, y]) => `${round(x)} ${round(y)}`)
          .join("L")}Z`,
    )
    .join("");

  // Area-weighted centroid over the largest ring — good enough to hang a label.
  const largest = rings.reduce(
    (best, ring) => (ring.length > best.length ? ring : best),
    rings[0] ?? [],
  );
  const cx = round(largest.reduce((sum, p) => sum + p[0], 0) / largest.length);
  const cy = round(largest.reduce((sum, p) => sum + p[1], 0) / largest.length);

  return { n: String(ward.number).padStart(2, "0"), name: ward.name, d, cx, cy };
});

const file = `// AUTO-GENERATED — do not edit by hand.
// ${city} council ward boundaries, projected (spherical Mercator, fitted to the
// viewBox) and simplified (Douglas–Peucker) for a compact locator map.
${source ? `// Source: ${source}\n` : ""}// Regenerate with scripts/gen-ward-geo.mjs — see that file for the command.

import type { WardGeo, WardShape } from "@/components/elections/WardMap";

export const WARD_MAP_VIEWBOX = "0 0 ${WIDTH} ${height}";

export const WARD_SHAPES: WardShape[] = ${JSON.stringify(shapes, null, 2)};

/** Everything <WardMap> needs to draw ${city}. The id namespaces the shared
 *  <defs> geometry, so it must be unique across regions. */
export const WARD_GEO: WardGeo = {
  id: "${city.toLowerCase()}-ward-map",
  viewBox: WARD_MAP_VIEWBOX,
  shapes: WARD_SHAPES,
  regionLabel: "City of ${city}",
};
`;

writeFileSync(out, file);

const bytes = Buffer.byteLength(file);
console.log(
  `${out}: ${shapes.length} wards, viewBox 0 0 ${WIDTH} ${height}, ${(bytes / 1024).toFixed(1)} KB`,
);
