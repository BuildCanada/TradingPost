/* A compact locator map: the whole city in outline, with one ward filled in.

   Regions that have ward geometry (see scripts/gen-ward-geo.mjs) supply their
   own WARD_SHAPES and viewBox; regions that don't simply pass no map and the
   ward tiles lay out without one.

   The city outline is defined once per page as a reusable <g> and referenced
   by every card via <use>, so 25 ward tiles ship one copy of the geometry
   rather than 25. `id` namespaces that definition per region — two cities'
   maps on one page would otherwise collide on the same element id. */

export type WardShape = {
  /** zero-padded ward number, e.g. "01" */
  n: string;
  /** the city's own ward name */
  name: string;
  /** SVG path in the region's WARD_MAP_VIEWBOX coordinate space */
  d: string;
  /** projected centroid */
  cx: number;
  cy: number;
};

export type WardGeo = {
  id: string;
  viewBox: string;
  shapes: WardShape[];
  /** e.g. "City of Ottawa" — used in the map's accessible label */
  regionLabel: string;
};

/**
 * Defines a region's full city outline once as a reusable <g>. Render this a
 * single time on any page that uses <WardMap>.
 */
export function WardMapDefs({ geo }: { geo: WardGeo }) {
  return (
    <svg width="0" height="0" aria-hidden="true" className="absolute">
      <defs>
        <g id={geo.id}>
          {geo.shapes.map((w) => (
            <path
              key={w.n}
              d={w.d}
              fill="#f2f6fb"
              stroke="#c7d7e8"
              strokeWidth={0.5}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      </defs>
    </svg>
  );
}

/**
 * The city with `activeWard` filled in the accent colour. Requires
 * <WardMapDefs geo={…} /> to be present once on the page with the same geo.
 */
export function WardMap({
  geo,
  activeWard,
  className,
}: {
  geo: WardGeo;
  activeWard: string;
  className?: string;
}) {
  const active = geo.shapes.find((w) => w.n === activeWard);

  return (
    <svg
      viewBox={geo.viewBox}
      className={className}
      role="img"
      aria-label={`Location of ward ${activeWard} within the ${geo.regionLabel}`}
    >
      <use href={`#${geo.id}`} />
      {active && (
        <path
          d={active.d}
          className="fill-accent stroke-accent"
          strokeWidth={0.5}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
