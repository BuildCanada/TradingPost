'use client'

/* One question's answers as a pie.
 *
 * The sibling of OptionBar, drawing the same data in the same hues: a slice an
 * option, sized by how many candidates gave it. Same handlers, so whatever the
 * bar was wired into a pie drops into.
 *
 * WHAT A PIE COSTS HERE, SO THE NEXT READER KNOWS
 *   A hundred-per-cent bar and a pie encode the same numbers, and the bar is
 *   the better of the two for this page: the questions run thirty-three cards
 *   deep and the reader's work is comparing one split against another, which
 *   is a comparison of aligned lengths on a bar and a comparison of angles
 *   across separate circles on a pie. Most of these questions are also an
 *   ordered scale — yes, yes-with-conditions, no — which a bar keeps in order
 *   along its length and a pie only keeps by convention.
 *
 *   It is here because it was asked for, and because a pie does one thing
 *   better: a single card read on its own says "most of the field" without
 *   the reader measuring anything.
 *
 * SLICES ARE SEPARATED BY THE SURFACE, NOT BY A LINE
 *   Each slice is stroked in the page's own background at two pixels, so the
 *   gap between two fills is the card showing through rather than a border
 *   drawn over them. A hairline in some third colour would read as a fifth
 *   thing on a chart that has at most four.
 */

export interface OptionPieProps {
  /** The options exactly as they were offered — used for the description. */
  options: string[]
  /** How many gave each option. Zero-count options are not drawn. */
  counts: number[]
  /** One colour an option, by position. */
  colors: string[]
  /** The option being shown, which keeps its fill while the rest recede. */
  highlight?: number | null
  onSegmentEnter?: (index: number) => void
  onSegmentLeave?: () => void
  /** The question, for the accessible description. */
  label?: string
  /** Drawn size in pixels. The viewBox is unit-square, so this only sets how
   *  much room it takes. */
  size?: number
  className?: string
}

/* Unit circle in a 100-box, inset by the stroke so the outer edge is not
   shaved by its own two pixels. */
const R = 49
const CX = 50
const CY = 50

/** A slice from `start` to `end`, in turns clockwise from twelve o'clock. */
function slicePath(start: number, end: number): string {
  const point = (turn: number) => {
    const angle = (turn - 0.25) * 2 * Math.PI
    return [CX + R * Math.cos(angle), CY + R * Math.sin(angle)] as const
  }
  const [x1, y1] = point(start)
  const [x2, y2] = point(end)
  const large = end - start > 0.5 ? 1 : 0
  return `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`
}

export function OptionPie({
  options,
  counts,
  colors,
  highlight = null,
  onSegmentEnter,
  onSegmentLeave,
  label,
  size = 148,
  className,
}: OptionPieProps) {
  const total = counts.reduce((sum, n) => sum + n, 0)
  if (total <= 0) return null

  /* Each slice starts where everything before it ended, so they sit in the
     options' own order — which for the ordered questions is the scale's order.
     Summed per slice rather than carried in a running variable: there are
     never more than four, and a value reassigned during a render is the one
     thing the compiler will not have. */
  const slices = counts.map((count, index) => {
    const before = counts
      .slice(0, index)
      .reduce((sum, n) => sum + n, 0)
    const start = before / total
    return { index, count, start, end: start + count / total }
  })

  const drawn = slices.filter((slice) => slice.count > 0)
  /* One option took everything: an arc of a full turn has the same two end
     points and renders as nothing, so it is a circle instead. */
  const whole = drawn.length === 1 ? drawn[0] : null

  const described = options
    .map((option, i) => (counts[i] > 0 ? `${option}: ${counts[i]}` : null))
    .filter(Boolean)
    .join('; ')

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={label ? `${label} — ${described}` : described}
      onMouseLeave={onSegmentLeave}
    >
      {whole ? (
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill={colors[whole.index]}
          stroke="var(--color-bg)"
          strokeWidth={2}
          onMouseEnter={() => onSegmentEnter?.(whole.index)}
        />
      ) : (
        drawn.map((slice) => (
          <path
            key={slice.index}
            d={slicePath(slice.start, slice.end)}
            fill={colors[slice.index]}
            stroke="var(--color-bg)"
            strokeWidth={2}
            strokeLinejoin="round"
            /* The same recession the legend uses, so pointing at a row and
               pointing at a slice do the same thing to the card. */
            opacity={
              highlight === null || highlight === slice.index ? 1 : 0.45
            }
            style={{ transition: 'opacity 150ms' }}
            onMouseEnter={() => onSegmentEnter?.(slice.index)}
          />
        ))
      )}
    </svg>
  )
}
