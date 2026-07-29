"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import stampImage from "./toronto-stamp.png";
import { PledgeButton } from "@/components/elections/PledgeButton";

const StampScene = dynamic(() => import("@/components/elections/StampScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <span className="type-label text-text-secondary">
        Printing your stamp…
      </span>
    </div>
  ),
});

export default function PledgeClient({
  region,
}: {
  /** e.g. "ward-5" from a ward-scoped pledge link; defaults to city-wide */
  region?: string;
}) {
  return (
    <div className="theme-election bg-bg text-dark">
      <div className="relative h-[calc(100dvh-20px)] min-h-[480px] border-2 border-dark bg-bg overflow-clip">
        {/* ── The stamp, full bleed ──────────────────────────── */}
        <div className="absolute inset-0">
          <StampScene stampSrc={stampImage.src} />
        </div>

        {/* ── Overlaid header ────────────────────────────────── */}
        <div className="pointer-events-none absolute top-0 inset-x-0 flex flex-wrap items-start justify-between gap-x-8 gap-y-5 p-6 md:p-10">
          <div>
            <p className="type-label text-accent mb-4">
              Municipal Election · City of Toronto
            </p>
            <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(2.25rem,4.5vw,3.75rem)] max-w-[14ch] text-balance">
              My pledge to vote.
            </h1>
          </div>

          <div className="pointer-events-auto flex flex-col items-start gap-4">
            <p className="type-label-sm text-text-secondary">
              Toronto votes Monday, October 26
            </p>
            <PledgeButton
              region={region}
              source="pledge-page"
              className="group/btn inline-flex items-center gap-3 type-button text-bg bg-accent px-6 py-3.5 transition-colors hover:bg-auburn-700 cursor-pointer"
            >
              Pledge to vote
              <ArrowRight className="size-4 shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
            </PledgeButton>
          </div>
        </div>

        {/* ── Overlaid footer ────────────────────────────────── */}
        <div className="pointer-events-none absolute bottom-0 inset-x-0 flex flex-wrap items-center justify-between gap-4 p-6 md:px-10 md:py-8">
          <Link
            href="/toronto/elections/2026"
            className="pointer-events-auto group/btn inline-flex items-center gap-2 type-button text-dark hover:text-accent"
          >
            Explore the Candidates
            <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
          <p className="type-label-sm text-text-secondary">
            Drag the stamp around · Polls open 10:00 a.m. – 8:00 p.m.
          </p>
        </div>
      </div>
    </div>
  );
}
