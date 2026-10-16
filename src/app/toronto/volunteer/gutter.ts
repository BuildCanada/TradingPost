// Side padding for the Build the Vote pages. Backgrounds and rules run the
// full width of the frame, but on wide screens the padding grows so the
// content sits in a centred column about 1080px wide, like the original
// design. Below about 1200px the max() falls back to the usual md:px-14.
//
// Measured against the viewport rather than with percentages, so the left
// cell of a two-column section and a full-width section line up: a
// percentage would resolve against each grid cell's own width.

/** Both sides, for full-width blocks. */
export const GUTTER = "px-6 md:px-[max(3.5rem,calc((100vw_-_1100px)/2))]";

/** The left column of a two-column section. */
export const GUTTER_LEFT =
  "px-6 md:px-14 md:pl-[max(3.5rem,calc((100vw_-_1100px)/2))]";

/** The right column of a two-column section. */
export const GUTTER_RIGHT =
  "px-6 md:px-14 md:pr-[max(3.5rem,calc((100vw_-_1100px)/2))]";

/** A grid of padded cells (md:px-9), inset so the cells' text lines up with
 *  the GUTTER text above and below it. */
export const GUTTER_CELLS =
  "md:px-[max(1.25rem,calc((100vw_-_1100px)/2_-_2.25rem))]";
