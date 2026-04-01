import { stripNulls, parseJSON } from "../utils";

interface SiteConfigData {
  orgName: string;
  orgDescription?: string | null;
  logoUrl?: string | null;
  siteUrl: string;
  socialLinks?: string | null;
}

export function generateOrganizationSchema(config: SiteConfigData) {
  const sameAs = parseJSON<string[]>(config.socialLinks) ?? [];
  return stripNulls({
    "@type": "Organization" as const,
    name: config.orgName,
    url: config.siteUrl,
    description: config.orgDescription,
    logo: config.logoUrl,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  });
}
