"use client";

import Link from "next/link";
import posthog from "posthog-js";
import type { ReactNode } from "react";

/* An internal link to a candidate's own page, instrumented the way
   CandidateSiteLink instruments the outbound one.

   The two events are deliberately separate and both worth having.
   `candidate_profile_clicked` is interest in a candidate, measured on our own
   pages; `candidate_website_clicked` still fires from the campaign-site link
   on the profile page, so the outbound funnel is intact — it just has a step
   in front of it now. Same property names in both, so a breakdown by
   `candidate_key` reads across the pair. */

interface CandidateProfileLinkProps {
  href: string;
  candidate: string;
  candidateKey: string;
  race: "mayor" | "councillor" | "trustee";
  /** York Factory election slug, e.g. "toronto-2026" */
  election: string;
  tag?: string;
  ward?: string;
  wardName?: string;
  className?: string;
  children: ReactNode;
}

export function CandidateProfileLink({
  href,
  candidate,
  candidateKey,
  race,
  election,
  tag,
  ward,
  wardName,
  className,
  children,
}: CandidateProfileLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        posthog.capture("candidate_profile_clicked", {
          candidate,
          candidate_key: candidateKey,
          race,
          election,
          tag,
          ward,
          ward_name: wardName,
        });
      }}
    >
      {children}
    </Link>
  );
}
