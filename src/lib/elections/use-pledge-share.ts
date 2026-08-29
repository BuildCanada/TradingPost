"use client";

import { useState } from "react";
import { toast } from "sonner";

/**
 * Share the current pledge page, and report failure instead of failing
 * silently. Every region's pledge page uses this, so the share-sheet handling
 * and the clipboard guard live in one place.
 *
 * The order is: try the native share sheet, then fall back to the clipboard.
 * Two failures need care:
 *   - The user dismisses the share sheet. That rejects with `AbortError`. Treat
 *     it as done, because the user chose to cancel — and skip the clipboard,
 *     because the transient user activation is already gone and the write would
 *     reject with `NotAllowedError`.
 *   - The clipboard write rejects for any reason. Show a toast, so the button
 *     no longer sits on "Share this pledge" with nothing to explain the miss.
 */
export function usePledgeShare(title: string) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        // Any other share failure falls through to the clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the link. Copy it from the address bar.");
    }
  }

  return { copied, share };
}
