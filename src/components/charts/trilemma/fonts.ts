import { BODY, DISPLAY, LABEL } from './theme'

/**
 * The three brand roles a chart actually needs:
 *
 *   display  names — titles, corner labels, series and point labels
 *   body     prose — subtitles, sublabels, notes, annotations
 *   label    figures — ticks, counts, tabular numbers (uppercase eyebrows too)
 */
export interface Fonts {
  display: string
  body: string
  label: string
}

export const BRAND_FONTS: Fonts = { display: DISPLAY, body: BODY, label: LABEL }

/** A single `fontFamily` override collapses all three roles onto one family. */
export function resolveFonts(override?: string): Fonts {
  return override ? { display: override, body: override, label: override } : BRAND_FONTS
}
