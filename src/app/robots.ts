import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://buildcanada.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/toronto/vote/survey-questions",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/toronto/vote/survey-questions"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/toronto/vote/survey-questions"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/toronto/vote/survey-questions"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/toronto/vote/survey-questions"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
