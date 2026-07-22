"use client";

import posthog from "posthog-js";
import type { ReactNode } from "react";

interface CandidateSiteLinkProps {
  href: string;
  candidate: string;
  candidateKey: string;
  race: "mayor" | "councillor";
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
