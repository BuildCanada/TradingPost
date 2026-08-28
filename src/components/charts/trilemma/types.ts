/** The three corners, always in clockwise order starting at the apex. */
export type Corner = 0 | 1 | 2
export type Triple<T> = [T, T, T]

export interface AxisConfig {
  /** Key used to look up the value on each datum. */
  key: string
  /** Corner label, e.g. "Affordable". */
  label: string
  /** Optional second line under the corner label. */
  sublabel?: string
  /** Overrides the palette colour for this corner. */
  color?: string
}

export type ThemeName = 'light' | 'dark'
