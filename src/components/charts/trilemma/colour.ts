import { lab } from 'd3-color'
import type { Triple } from './types'

/** Weighted mix of the three corner colours — the signature "where does this sit" fill. */
export function blendCorners(colors: Triple<string>, t: Triple<number>, gamma = 1.6): string {
  const w = t.map((v) => Math.pow(Math.max(0, v), gamma))
  const sum = w[0] + w[1] + w[2] || 1
  let l = 0
  let a = 0
  let b = 0
  for (let i = 0; i < 3; i++) {
    const c = lab(colors[i])
    const k = w[i] / sum
    l += c.l * k
    a += c.a * k
    b += c.b * k
  }
  // Averaging in Lab pulls mixtures toward grey; nudge the chroma back up so a
  // three-way compromise still reads as a colour.
  const boost = 1.25
  return lab(l, a * boost, b * boost).formatHex()
}
