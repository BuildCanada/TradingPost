export interface SiteConfigData {
  orgName: string;
  orgDescription: string;
  siteUrl: string;
  logoUrl: string;
  socialLinks: string;
}

export function getSiteConfig(): SiteConfigData {
  return {
    orgName: "Build Canada",
    orgDescription:
      "Build Canada is a civic organization on a mission to make Canada the most prosperous country in the world.",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://buildcanada.com",
    logoUrl: "/assets/logos/logo-standard.svg",
    socialLinks: JSON.stringify([
      { platform: "x", url: "https://x.com/build_canada" },
      { platform: "linkedin", url: "https://www.linkedin.com/company/buildcanada" },
      { platform: "tiktok", url: "https://www.tiktok.com/@build_canada" },
      { platform: "instagram", url: "https://www.instagram.com/build_canada/" },
      { platform: "substack", url: "https://buildcanada.substack.com/" },
      { platform: "youtube", url: "https://www.youtube.com/@BuildCanada" },
    ]),
  };
}
