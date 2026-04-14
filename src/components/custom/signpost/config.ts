export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface TocItem {
  heading: Heading;
  children: Heading[];
}

export interface SignpostProps {
  headings: Heading[];
}

export const COL = 24;
export const DOT = 11;
export const DIAMOND = 5;
export const RECT_W = 17;
