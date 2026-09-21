import { CORNER_COLORS, copper, nickel } from './theme'
import type { ThemeName } from './types'

/** Unchosen options fade to the design system's warm neutral. */
export const MUTED = nickel[200]

/**
 * Option colours for a question with `n` choices.
 *
 * Three-option questions get the trilemma corners; the two- and four-option
 * questions borrow from the same ramps so a page of mixed questions reads as
 * one set. Two options take corners 0 and 2 — the pair furthest apart in hue,
 * so Yes/No never reads as a gradient.
 */
export function palette(n: number, theme: ThemeName = 'light'): string[] {
  const corners = CORNER_COLORS[theme]
  if (n === 3) return [...corners]
  if (n === 2) return [corners[0], corners[2]]
  return [corners[0], corners[1], corners[2], theme === 'dark' ? copper[400] : copper[600]]
}
