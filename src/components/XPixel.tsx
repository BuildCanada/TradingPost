"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

/* X (Twitter) Ads universal website tag. `twq('config', <pixel id>)` loads the
   tag and reports the initial page load; conversion events are then reported
   with twq('event', 'tw-<pixel>-<event>', {...}) from wherever they happen.

   uwt.js installs no history listener, so App Router navigations would
   otherwise go unreported. Each route change re-calls twq('config', ...),
   which sends a fresh page-load beacon every time it runs (the command is
   safe to repeat, and queues before the script finishes loading).

   Production only, so localhost and preview deployments stay out of the ad
   data. To check the tag locally, temporarily drop the NODE_ENV guard. */

const X_PIXEL_ID = "re2t6";

declare global {
  interface Window {
    twq?: (...args: unknown[]) => void;
  }
}

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // last path reported; doubles as the initial-load marker so the first
  // render (already tracked by the inline snippet) and strict-mode effect
  // re-runs don't double-count
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

    window.twq?.("config", X_PIXEL_ID);
  }, [pathname, searchParams]);

  return null;
}

export function XPixel() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script id="x-pixel" strategy="afterInteractive">
        {`
        !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
        twq('config','${X_PIXEL_ID}');
      `}
      </Script>
      {/* useSearchParams requires a Suspense boundary in the App Router */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
