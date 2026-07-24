"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useRouter, useSearchParams } from "next/navigation";

/* Shown when someone submits the pledge form with a postal code outside the
   City of Toronto (see PledgeButton → /api/elections/pledge). York Factory
   keeps them as a newsletter subscriber but records no pledge and redirects
   here with `?residency=outside`; this reads that flag, explains, and invites
   them to explore the tracker. Closing clears the flag so a refresh is clean. */
export function ResidencyModal() {
  const params = useSearchParams();
  const router = useRouter();

  // Open state is derived straight from the URL flag; closing clears the flag,
  // which re-renders this closed and keeps a refresh clean.
  const isOutside = params.get("residency") === "outside";

  const handleOpenChange = (next: boolean) => {
    if (!next && isOutside) {
      router.replace("/toronto/elections/2026", { scroll: false });
    }
  };

  return (
    <Dialog.Root open={isOutside} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 z-[60]" />
        <Dialog.Popup
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-linen-100 border border-charcoal-300 w-[90vw] max-w-md z-[60]"
          style={{ padding: "clamp(1.5rem, 4vw, 2.5rem)" }}
        >
          <Dialog.Title
            className="type-title"
            style={{ marginBottom: "clamp(0.375rem, 1.5vw, 0.75rem)" }}
          >
            You&rsquo;re outside Toronto
          </Dialog.Title>
          <Dialog.Description
            className="type-body"
            style={{ marginBottom: "clamp(1rem, 3vw, 1.5rem)" }}
          >
            The pledge to vote is for City of Toronto residents — but you&rsquo;re
            welcome to explore the election here. Dig into the races for mayor
            and all 25 council wards below.
          </Dialog.Description>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="group/btn inline-flex items-center gap-3 type-button text-bg bg-accent px-6 py-3.5 transition-colors hover:bg-accent-hover cursor-pointer"
          >
            Explore the election
          </button>
          <Dialog.Close
            aria-label="Close dialog"
            className="absolute w-11 h-11 flex items-center justify-center text-charcoal-600 hover:text-charcoal-1000 hover:bg-charcoal-200/30 rounded-sm transition-colors cursor-pointer"
            style={{
              top: "clamp(0.75rem, 2.5vw, 1.25rem)",
              right: "clamp(0.75rem, 2.5vw, 1.25rem)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
