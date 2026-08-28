'use client'

import { useMemo, useState } from 'react'
import { scaleLinear, scaleSqrt } from 'd3-scale'
import { lab } from 'd3-color'
import { format } from 'd3-format'
import { GOAL_WRAP, bisectorPoint, kitePath, layoutDial, wedgeAngles, wedgePath } from './dial'
import { blendCorners } from './colour'
import { CORNER_COLORS, TOKENS } from './theme'
import { resolveFonts } from './fonts'
import { useMeasure } from './useMeasure'
import { wrapLabel } from './wrap'
import type { AxisConfig, ThemeName, Triple } from './types'

export type DialValues = Record<string, number> | Triple<number>

export interface TrilemmaDialProps {
  /** One entity's three scores. */
  values: DialValues
  axes: Triple<AxisConfig>
  /** Name of the entity, shown in the middle of the dial. */
  label?: string
  /** Second line under the centre label. */
  sublabel?: string
  /** `auto` puts the name in the hub when it fits there, otherwise underneath. */
  labelPlacement?: 'auto' | 'centre' | 'below'

  /** A benchmark drawn as an outline behind the wedges. */
  reference?: DialValues
  referenceLabel?: string

  /* ---- scale ---- */
  /** Value range mapped to radius. Defaults to [0, max of the data]. */
  domain?: [number, number]
  /** `sqrt` makes wedge *area* proportional to value; `linear` makes radius. */
  scale?: 'sqrt' | 'linear'
  /** Degrees of extra rotation. 0 puts axes[0] straight up. */
  rotation?: number

  /* ---- layout ---- */
  width?: number
  height?: number
  responsive?: boolean
  padding?: number
  /** Donut hole, as a fraction of the outer radius. */
  innerRadius?: number
  /**
   * Force the outer radius instead of deriving it from the labels. Small
   * multiples must share one, or their shared value scale is a fiction.
   */
  radiusOverride?: number
  /** Gap between wedges, in degrees. */
  gap?: number
  cornerRadius?: number

  /* ---- layers ---- */
  showTrack?: boolean
  showRings?: boolean
  ringStep?: number
  showRingLabels?: boolean
  showKite?: boolean
  showGoalLabels?: boolean
  valueMode?: 'none' | 'inside' | 'outside'
  valueFormat?: (n: number) => string

  /* ---- chrome ---- */
  colorBy?: 'corner' | 'single'
  color?: string
  cornerColors?: Triple<string>
  theme?: ThemeName
  /**
   * The paper this dial sits on. Defaults to the chart theme's own, which is
   * right for a standalone figure and wrong inside a page that paints its own
   * background — pass that page's colour there, e.g. `var(--color-bg)`.
   *
   * Sets the wedge outlines as well as the fill behind them: those outlines
   * exist to read as gaps cut out of the paper, so a colour that is merely
   * close leaves a pale hairline around every wedge.
   */
  paper?: string
  fontFamily?: string
  animate?: boolean
  interactive?: boolean
  onHover?: (corner: number | null) => void

  title?: string
  subtitle?: string
  note?: string
  source?: string
  className?: string
}

const readTriple = (v: DialValues, axes: Triple<AxisConfig>): Triple<number> =>
  Array.isArray(v)
    ? [v[0], v[1], v[2]]
    : [v[axes[0].key] ?? 0, v[axes[1].key] ?? 0, v[axes[2].key] ?? 0]

const defaultFormat = format(',.0f')

/**
 * The trilemma as a dial: one 120° wedge per goal, the first pointing straight
 * up, each wedge reaching out as far as that goal scores. A circle filled to
 * the rim would be all three at once — the point is that none of them is.
 */
