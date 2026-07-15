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
  shareTitle?: string;
  shareUrl?: string;
  // Pages with an extra sticky bar below the global navbar (e.g. the
  // state-of-the-nation section nav) push the rail and scroll target down,
  // and may already have their own narrow-screen navigation.
  desktopTopClass?: string;
  scrollOffset?: number;
  showMobileBar?: boolean;
  showTopBorder?: boolean;
}

export const COL = 24;
export const DOT = 11;
export const DIAMOND = 5;
export const RECT_W = 17;
