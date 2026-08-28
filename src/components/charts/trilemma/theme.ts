import type { ThemeName, Triple } from './types'

/**
 * Build Canada brand tokens.
 *
 * Colours are the @buildcanada/colours ramps as applied in src/styles/colours.css;
 * type is the three-font system from src/styles/typography.css:
 *
 *   display  Söhne Kräftig        headlines, corner labels — institutional
 *   body     Financier Text       prose and figures — financial-press serif
 *   label    Founders Grotesk Mono  eyebrows, ticks, counts — uppercase, tabular
 */

/* ----------------------------------------------------------- type ---- */

export const DISPLAY = '"Soehne Kraftig", system-ui, -apple-system, sans-serif'
export const BODY = '"Financier Text", Georgia, "Times New Roman", serif'
export const LABEL = '"Founders Grotesk Mono", Menlo, monospace'

/** Kept as the chart-internal names: headings/corner labels vs. small UI text. */
export const SERIF = BODY
export const SANS = DISPLAY

/* -------------------------------------------------------- colours ---- */

const linen = { 50: '#fbf6f1', 100: '#f6ece3', 200: '#ead2be' }
const charcoal = {
  100: '#e7e7e7', 200: '#d1d1d1', 300: '#b0b0b0', 400: '#888888',
  500: '#6d6d6d', 600: '#5d5d5d', 700: '#4f4f4f', 900: '#3d3d3d',
  1000: '#272727', 1050: '#141414',
}
const auburn = { 400: '#e68383', 500: '#d85b5b', 600: '#c43e3e', 700: '#a43131' }
const lake = { 300: '#7cd3f1', 400: '#36bae9', 600: '#0880b5', 700: '#0a6a95' }
const pine = { 300: '#84cbaa', 400: '#48b183', 600: '#17794d', 700: '#15613f' }
const copper = { 400: '#ee8e70', 500: '#e26b42', 600: '#cf5a31' }
const steel = { 300: '#c2ccd6', 400: '#9eafc0', 600: '#627a8f', 700: '#516476' }
/** Warm neutral: the charts package uses these for gridlines and axis lines. */
const nickel = { 100: '#e5e4e2', 200: '#cbc9c4', 300: '#a9a79f', 400: '#8c8b81', 700: '#46463f', 800: '#3a3a35' }

export interface Tokens {
  bg: string
  ink: string
  inkSoft: string
  inkFaint: string
  frame: string
  grid: string
  panel: string
  panelBorder: string
  halo: string
  /** Brand red, for eyebrows and editorial accents. */
  accent: string
}

export const TOKENS: Record<ThemeName, Tokens> = {
  light: {
    bg: linen[50],
    ink: charcoal[1000],
    inkSoft: charcoal[700],
    inkFaint: charcoal[600],
    frame: charcoal[1000],
    grid: nickel[200],
    panel: 'rgba(251,246,241,0.97)',
    panelBorder: charcoal[200],
    halo: linen[50],
    accent: auburn[700],
  },
  dark: {
    bg: charcoal[1050],
    ink: linen[100],
    inkSoft: charcoal[300],
    inkFaint: charcoal[400],
    frame: nickel[200],
    grid: nickel[800],
    panel: 'rgba(39,39,39,0.97)',
    panelBorder: charcoal[700],
    halo: charcoal[1050],
    accent: auburn[500],
  },
}

/**
 * The three corner hues. Drawn from the brand ramps rather than the charts
 * package's categorical palette because a trilemma *mixes* its corners — the
 * three have to stay distinguishable when blended, which adjacent hues do not.
 */
export const CORNER_COLORS: Record<ThemeName, Triple<string>> = {
  light: [auburn[600], pine[600], lake[700]],
  dark: [auburn[400], pine[400], lake[400]],
}

/**
 * Categorical series colour. This is the palette the design system's charts
 * package sets for the build-canada theme (Grapher "Distinct lines"), which is
 * the right call for many-series charts.
 */
export const GROUP_PALETTE: Record<ThemeName, string[]> = {
  light: ['#4c6a9c', '#b13507', '#996d39', '#2c8465', '#6d3e91', '#883039', '#00295b', '#a2559c'],
  dark: ['#8ba4d4', '#e8814f', '#c9a26b', '#5cbb98', '#a684c9', '#c9737c', '#7d9cc9', '#c893c2'],
}

/** Reserved neutral for missing data; never assigned to a series. */
export const NO_DATA = nickel[300]

export { auburn, charcoal, copper, lake, linen, nickel, pine, steel }
