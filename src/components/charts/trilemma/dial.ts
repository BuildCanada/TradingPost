import { arc as d3arc } from 'd3-shape'
import { wrapLabel } from './wrap'
import type { AxisConfig, Triple } from './types'

/** Wedge `i` is centred on -90° + i*120°, so axis 0 always points straight up. */
export const WEDGE_SPAN = (Math.PI * 2) / 3

export function wedgeAngles(i: number, rotation = 0) {
  const centre = -Math.PI / 2 + i * WEDGE_SPAN + rotation
  return { centre, start: centre - WEDGE_SPAN / 2, end: centre + WEDGE_SPAN / 2 }
}

/** Point on the wedge bisector at radius r, in SVG coordinates. */
export function bisectorPoint(i: number, r: number, rotation = 0) {
  const { centre } = wedgeAngles(i, rotation)
  return { x: Math.cos(centre) * r, y: Math.sin(centre) * r }
}

/**
 * d3-shape's arc() measures angles from 12 o'clock, clockwise, whereas the
 * trig above is the usual maths convention. The quarter turn reconciles them.
 */
const toArcAngle = (a: number) => a + Math.PI / 2

export function wedgePath(
  i: number,
  inner: number,
  outer: number,
  rotation = 0,
  padAngle = 0,
  cornerRadius = 0,
) {
  const { start, end } = wedgeAngles(i, rotation)
  const builder = d3arc().cornerRadius(cornerRadius)
  return (
    builder({
      innerRadius: Math.max(0, inner),
      outerRadius: Math.max(0, outer),
      startAngle: toArcAngle(start),
      endAngle: toArcAngle(end),
      padAngle,
      padRadius: Math.max(outer, 1),
    } as never) ?? ''
  )
}

/** Straight-sided kite through the three value points — the shape of the trade-off. */
export function kitePath(radii: Triple<number>, rotation = 0) {
  return (
    radii
      .map((r, i) => {
        const p = bisectorPoint(i, r, rotation)
        return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`
      })
      .join('') + 'Z'
  )
}

export function cornerRadiusFor(outer: number) {
  return Math.min(6, outer * 0.06)
}


/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export const GOAL_WRAP = 12
const COS30 = Math.cos(Math.PI / 6)

export interface DialLayoutInput {
  width: number
  height: number
  padding: number
  axes: Triple<AxisConfig>
  showGoalLabels: boolean
  showValues: boolean
  hasLabel: boolean
}

export interface DialLayout {
  R: number
  /** Hang the two lower goal labels centred under the rim rather than beside it. */
  centreLabels: boolean
  topStack: number
  bottomStack: number
  captionY: number
}

/**
 * Sizes the dial around whatever labels are switched on. The apex label stacks
 * straight up from the rim; the two lower ones hang off the bisector points,
 * which sit at half the radius, so they cost far less vertical room than they
 * appear to. Pass `forcedR` to make a set of dials share one radius — without
 * that, small multiples silently break their own shared scale.
 */
export function layoutDial(input: DialLayoutInput, forcedR?: number): DialLayout {
  const { width, height, padding, axes, showGoalLabels, showValues, hasLabel } = input

  const goalLines = Math.max(
    wrapLabel(axes[1].label, GOAL_WRAP).length,
    wrapLabel(axes[2].label, GOAL_WRAP).length,
  )
  const topLines = wrapLabel(axes[0].label, GOAL_WRAP).length
  const valueLine = showValues ? 14 : 0
  const topStack = showGoalLabels ? 16 + topLines * 14 + valueLine : 6
  const bottomStack = showGoalLabels ? 22 + goalLines * 14 + valueLine : 6
  const captionRoom = hasLabel ? 32 : 0
  const sideText = showGoalLabels
    ? Math.max(
        ...[1, 2].flatMap((i) => wrapLabel(axes[i].label, GOAL_WRAP).map((l) => l.length)),
      ) * 6.6 + 10
    : 0

  const halfBox = Math.min(width, height) / 2 - padding
  const halfW = width / 2 - padding
  const vertical = Math.min(halfBox - topStack, 2 * (halfBox - bottomStack - captionRoom))

  // Beside the rim reads best but costs a full text width of side room;
  // centring on the bisector costs half that, and only works while the two
  // lower labels still clear each other.
  const beside = Math.min(vertical, (halfW - sideText - 13) / COS30)
  const centredMax = Math.min(vertical, (halfW - sideText / 2) / COS30)
  const centredMin = (sideText / 2 + 8) / COS30

  const R = Math.max(20, forcedR ?? (showGoalLabels && centredMax >= centredMin && centredMax > beside * 1.1
    ? centredMax
    : beside))

  const centreLabels =
    showGoalLabels &&
    (forcedR === undefined
      ? R === centredMax && centredMax > beside * 1.1
      : // At a shared radius, centre only when the label will not otherwise fit.
        R * COS30 + 13 + sideText > halfW && R * COS30 >= sideText / 2 + 8)

  return { R, centreLabels, topStack, bottomStack, captionY: Math.max(R + 24, R / 2 + bottomStack + 20) }
}
