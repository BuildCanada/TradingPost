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

/**
 * Matching key for a candidate: lowercase, diacritics and punctuation
 * stripped, so the Clerk's "Ala'a Adib" matches a hand-written "Alaa Adib".
 * Also the stable candidate key in analytics events and the roster joins,
 * since the clerks' feeds carry no candidate IDs.
 *
 * Lives here rather than in election-data because the client components that
 * link to a candidate's page need it, and election-data reaches the API.
 */
export function nameKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** `nameKey` as a URL segment — "Brad Bradford" → "brad-bradford". The whole
 *  identity of a candidate's own page, so it must stay derivable from the name
 *  alone: the roster is rebuilt from the Clerk's feed daily and carries no ids
 *  we could key a URL to. */
export const candidateSlug = (name: string) => nameKey(name).replace(/ /g, "-");
