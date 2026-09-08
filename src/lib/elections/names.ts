/* A candidate's name, cut down for the places that talk about them repeatedly.
 *
 * Both the ward pages and the survey's comparison view label things with the
 * candidate's name over and over — every note, every quoted answer, every
 * badge on an option list. Written out in full each time it reads as a
 * database column heading; the surrounding card has already said who this is.
 */

/** "Chris Moise" → "Chris". Falls back to the whole string for a mononym. */
export const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;

/** "Vanessa Raponi" → "Raponi". Falls back to the whole string for a mononym.
 *  For the places that name a candidate the way a ballot or a headline does. */
export const lastName = (name: string) => name.trim().split(/\s+/).at(-1) || name;

/** "Chris" → "Chris’s", "Chris Adams" → "Chris Adams’" — a name already
 *  ending in s takes the bare apostrophe. */
export const possessive = (name: string) =>
  name.endsWith("s") || name.endsWith("S") ? `${name}’` : `${name}’s`;
