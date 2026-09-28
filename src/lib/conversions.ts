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
    dataLayer?: IArguments[];
  }
}

/**
 * Reports a completed conversion to every configured analytics/ad platform.
 *
 * The promise gives navigations a brief chance to let providers send their
 * event. It never lets an analytics failure interrupt the user's successful
 * action.
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
  if (
    typeof window === "undefined" ||
    !["buildcanada.com", "www.buildcanada.com"].includes(
      window.location.hostname,
    )
  ) {
    return Promise.resolve();
  }

  // The tag loader runs asynchronously. Queue a completed conversion even if
  // it finishes before the bootstrap script installs gtag.
  window.dataLayer = window.dataLayer || [];
  const gtag = window.gtag || function () {
    // gtag.js consumes the arguments object from each queued command.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };
  window.gtag = gtag;

  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timeout);
      resolve();
    };

    // Do not hold up a client-side navigation if an ad blocker prevents the
    // Google callback from firing.
    const timeout = setTimeout(resolve, 1_000);

    try {
      gtag("event", "conversion", {
        send_to: destination,
        event_callback: done,
        event_timeout: 1_000,
      });
    } catch {
      done();
    }
  });
}
