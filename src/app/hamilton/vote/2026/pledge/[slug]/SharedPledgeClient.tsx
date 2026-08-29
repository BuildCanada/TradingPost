"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Link2 } from "lucide-react";
import { getElection } from "@/lib/elections/registry";
import { usePledgeShare } from "@/lib/elections/use-pledge-share";
import stampImage from "../hamilton-stamp.png";

const ELECTION = getElection("hamilton-2026");

const StampScene = dynamic(() => import("@/components/elections/StampScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <span className="type-label text-text-secondary">
        Printing the stamp…
      </span>
    </div>
  ),
});

export default function SharedPledgeClient({ name }: { name: string }) {
  const { copied, share } = usePledgeShare(
    `${name} pledged to vote — Hamilton 2026`,
  );

  return (
    <div className="relative h-[calc(100dvh-20px)] min-h-[480px] border-2 border-dark bg-[#efe4da] overflow-clip">
      {/* ── The stamp, full bleed ────────────────────────────── */}
      <div className="absolute inset-0">
        <StampScene stampSrc={stampImage.src} />
      </div>

      {/* ── Overlaid header ──────────────────────────────────── */}
      <div className="pointer-events-none absolute top-0 inset-x-0 flex flex-wrap items-start justify-between gap-x-8 gap-y-5 p-6 md:p-10">
        <div>
          <p className="type-label text-accent mb-4">{ELECTION.eyebrow}</p>
          <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(2.25rem,4.5vw,3.75rem)] max-w-[16ch] text-balance">
            {name} pledged to vote.
          </h1>
        </div>

        {/* ── Share + join in ────────────────────────────────── */}
        <div className="pointer-events-auto flex flex-col items-start gap-4 max-w-[24rem]">
          <p className="type-label-sm text-text-secondary">
            {ELECTION.cityLabel} votes {ELECTION.voteDayLabel}
          </p>
          <Link
            href={ELECTION.pledgePath}
            className="group/btn inline-flex items-center gap-3 type-button text-bg bg-accent px-6 py-3.5 transition-colors hover:bg-accent-hover"
          >
            Pledge to vote too
            <ArrowRight className="size-4 shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-2 type-label-sm text-accent border border-accent px-3 py-1.5 transition-colors hover:bg-accent hover:text-bg"
          >
            {copied ? (
              <>
                <Check className="size-3.5" />
                Link copied
              </>
            ) : (
              <>
                <Link2 className="size-3.5" />
                Share this pledge
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Overlaid footer ──────────────────────────────────── */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 flex flex-wrap items-center justify-between gap-4 p-6 md:px-10 md:py-8">
        <Link
          href={ELECTION.basePath}
          className="pointer-events-auto group/btn inline-flex items-center gap-3 type-button text-dark border-2 border-dark px-6 py-3.5 transition-colors hover:bg-dark hover:text-bg"
        >
          <ArrowLeft className="size-4 shrink-0 transition-transform group-hover/btn:-translate-x-0.5" />
          Back to the election tracker
        </Link>
        <p className="type-label-sm text-text-secondary">
          Drag the stamp around · Polls open {ELECTION.pollHoursLabel}
        </p>
      </div>
    </div>
  );
}
