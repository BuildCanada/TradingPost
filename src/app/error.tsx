"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";

export default function Error({
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
        boundary: "app",
      });
    }
  }, [error]);

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg min-h-[calc(100vh-40px)] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-0 bottom-0 left-[6.7%] w-px"
          style={{ backgroundColor: "var(--color-charcoal-1000)", opacity: 0.06 }}
        />
        <div
          className="absolute top-0 bottom-0 left-[33.3%] w-px"
          style={{ backgroundColor: "var(--color-charcoal-1000)", opacity: 0.06 }}
        />
        <div
          className="absolute top-0 bottom-0 left-[50%] w-px"
          style={{ backgroundColor: "var(--color-charcoal-1000)", opacity: 0.08 }}
        />
        <div
          className="absolute top-0 bottom-0 right-[33.3%] w-px"
          style={{ backgroundColor: "var(--color-charcoal-1000)", opacity: 0.06 }}
        />
        <div
          className="absolute top-0 bottom-0 right-[6.7%] w-px"
          style={{ backgroundColor: "var(--color-charcoal-1000)", opacity: 0.06 }}
        />
        <div
          className="absolute left-0 right-0 top-[20%] h-px"
          style={{ backgroundColor: "var(--color-charcoal-1000)", opacity: 0.06 }}
        />
        <div
          className="absolute left-0 right-0 top-[50%] h-px"
          style={{ backgroundColor: "var(--color-charcoal-1000)", opacity: 0.08 }}
        />
        <div
          className="absolute left-0 right-0 top-[80%] h-px"
          style={{ backgroundColor: "var(--color-charcoal-1000)", opacity: 0.06 }}
        />
        <div
          className="absolute left-[6.7%] right-[6.7%] top-[50%] h-[2px]"
          style={{ backgroundColor: "var(--color-auburn-800)", opacity: 0.25 }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-5">
        <span
          className="block select-none"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "clamp(8rem, 22vw, 16rem)",
            lineHeight: 0.85,
            letterSpacing: "-0.04em",
            color: "var(--color-charcoal-1000)",
            opacity: 0.07,
            fontVariantNumeric: "tabular-nums",
          }}
          aria-hidden="true"
        >
          500
        </span>

        <span className="type-label text-accent mb-4 tracking-[0.2em]">
          Something Broke
        </span>

        <h1
          className="type-display-sm mb-4"
          style={{ color: "var(--color-charcoal-1000)" }}
        >
          A beam came loose.
        </h1>

        <p
          className="type-body-sm mb-10 max-w-[420px]"
          style={{ color: "var(--color-charcoal-600)" }}
        >
          Something went wrong on our end. We&apos;ve been notified and are on
          it. Try again, or head back to the home page.
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

      <div
        className="absolute bottom-4 right-5 type-mono-sm pointer-events-none"
        style={{ color: "var(--color-charcoal-300)", opacity: 0.5 }}
        aria-hidden="true"
      >
        {error.digest ? `ERR.${error.digest.slice(0, 6).toUpperCase()}` : "ERR.500"}
      </div>
    </div>
  );
}
