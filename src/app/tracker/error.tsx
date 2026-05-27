"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

export default function TrackerError({
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
        boundary: "tracker",
      });
    }
  }, [error]);

  return (
    <div className="bg-white border border-[#cdc4bd] p-8 text-center">
      <h2 className="text-2xl font-bold mb-3 text-gray-900">
        We couldn&apos;t load tracker data.
      </h2>
      <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
        The tracker API didn&apos;t respond. This may be a temporary outage —
        try again in a moment.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm bg-[#8b2332] text-white hover:opacity-90 transition-opacity"
      >
        Try Again
      </button>
    </div>
  );
}
