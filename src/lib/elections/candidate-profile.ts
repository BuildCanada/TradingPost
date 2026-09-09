// Where a candidate's own page lives, for the components that link to it.
//
// A candidate's name used to be a link to their campaign site, everywhere a
// name appeared. That made the name a way off the site: the reader clicked the
// one thing on the page that identified a person and landed on a campaign's
// own framing of them, with the questionnaire answers, the ward, and whether
// they had even registered all left behind. Now the name goes to a page of
// ours, and the campaign site is a link on it — one of the things we know
// about the candidate rather than the only thing we point at.
//
// Kept apart from ./registry so that file stays plain configuration, and free
// of ./election-data so client components can import it: the path is derived
// from the name alone, which is all a rendered roster has.

import { candidateSlug } from "./names";
import { SUPPORTED_ELECTIONS } from "./registry";

export { candidateSlug };

/**
 * The internal page for one candidate, or null where this region has none —
 * only Toronto has the route (see `candidateProfiles`), and every other region
 * keeps the outbound name link it has always had rather than pointing at a
 * 404.
 *
 * Looked up by exact slug rather than `getElection`, so an unknown election
 * gets no path instead of quietly inheriting Toronto's.
 */
export function candidateProfilePath(
  electionSlug: string,
  candidateName: string,
): string | null {
  const election = SUPPORTED_ELECTIONS[electionSlug];
  if (!election?.candidateProfiles) return null;
  const slug = candidateSlug(candidateName);
  if (!slug) return null;
  return `${election.basePath}/candidates/${slug}`;
}
