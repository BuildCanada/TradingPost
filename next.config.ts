import { withPostHogConfig } from "@posthog/nextjs-config";
import type { NextConfig } from "next";

// Where the /progress out-of-home ad URL sends people. GA4 reads utm_* off the
// landing URL and files the visit under this campaign in its acquisition
// reports; change the values here and both /progress rules follow.
const OOH_DESTINATION =
  "/?utm_source=ooh&utm_medium=offline&utm_campaign=progress";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Signals AI crawlers that training, search indexing, and agentic
          // use are all permitted (https://contentsignals.org). Set here
          // rather than public/_headers because the Docker deploy doesn't
          // read that file.
          {
            key: "Content-Signal",
            value: "ai-train=yes, search=yes, ai-input=yes",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/great-canadian-builders",
        destination: "/builders",
        permanent: true,
      },
      {
        source: "/great-canadian-builders/:slug",
        destination: "/builders/:slug",
        permanent: true,
      },
      // Both prior names of the State of the Nation dashboard redirect
      // straight to the current route (no chained hops).
      {
        source: "/economic-indicators",
        destination: "/state-of-the-nation",
        permanent: true,
      },
      {
        source: "/economic-indicators/:path*",
        destination: "/state-of-the-nation/:path*",
        permanent: true,
      },
      {
        source: "/prosperity-dashboard",
        destination: "/state-of-the-nation",
        permanent: true,
      },
      {
        source: "/prosperity-dashboard/:path*",
        destination: "/state-of-the-nation/:path*",
        permanent: true,
      },
      // /progress is the vanity URL printed on an out-of-home ad — not a page.
      // It carries campaign parameters to the homepage so GA4 attributes the
      // visit to the ad; without them a bare redirect to / is invisible,
      // indistinguishable from organic homepage traffic. Trailing slash
      // included because skipTrailingSlashRedirect is on, so "/progress/"
      // won't normalize itself.
      //
      // Temporary on purpose: a 308 would sit in a visitor's browser and skip
      // the server on later visits, so repeat scans would go uncounted.
      {
        source: "/progress",
        destination: OOH_DESTINATION,
        permanent: false,
      },
      {
        source: "/progress/",
        destination: OOH_DESTINATION,
        permanent: false,
      },
      // Election coverage lives under /vote: the index at /vote, and Toronto's
      // pages at /toronto/vote/<year>. Two earlier shapes are still out in the
      // world — Toronto's /toronto/elections/2026 (indexed, and the target of
      // shared pledge links) and Brampton's /elections/brampton/2026 — so both
      // redirect. Each points straight at its final destination; none of these
      // chain through another redirect.
      {
        source: "/elections",
        destination: "/vote",
        permanent: true,
      },
      // Only Toronto's coverage is live. Brampton, Hamilton and Ottawa are
      // built but switched off (registry `hidden`), so every URL under them —
      // including the old /elections shapes — lands on the /vote index rather
      // than a page we aren't standing behind. These come first so they win
      // over the Toronto-shaped rules below; none of them chain.
      {
        source: "/:city(brampton|hamilton|ottawa)/vote/:path*",
        destination: "/vote",
        permanent: false,
      },
      {
        source: "/:city(brampton|hamilton|ottawa)/vote",
        destination: "/vote",
        permanent: false,
      },
      {
        source: "/:city(brampton|hamilton|ottawa)/elections/:path*",
        destination: "/vote",
        permanent: false,
      },
      {
        source: "/:city(brampton|hamilton|ottawa)/elections",
        destination: "/vote",
        permanent: false,
      },
      {
        source: "/elections/brampton/2026/:path*",
        destination: "/vote",
        permanent: false,
      },
      {
        source: "/elections/brampton/2026",
        destination: "/vote",
        permanent: false,
      },
      // Toronto's get-involved page is switched off. It stays in the repo but
      // sends people to the election landing instead. The legacy /elections
      // shape gets its own rule so it lands there directly rather than
      // chaining through the generic /toronto/elections/:path* rule below.
      {
        source: "/toronto/vote/get-involved",
        destination: "/toronto/vote/2026",
        permanent: false,
      },
      {
        source: "/toronto/elections/get-involved",
        destination: "/toronto/vote/2026",
        permanent: false,
      },
      {
        source: "/toronto/elections",
        destination: "/toronto/vote",
        permanent: true,
      },
      {
        source: "/toronto/elections/:path*",
        destination: "/toronto/vote/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const trackerBase = process.env.TRACKER_API_BASE;

    // Default (buildcanada.com): Rails API is mounted under /tracker, paths
    // pass through unchanged. Standalone host (e.g. nelson deploy): commitments
    // and departments live at the root (strip /tracker/api/v1), while
    // dashboard/burndown stay under /api (strip /tracker only). Mirrors the
    // server-side mapping in src/lib/tracker-api.ts.
    const trackerRewrites = trackerBase
      ? [
          {
            source: "/tracker/api/v1/:path*",
            destination: `${trackerBase}/:path*`,
          },
          {
            source: "/tracker/api/:path*",
            destination: `${trackerBase}/api/:path*`,
          },
        ]
      : [
          {
            source: "/tracker/api/:path*",
            destination: `https://www.buildcanada.com/tracker/api/:path*`,
          },
        ];

    return [
      {
        source: "/ph/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ph/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ph/decide",
        destination: "https://us.i.posthog.com/decide",
      },
      ...trackerRewrites,
    ];
  },
  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.prod.website-files.com",
      },
      {
        protocol: "https",
        hostname: "p16-sign-sg.tiktokcdn.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "images.lumacdn.com",
      },
      {
        protocol: "https",
        hostname: "york-factory.eng.canadasbuilding.com",
      },
      {
        protocol: "https",
        hostname: "yorkfactory.buildcanada.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

const posthogApiKey = process.env.POSTHOG_API_KEY;
const posthogProjectId = process.env.POSTHOG_PROJECT_ID;

export default withPostHogConfig(nextConfig, {
  personalApiKey: posthogApiKey ?? "",
  projectId: posthogProjectId,
  sourcemaps: {
    // Keep builds working in local development and deployments where source
    // map upload credentials have not been configured yet.
    enabled: Boolean(posthogApiKey && posthogProjectId),
    deleteAfterUpload: true,
  },
});
