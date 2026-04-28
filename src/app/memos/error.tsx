"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";

export default function MemosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_TOKEN) {
      posthog.captureException(error, {
        digest: error.digest,
        pathname: window.location.pathname,
        boundary: "memos",
      });
    }
  }, [error]);

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg min-h-[60vh] flex flex-col items-center justify-center text-center px-5">
      <span className="type-label text-accent mb-4 tracking-[0.2em]">
        Memos
      </span>
      <h1
        className="type-display-sm mb-4"
        style={{ color: "var(--color-charcoal-1000)" }}
      >
        We couldn&apos;t load this.
      </h1>
      <p
        className="type-body-sm mb-8 max-w-[420px]"
        style={{ color: "var(--color-charcoal-600)" }}
      >
        Something went wrong while loading the memos. Try again, or browse from
        the home page.
      </p>
      <div className="flex items-center gap-3">
        <Button as="button" onClick={reset} variant="charcoal">
          Try Again
        </Button>
        <Button as="link" href="/" variant="ghost">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
