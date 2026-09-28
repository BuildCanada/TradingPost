"use client";

import posthog from "posthog-js";

type ConversionProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

const conversions = {
  signup: {
    posthogEvent: "subscribed",
    googleAdsDestination: "AW-17738155749/W-XUCMCNx-AcEOWNm4pC",
  },
  voterPledge: {
    posthogEvent: "pledged_to_vote",
    googleAdsDestination: "AW-17738155749/xgobCL2Nx-AcEOWNm4pC",
  },
} as const;

export type Conversion = keyof typeof conversions;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Reports a completed conversion to every configured analytics/ad platform.
 *
 * The promise gives navigations a brief chance to let providers send their
 * event. It resolves immediately when Google Tag is unavailable and never
 * lets an analytics failure interrupt the user's successful action.
 */
export function reportConversion(
  conversion: Conversion,
  properties: ConversionProperties = {},
): Promise<void> {
  const definition = conversions[conversion];

  try {
    posthog.capture(definition.posthogEvent, properties);
  } catch {
    // Analytics must not turn a successful conversion into a user-facing error.
  }

  return reportGoogleAdsConversion(definition.googleAdsDestination);
}

function reportGoogleAdsConversion(destination: string): Promise<void> {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timeout);
      resolve();
    };

    // Do not hold up a client-side navigation if an ad blocker prevents the
    // Google callback from firing.
    const timeout = setTimeout(resolve, 1_000);

    try {
      window.gtag?.("event", "conversion", {
        send_to: destination,
        event_callback: done,
        event_timeout: 1_000,
      });
    } catch {
      done();
    }
  });
}
