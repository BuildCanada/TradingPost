'use client'

import { resolveFonts } from './fonts'
import { MUTED, palette } from './palette'
import { TOKENS } from './theme'
import { useMeasure } from './useMeasure'
import type { ThemeName } from './types'

export interface OptionBarProps {
  /** The options exactly as they were offered. */
  options: string[]
  /** How many chose each option, in the same order. */
  counts: number[]

  /**
   * Index of the one option to keep in colour; every other option fades to
   * neutral. Use it to show one respondent's pick against the field.
   */
  highlight?: number | null

  /* ---- layout ---- */
  width?: number
  height?: number
  /** Fill the parent width and re-render on resize. */
  responsive?: boolean

  /* ---- layers ---- */
  /** Counts printed inside each segment, where the segment is wide enough. */
  showCounts?: boolean

  /* ---- chrome ---- */
  colors?: string[]
  theme?: ThemeName
  fontFamily?: string
  /** Accessible name for the bar — normally the question itself. */
  label?: string
  className?: string
}

/**
 * A segmented bar: one question's answers as a single 100% band.
 *
 * The companion to `TrilemmaDial` for questions a trilemma cannot describe —
 * a two-option Yes/No, or a four-way split. Colours come from the same corner
 * ramps the dial uses, so the two charts sit together on a page.
 */
export function OptionBar({
  options,
  counts,
  highlight = null,
  width: widthProp = 230,
  height = 34,
  responsive = false,
  showCounts = true,
  colors: colorsProp,
  theme = 'light',
  fontFamily,
  label,
  className,
}: OptionBarProps) {
  const tokens = TOKENS[theme]
  const fonts = resolveFonts(fontFamily)

  const { ref, width: measured } = useMeasure<HTMLDivElement>(responsive)
  const width = responsive ? measured || widthProp : widthProp

  const full = colorsProp ?? palette(options.length, theme)
  const colors = highlight === null ? full : full.map((c, i) => (i === highlight ? c : MUTED))

  const total = counts.reduce((a, b) => a + b, 0) || 1

  // Each segment's offset is the share of everything before it. Options number
  // two to four, so the repeated prefix sum costs nothing and stays immutable.
  const segments = counts.map((c, i) => {
    const before = counts.slice(0, i).reduce((a, b) => a + b, 0)
    return { i, x: (before / total) * width, w: (c / total) * width, count: c, color: colors[i] }
  })

  const aria = label ?? options.map((o, i) => `${o} ${counts[i]}`).join(', ')

  return (
    <div ref={ref} className={className} style={{ width: responsive ? '100%' : width, maxWidth: '100%' }}>
      <svg width={width} height={height} style={{ display: 'block' }} role="img" aria-label={aria}>
        {segments.map(({ i, x: sx, w, count, color }) => (
          <g key={i}>
            {/* A 1px bite out of each segment keeps the joins visible without a stroke. */}
            <rect x={sx} y={0} width={Math.max(0, w - 1)} height={height} fill={color} />
            {showCounts && w > 22 && (
              <text
                x={sx + w / 2}
                y={height / 2}
                dy="0.35em"
                textAnchor="middle"
                fontFamily={fonts.label}
                fontSize={12}
                fill={color === MUTED ? tokens.inkSoft : tokens.bg}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {count}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}
