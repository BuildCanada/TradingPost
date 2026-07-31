"use client";

import posthog from "posthog-js";
import type { ReactNode } from "react";

/* An outbound link to a candidate's campaign site, instrumented so we can see
   which candidates people actually click through to. Shared by every region's
   election pages; `election` names which one, since candidate keys are only
   unique within an election. */

interface CandidateSiteLinkProps {
  href: string;
  candidate: string;
  candidateKey: string;
  race: "mayor" | "councillor" | "trustee";
  /** York Factory election slug, e.g. "hamilton-2026" */
  election: string;
  tag?: string;
  ward?: string;
  wardName?: string;
  className?: string;
  children: ReactNode;
}

export function CandidateSiteLink({
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
}: CandidateSiteLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        posthog.capture("candidate_website_clicked", {
          candidate,
          candidate_key: candidateKey,
          race,
          election,
          website: href,
          tag,
          ward,
          ward_name: wardName,
        });
      }}
    >
      {children}
    </a>
  );
}
