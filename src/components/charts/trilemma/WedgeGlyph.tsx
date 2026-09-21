import { arc as d3arc } from 'd3-shape'
import { TOKENS } from './theme'
import type { ThemeName } from './types'

/**
 * Key glyph: the same circle as the dial, with one option's slice filled — so
 * a list of options reads directly onto the chart beside it.
 *
 * Slice `index` is centred on the same angle as wedge `index`, because the
 * dial centres its first wedge at twelve o'clock rather than starting there.
 */
export function WedgeGlyph({
  index,
  count,
  color,
  size = 15,
  theme = 'light',
}: {
  index: number
  /** how many options the question offered — the number of slices */
  count: number
  /** fill for this slice; callers mute it for an option that was not chosen */
  color: string
  size?: number
  theme?: ThemeName
}) {
  const r = size / 2
  const span = (Math.PI * 2) / count
  const start = index * span - span / 2
  const path =
    d3arc()({
      innerRadius: 0,
      outerRadius: r,
      startAngle: start,
      endAngle: start + span,
    } as never) ?? ''

  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-r} ${-r} ${size} ${size}`}
      style={{ flex: '0 0 auto' }}
      aria-hidden
    >
      <circle r={r - 0.5} fill="none" stroke={TOKENS[theme].grid} strokeWidth={1} />
      <path d={path} fill={color} />
    </svg>
  )
}
