import { Suspense } from "react";
import { fetchFeedItems, getSiteConfig } from "@/lib/api";
import ContentFeedClient from "./ContentFeedClient";
import { PageHeader } from "@/components/ui/page-header";
import { buildGraph } from "@/lib/schemas/graph";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";

export default async function ContentPage() {
  const items = await fetchFeedItems();
  const configData = getSiteConfig();

  const jsonLd = buildGraph(
    generateOrganizationSchema(configData),
    generateBreadcrumbSchema("/content", "Content", configData.siteUrl)
  );

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        title="Builders Move Fast by Design"
        description="Don't miss a beat. Check out Build Canada content below or follow us on your preferred socials channel."
      />
      <Suspense fallback={null}>
        <ContentFeedClient items={items} />
      </Suspense>
    </div>
  );
}
