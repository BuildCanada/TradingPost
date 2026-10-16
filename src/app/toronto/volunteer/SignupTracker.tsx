"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

/**
 * Records a Build the Vote sign-up. Step 1 only moves on to step 2 once the
 * sign-up is saved, so landing here means it went through.
 */
export function SignupTracker() {
  useEffect(() => {
    posthog.capture("volunteer_signed_up", { program: "build_the_vote" });
  }, []);

  return null;
}
