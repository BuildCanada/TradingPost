"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

/* HubSpot analytics tracking. Sets the hubspotutk visitor cookie that the
   subscribe/pledge forms forward (see src/lib/hubspot-context.ts), linking
   form submissions to the visitor's browsing history in HubSpot.

   The loader script records the initial page load by itself, but App Router
   navigations never reload the page, so each route change is reported to the
   _hsq command queue (safe to push before the script finishes loading). */

const HUBSPOT_PORTAL_ID = "342054223";

declare global {
  interface Window {
    _hsq?: unknown[][];
  }
}

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // last path reported; doubles as the initial-load marker so the first
  // render (already tracked by the loader) and strict-mode effect re-runs
  // don't double-count
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const query = searchParams?.toString();
    const path = query ? `${pathname}?${query}` : pathname;

    if (lastPath.current === null) {
      lastPath.current = path;
      return;
    }
    if (lastPath.current === path) return;
    lastPath.current = path;

    const hsq = (window._hsq = window._hsq || []);
    hsq.push(["setPath", path]);
    hsq.push(["trackPageView"]);
  }, [pathname, searchParams]);

  return null;
}

export function HubspotTracking() {
  // don't pollute analytics with localhost traffic
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        id="hs-script-loader"
        src={`https://js-na3.hs-scripts.com/${HUBSPOT_PORTAL_ID}.js`}
        strategy="afterInteractive"
      />
      {/* useSearchParams requires a Suspense boundary in the App Router */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
