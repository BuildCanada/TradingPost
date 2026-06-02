import { PostHog } from "posthog-node";

let client: PostHog | null = null;

// Server-side PostHog client for evaluating feature flags during SSR.
// Returns null when PostHog isn't configured (e.g. local dev without a token),
// letting callers fall back to an "open" default.
export function getPostHogServer(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_TOKEN;
  if (!key) return null;

  if (!client) {
    client = new PostHog(key, {
      // Talk to PostHog directly — the `/ph` rewrite proxy only exists for the
      // browser, not for server-side requests.
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      // Flag checks don't need batching; keep the client from holding events.
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return client;
}
