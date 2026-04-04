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
  images: {
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
    ],
  },
};

export default nextConfig;
