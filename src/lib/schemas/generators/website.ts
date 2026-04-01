interface SiteConfigData {
  orgName: string;
  siteUrl: string;
}

export function generateWebSiteSchema(config: SiteConfigData) {
  return {
    "@type": "WebSite" as const,
    name: config.orgName,
    url: config.siteUrl,
  };
}
