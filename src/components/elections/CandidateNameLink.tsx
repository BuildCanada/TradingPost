"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";

import { CandidateProfileLink } from "./CandidateProfileLink";
import { CandidateSiteLink } from "./CandidateSiteLink";
import { candidateProfilePath } from "@/lib/elections/candidate-profile";

/* A candidate's name, as a link to the candidate.
 *
 * WHERE THE NAME USED TO GO
 *   Out. A name with a campaign site was a link to that site, everywhere a
 *   name appeared — the mayoral cards, the ward rosters, the questionnaire
 *   column heads. So the one element that identified a person was also the
 *   exit, and the reader who clicked it landed on a campaign's own account of
 *   the candidate with the ward, the questionnaire answers and the ballot they
 *   are on all left behind.
 *
 *   Now the name goes to our page for that candidate, and the campaign site is
 *   a link on it. Nothing is lost from the funnel: the outbound click is still
 *   `candidate_website_clicked`, fired from the profile page by the same
 *   CandidateSiteLink, with `candidate_profile_clicked` in front of it.
 *
 * WHERE THERE IS NO PAGE
 *   Regions we cover but have not built candidate pages for (everywhere but
 *   Toronto — see `candidateProfiles` in the registry) keep the outbound name
 *   link exactly as it was. A name pointing at a 404 is worse than a name
 *   pointing outward, so this degrades rather than assumes.
 *
 * THE ARROW
 *   It is the whole tell that a name is a link, so it appears only where there
 *   is somewhere to go — and it points the way it goes: right for a page of
 *   ours, up-and-out for a campaign site.
 */

export type LinkableCandidate = {
  /** `nameKey(name)` — the analytics candidate key */
  key: string;
  name: string;
  website?: string;
  tag?: string;
};

export function CandidateNameLink({
  candidate,
  election,
  race,
  ward,
  wardName,
  className = "",
  linkClassName = "",
  arrow = true,
}: {
  candidate: LinkableCandidate;
  /** York Factory election slug — decides whether a profile page exists */
  election: string;
  race: "mayor" | "councillor" | "trustee";
  ward?: string;
  wardName?: string;
  /** typography for the name, applied whether or not it links */
  className?: string;
  /** extra classes for the link state only (hover colour, group name) */
  linkClassName?: string;
  /** drop the trailing arrow where the surrounding card is already a link
   *  target, or where the row has no width for it */
  arrow?: boolean;
}) {
  const profileHref = candidateProfilePath(election, candidate.name);

  if (profileHref) {
    return (
      <CandidateProfileLink
        href={profileHref}
        candidate={candidate.name}
        candidateKey={candidate.key}
        election={election}
        race={race}
        tag={candidate.tag}
        ward={ward}
        wardName={wardName}
        className={`group/name transition-colors hover:text-accent ${className} ${linkClassName}`}
      >
        {candidate.name}
        {arrow && (
          <ArrowRight
            className="ml-1 inline size-3 align-[1px] transition-transform group-hover/name:translate-x-0.5"
            aria-hidden="true"
          />
        )}
      </CandidateProfileLink>
    );
  }

  if (candidate.website) {
    return (
      <CandidateSiteLink
        href={candidate.website}
        candidate={candidate.name}
        candidateKey={candidate.key}
        election={election}
        race={race}
        tag={candidate.tag}
        ward={ward}
        wardName={wardName}
        className={`group/name transition-colors hover:text-accent ${className} ${linkClassName}`}
      >
        {candidate.name}
        {arrow && (
          <ArrowUpRight
            className="ml-1 inline size-3 align-[1px] transition-transform group-hover/name:translate-x-0.5 group-hover/name:-translate-y-0.5"
            aria-hidden="true"
          />
        )}
      </CandidateSiteLink>
    );
  }

  return <span className={className}>{candidate.name}</span>;
}