export function TrilemmaDial(props: TrilemmaDialProps) {
  const {
    values,
    axes,
    label,
    sublabel,
    labelPlacement = 'auto',
    reference,
    referenceLabel = 'Benchmark',
    domain,
    scale = 'sqrt',
    rotation = 0,
    width: widthProp = 340,
    height: heightProp,
    responsive = false,
    padding = 8,
    innerRadius = 0.18,
    radiusOverride,
    gap = 1.5,
    cornerRadius = 3,
    showTrack = true,
    showRings = true,
    ringStep = 0.25,
    showRingLabels = false,
    showKite = false,
    showGoalLabels = true,
    valueMode = 'outside',
    valueFormat = defaultFormat,
    colorBy = 'corner',
    color,
    cornerColors: cornerColorsProp,
    theme = 'light',
    paper,
    fontFamily,
    animate = true,
    interactive = true,
    onHover,
    title,
    subtitle,
    note,
    source,
    className,
  } = props

  const tokens = TOKENS[theme]
  const fonts = resolveFonts(fontFamily)
  const cornerColors: Triple<string> = cornerColorsProp ?? [
    axes[0].color ?? CORNER_COLORS[theme][0],
    axes[1].color ?? CORNER_COLORS[theme][1],
    axes[2].color ?? CORNER_COLORS[theme][2],
  ]

  const { ref, width: measured } = useMeasure<HTMLDivElement>(responsive)
  const width = responsive ? measured || widthProp : widthProp
  const height = heightProp ?? width

  const [hovered, setHovered] = useState<number | null>(null)

  const v = useMemo(() => readTriple(values, axes), [values, axes])
  const refV = useMemo(() => (reference ? readTriple(reference, axes) : null), [reference, axes])
  const rot = (rotation * Math.PI) / 180

  /**
   * Room outside the rim. The two lower goal labels are the tall ones — they
   * wrap, and a caption underneath has to clear whatever they take.
   */
  const { R, centreLabels, captionY } = layoutDial(
    {
      width,
      height,
      padding,
      axes,
      showGoalLabels,
      showValues: valueMode === 'outside',
      hasLabel: !!label,
    },
    radiusOverride,
  )
  const cx = width / 2
  const cy = height / 2

  const hi = domain?.[1] ?? Math.max(...v, ...(refV ?? [0]), 1)
  const lo = domain?.[0] ?? 0
  const radius = useMemo(() => {
    const s = scale === 'sqrt' ? scaleSqrt() : scaleLinear()
    return s.domain([lo, hi]).range([innerRadius * R, R]).clamp(true)
  }, [scale, lo, hi, innerRadius, R])

  const radii = v.map((x) => radius(x)) as Triple<number>
  const refRadii = refV ? (refV.map((x) => radius(x)) as Triple<number>) : null
  const padAngle = (gap * Math.PI) / 180
  const inner = innerRadius * R
  const fillFor = (i: number) => (colorBy === 'single' ? color ?? blendCorners(cornerColors, [1, 1, 1]) : cornerColors[i])

  // The centre label lives in the donut hole when it fits; a long name gets a
  // caption under the dial instead of a disc that eats the wedges.
  const labelFont = 13
  const labelWidth = Math.max(
    (label?.length ?? 0) * labelFont * 0.58,
    (sublabel?.length ?? 0) * 9.5 * 0.52,
  )
  const discR = Math.max(inner, labelWidth / 2 + 7)
  const labelBelow =
    !!label && (labelPlacement === 'below' || (labelPlacement === 'auto' && discR > R * 0.42))

  /**
   * Everything that has to read as the page behind the chart: the fill under
   * the wedges, the outlines that make the gaps between them, the donut hole,
   * and the knockout behind a label sitting over a wedge. One colour, because
   * they are all the same surface — `bg` and `halo` are the same value in both
   * themes, and splitting them here only invites them to drift apart.
   */
  const paperColor = paper ?? tokens.bg
  const halo = paperColor
  const onWedge = (i: number) => (lab(cornerColors[i]).l > 62 ? tokens.ink : halo)

  const rings: number[] = []
  if (showRings) for (let t = ringStep; t <= 1.0001; t += ringStep) rings.push(lo + (hi - lo) * t)

  return (
    <div
      ref={ref}
      className={className}
      style={{
        background: paperColor,
        width: responsive ? '100%' : width,
        maxWidth: '100%',
      }}
    >
      {(title || subtitle) && (
        <header style={{ marginBottom: 6 }}>
          {title && <h2 style={{ font: `500 20px/1.2 ${fonts.display}`, color: tokens.ink, margin: '0 0 4px' }}>{title}</h2>}
          {subtitle && (
            <p style={{ font: `400 15px/1.4 ${fonts.body}`, color: tokens.inkSoft, margin: 0, maxWidth: 560 }}>{subtitle}</p>
          )}
        </header>
      )}

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}
        role="img"
        aria-label={`${label ?? 'Trilemma'}: ${axes.map((a, i) => `${a.label} ${valueFormat(v[i])}`).join(', ')}`}
        onMouseLeave={() => {
          setHovered(null)
          onHover?.(null)
        }}
      >
        <g transform={`translate(${cx},${cy})`}>
          {showTrack &&
            axes.map((_, i) => (
              <path
                key={`track-${i}`}
                d={wedgePath(i, inner, R, rot, padAngle, cornerRadius)}
                fill={tokens.ink}
                opacity={0.045}
              />
            ))}

          {axes.map((ax, i) => {
            const dim = hovered !== null && hovered !== i
            return (
              <path
                key={`wedge-${i}`}
                d={wedgePath(i, inner, radii[i], rot, padAngle, cornerRadius)}
                fill={fillFor(i)}
                fillOpacity={dim ? 0.35 : 0.85}
                stroke={halo}
                strokeWidth={0.75}
                style={{
                  transition: animate ? 'd 500ms cubic-bezier(.4,.1,.2,1), fill-opacity 180ms' : undefined,
                  cursor: interactive ? 'pointer' : 'default',
                }}
                tabIndex={interactive ? 0 : undefined}
                aria-label={`${ax.label}: ${valueFormat(v[i])}`}
                onMouseEnter={
                  interactive
                    ? () => {
                      setHovered(i)
                      onHover?.(i)
                    }
                    : undefined
                }
                onFocus={interactive ? () => setHovered(i) : undefined}
                onBlur={interactive ? () => setHovered(null) : undefined}
              />
            )
          })}

          {/* Rings and the benchmark sit above the fills, so they stay readable
              wherever a wedge happens to reach. */}
          {showRings &&
            rings.map((val, i) => (
              <circle
                key={`ring-${i}`}
                r={radius(val)}
                fill="none"
                stroke={i === rings.length - 1 ? tokens.grid : halo}
                strokeOpacity={i === rings.length - 1 ? 1 : 0.35}
                strokeWidth={1}
                strokeDasharray={i === rings.length - 1 ? undefined : '2 4'}
              />
            ))}

          {refRadii &&
            axes.map((_, i) => (
              <path
                key={`ref-${i}`}
                d={wedgePath(i, inner, refRadii[i], rot, padAngle, cornerRadius)}
                fill="none"
                stroke={tokens.inkSoft}
                strokeOpacity={0.85}
                strokeWidth={1}
                strokeDasharray="3 2.5"
              />
            ))}

          {showKite && (
            <path
              d={kitePath(radii, rot)}
              fill="none"
              stroke={tokens.ink}
              strokeWidth={1.25}
              strokeOpacity={0.55}
              strokeLinejoin="round"
              style={{ transition: animate ? 'd 500ms cubic-bezier(.4,.1,.2,1)' : undefined }}
            />
          )}

          {/* Wedge dividers, drawn over the fills so the thirds stay legible. */}
          {axes.map((_, i) => {
            const a = wedgeAngles(i, rot).start
            return (
              <line
                key={`div-${i}`}
                x1={Math.cos(a) * inner}
                y1={Math.sin(a) * inner}
                x2={Math.cos(a) * R}
                y2={Math.sin(a) * R}
                stroke={paperColor}
                strokeWidth={1}
                opacity={0.6}
              />
            )
          })}

          {/* Ring labels run down the wedge boundary at 6 o'clock — the one
              radius that never crosses a fill. */}
          {showRingLabels &&
            rings.map((val, i) => (
              <text
                key={`rl-${i}`}
                x={0}
                y={radius(val)}
                dy="-4"
                textAnchor="middle"
                fontFamily={fonts.label}
                fontSize={9}
                fill={tokens.inkFaint}
                stroke={paperColor}
                strokeWidth={2.5}
                paintOrder="stroke"
              >
                {valueFormat(val)}
              </text>
            ))}

          {label && !labelBelow && (
            <g>
              <circle r={discR} fill={paperColor} />
              <text
                y={sublabel ? -2 : 3}
                textAnchor="middle"
                fontFamily={fonts.display}
                fontSize={labelFont}
                fontWeight={500}
                fill={tokens.ink}
              >
                {label}
              </text>
              {sublabel && (
                <text y={12} textAnchor="middle" fontFamily={fonts.body} fontSize={10.5} fill={tokens.inkFaint}>
                  {sublabel}
                </text>
              )}
            </g>
          )}

          {label && labelBelow && (
            <g>
              <circle r={inner} fill={paperColor} />
              <text
                y={captionY}
                textAnchor="middle"
                fontFamily={fonts.display}
                fontSize={14}
                fontWeight={500}
                fill={tokens.ink}
              >
                {label}
              </text>
              {sublabel && (
                <text y={captionY + 14} textAnchor="middle" fontFamily={fonts.body} fontSize={11} fill={tokens.inkFaint}>
                  {sublabel}
                </text>
              )}
            </g>
          )}

          {showGoalLabels &&
            axes.map((ax, i) => {
              const p = bisectorPoint(i, R + (centreLabels ? 20 : 13), rot)
              const anchor = centreLabels || Math.abs(p.x) < 6 ? 'middle' : p.x > 0 ? 'start' : 'end'
              const lines = wrapLabel(ax.label, GOAL_WRAP)
              const up = p.y < -6
              const baseY = p.y + (up ? -(lines.length - 1) * 14 : centreLabels ? 8 : 4)
              return (
                <g key={`goal-${i}`} opacity={hovered !== null && hovered !== i ? 0.4 : 1}>
                  {lines.map((ln, li) => (
                    <text
                      key={li}
                      x={p.x}
                      y={baseY + li * 14}
                      textAnchor={anchor}
                      fontFamily={fonts.display}
                      fontSize={12.5}
                      fontWeight={500}
                      fill={tokens.ink}
                      stroke={paperColor}
                      strokeWidth={3}
                      paintOrder="stroke"
                    >
                      {ln}
                    </text>
                  ))}
                  {valueMode === 'outside' && (
                    <text
                      x={p.x}
                      y={baseY + lines.length * 14 + 1}
                      textAnchor={anchor}
                      fontFamily={fonts.label}
                      fontSize={12}
                      fill={cornerColors[i]}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {valueFormat(v[i])}
                    </text>
                  )}
                </g>
              )
            })}

          {valueMode === 'inside' &&
            axes.map((_, i) => {
              const p = bisectorPoint(i, Math.max(inner + 16, radii[i] - 16), rot)
              return (
                <text
                  key={`val-${i}`}
                  x={p.x}
                  y={p.y}
                  dy="0.32em"
                  textAnchor="middle"
                  fontFamily={fonts.label}
                  fontSize={12}
                  fontWeight={500}
                  fill={onWedge(i)}
                  stroke={onWedge(i) === tokens.ink ? halo : cornerColors[i]}
                  strokeWidth={2.5}
                  paintOrder="stroke"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {valueFormat(v[i])}
                </text>
              )
            })}
        </g>
      </svg>

      {(note || source || refRadii) && (
        <footer style={{ marginTop: 6, maxWidth: 560 }}>
          {refRadii && (
            <p style={{ font: `400 12px/1.5 ${fonts.body}`, color: tokens.inkFaint, margin: '0 0 2px' }}>
              Dashed outline: {referenceLabel}
            </p>
          )}
          {note && <p style={{ font: `400 13px/1.5 ${fonts.body}`, color: tokens.inkSoft, margin: '0 0 3px' }}>{note}</p>}
          {source && <p style={{ font: `400 12px/1.5 ${fonts.body}`, color: tokens.inkFaint, margin: 0 }}>{source}</p>}
        </footer>
      )}
    </div>
  )
}
