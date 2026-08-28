'use client'

import { TrilemmaDial } from './TrilemmaDial'
import { layoutDial } from './dial'
import type { DialValues, TrilemmaDialProps } from './TrilemmaDial'
import { BODY, CORNER_COLORS, DISPLAY, TOKENS } from './theme'
import type { AxisConfig, Triple } from './types'

export interface DialDatum {
  id: string
  label: string
  sublabel?: string
  values: DialValues
  /**
   * Per-panel axes, for small multiples of *different* three-way choices —
   * one question per dial rather than one subject per dial.
   */
  axes?: Triple<AxisConfig>
}

export interface TrilemmaDialGroupProps
  extends Omit<TrilemmaDialProps, 'values' | 'label' | 'sublabel' | 'title' | 'subtitle'> {
  data: DialDatum[]
  axes: Triple<AxisConfig>
  title?: string
  subtitle?: string
  /** Per-dial size. */
  size?: number
  /** Sort the panels by one goal, so the small multiples tell a story. */
  sortBy?: number | 'none'
  columns?: number
  /**
   * Repeating three goal names on every panel is wasted ink. By default the
   * group prints them once, as a key.
   */
  goalLabels?: 'key' | 'each'
}

const readTriple = (v: DialValues, axes: Triple<AxisConfig>): Triple<number> =>
  Array.isArray(v)
    ? [v[0], v[1], v[2]]
    : [v[axes[0].key] ?? 0, v[axes[1].key] ?? 0, v[axes[2].key] ?? 0]

/**
 * Small multiples of the dial. Every panel shares one radius scale, which is
 * the only way the shapes are comparable across panels.
 */
export function TrilemmaDialGroup(props: TrilemmaDialGroupProps) {
  const {
    data, axes, title, subtitle, note, source,
    size = 250, sortBy = 'none', columns, domain, theme = 'light',
    cornerColors, ...dial
  } = props

  // When every panel asks a different question, a shared key would be a lie:
  // label each panel instead.
  const perPanelAxes = data.some((d) => d.axes)
  const goalLabels = props.goalLabels ?? (perPanelAxes ? 'each' : 'key')

  const colors: Triple<string> = cornerColors ?? [
    axes[0].color ?? CORNER_COLORS[theme][0],
    axes[1].color ?? CORNER_COLORS[theme][1],
    axes[2].color ?? CORNER_COLORS[theme][2],
  ]

  const tokens = TOKENS[theme]
  const shared: [number, number] =
    domain ?? [0, Math.max(1, ...data.flatMap((d) => readTriple(d.values, d.axes ?? axes)))]

  // One placement for the whole group, so the panels line up. Mirrors the
  // dial's own fit test: does the longest name fit in the hub at this size?
  const approxR = size / 2 - (props.padding ?? 8) - (goalLabels === 'each' ? 64 : 26)
  const longest = Math.max(
    ...data.map((d) => Math.max(d.label.length * 13, (d.sublabel?.length ?? 0) * 9.5)),
    0,
  ) * 0.58
  const labelPlacement =
    props.labelPlacement ?? (longest / 2 + 7 > approxR * 0.42 ? 'below' : 'centre')

  /**
   * One radius for the whole grid — the smallest any panel can manage with its
   * own labels. Otherwise a panel with short option names draws a bigger
   * circle and the shared value scale stops meaning anything.
   */
  const sharedRadius = Math.min(
    ...data.map(
      (d) =>
        layoutDial({
          width: size,
          height: props.height ?? size,
          padding: props.padding ?? 8,
          axes: d.axes ?? axes,
          showGoalLabels: goalLabels === 'each',
          showValues: (props.valueMode ?? 'outside') === 'outside',
          hasLabel: !!d.label,
        }).R,
    ),
  )

  const panels =
    sortBy === 'none'
      ? data
      : [...data].sort(
          (a, b) => readTriple(b.values, b.axes ?? axes)[sortBy] - readTriple(a.values, a.axes ?? axes)[sortBy],
        )

  return (
    <div style={{ background: tokens.bg }}>
      {title && <h2 style={{ font: `500 21px/1.2 ${DISPLAY}`, color: tokens.ink, margin: '0 0 4px' }}>{title}</h2>}
      {subtitle && (
        <p style={{ font: `400 13.5px/1.45 ${BODY}`, color: tokens.inkSoft, margin: '0 0 14px', maxWidth: 640 }}>
          {subtitle}
        </p>
      )}

      {goalLabels === 'key' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', margin: '0 0 12px' }}>
          {axes.map((a, i) => (
            <span key={a.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  background: colors[i],
                  // Echo the wedge: a third of a circle, pointing the same way.
                  clipPath: 'polygon(50% 50%, 0% 0%, 100% 0%)',
                }}
              />
              <span style={{ font: `500 12px/1 ${BODY}`, color: tokens.inkSoft }}>{a.label}</span>
            </span>
          ))}
          <span style={{ font: `400 11.5px/1 ${BODY}`, color: tokens.inkFaint }}>
            wedges clockwise from the top
          </span>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          // `columns` caps the row rather than forcing it: panels wrap instead of
          // overflowing when the page is narrower than columns x size.
          gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${size}px), ${size}px))`,
          maxWidth: columns ? columns * (size + 4) : undefined,
          justifyContent: 'start',
          gap: 4,
        }}
      >
        {panels.map((d) => (
          <TrilemmaDial
            key={d.id}
            {...dial}
            axes={d.axes ?? axes}
            theme={theme}
            values={d.values}
            label={d.label}
            labelPlacement={labelPlacement}
            radiusOverride={props.radiusOverride ?? sharedRadius}
            showGoalLabels={goalLabels === 'each'}
            cornerColors={colors}
            sublabel={d.sublabel}
            domain={shared}
            width={size}
          />
        ))}
      </div>

      {(note || source) && (
        <footer style={{ marginTop: 10, maxWidth: 640 }}>
          {note && <p style={{ font: `400 12px/1.5 ${BODY}`, color: tokens.inkSoft, margin: '0 0 3px' }}>{note}</p>}
          {source && <p style={{ font: `400 11px/1.5 ${BODY}`, color: tokens.inkFaint, margin: 0 }}>{source}</p>}
        </footer>
      )}
    </div>
  )
}
