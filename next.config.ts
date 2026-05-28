import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
