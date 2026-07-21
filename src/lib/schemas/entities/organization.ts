import { Organization, WebSite } from "schema-dts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://buildcanada.com";

export function createOrganization(): Organization {
  return {
    "@type": "Organization",
    name: "Build Canada",
    url: SITE_URL,
    description:
      "Build Canada is a civic organization on a mission to make Canada the most prosperous country in the world.",
    logo: `${SITE_URL}/assets/logos/buildcanada-logo-square.svg`,
    sameAs: [
      "https://x.com/buildcanada",
      "https://www.linkedin.com/company/buildcanada",
      "https://www.instagram.com/build_canada/",
      "https://www.tiktok.com/@build_canada",
      "https://buildcanada.substack.com/",
      "https://www.youtube.com/@BuildCanada",
    ],
  };
}

export function createWebSite(): WebSite {
  return {
    "@type": "WebSite",
    name: "Build Canada",
    url: SITE_URL,
    publisher: { "@type": "Organization", name: "Build Canada" },
  };
}
