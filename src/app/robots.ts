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
          "/polls",
          "/md/polls",
          "/feeds/polls.xml",
          "/api/",
          "/toronto/vote/survey-questions",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/polls", "/md/polls", "/feeds/polls.xml", "/toronto/vote/survey-questions"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/polls", "/md/polls", "/feeds/polls.xml", "/toronto/vote/survey-questions"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/polls", "/md/polls", "/feeds/polls.xml", "/toronto/vote/survey-questions"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/polls", "/md/polls", "/feeds/polls.xml", "/toronto/vote/survey-questions"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
