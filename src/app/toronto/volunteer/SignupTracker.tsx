"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

/**
 * Records a Build the Vote sign-up. The form lives in CJPAC's Formstack, so we
 * never see the submit itself. Landing on step 2 is the closest signal we have:
 * step 1's redirect is the only link to it.
 */
export function SignupTracker() {
  useEffect(() => {
    // Inside the hidden iframe a form posts into (see FormstackForm), should
    // CJPAC's redirect ever point here: the visible page records it instead.
    if (window !== window.top) return;
    posthog.capture("volunteer_signed_up", { program: "build_the_vote" });
  }, []);

  return null;
}
