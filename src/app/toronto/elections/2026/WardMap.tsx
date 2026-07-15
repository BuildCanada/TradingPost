import { WARD_SHAPES, WARD_MAP_VIEWBOX } from "./wardGeo";

const BASE_ID = "toronto-ward-map-base";

/**
 * Defines the full 25-ward Toronto map once as a reusable <g>. Render this
 * a single time on the page; each WardMap references it via <use> so the
 * geometry is not duplicated per card.
 */
export function WardMapDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" className="absolute">
      <defs>
        <g id={BASE_ID}>
          {WARD_SHAPES.map((w) => (
            <path
              key={w.n}
              d={w.d}
              fill="#efe4da"
              stroke="#cdc4bd"
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
 * A compact locator map of Toronto with `activeWard` filled in the accent
 * colour. Requires <WardMapDefs /> to be present once on the page.
 */
export function WardMap({
  activeWard,
  className,
}: {
  activeWard: string;
  className?: string;
}) {
  const active = WARD_SHAPES.find((w) => w.n === activeWard);

  return (
    <svg
      viewBox={WARD_MAP_VIEWBOX}
      className={className}
      role="img"
      aria-label={`Location of ward ${activeWard} within the City of Toronto`}
    >
      <use href={`#${BASE_ID}`} />
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
