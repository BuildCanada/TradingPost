"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

// Sentinel recording which user (by email) we've already identified this
// browser session, so identify fires once per session rather than once per
// page load.
const SESSION_KEY = "yf_identified";

// Bridges the httpOnly session to PostHog: asks the server who the user is
// (token never leaves the server) and identifies them in PostHog on login,
// resets on logout. Rendered once in the root layout; returns no UI.
export function IdentifyUser() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok || cancelled) return;

        const { user } = await res.json();
        if (cancelled) return;

        if (user) {
          if (sessionStorage.getItem(SESSION_KEY) !== user.email) {
            posthog.identify(user.email, {
              email: user.email,
              name: user.name,
              role: user.role,
              is_admin: user.admin,
            });
            sessionStorage.setItem(SESSION_KEY, user.email);
          }
        } else if (sessionStorage.getItem(SESSION_KEY)) {
          // Was identified, now signed out → reset so the next anonymous
          // visitor isn't conflated with the previous user.
          posthog.reset();
          sessionStorage.removeItem(SESSION_KEY);
        }
      } catch {
        // Best-effort: analytics identification must never break the page.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
