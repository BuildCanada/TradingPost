import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/api";
import ProjectsGrid from "@/components/ProjectsGrid";
import { PageHeader } from "@/components/ui/page-header";
import { buildGraph } from "@/lib/schemas/graph";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Transparent government data and better tools for pro-growth voices.",
  openGraph: {
    title: "Projects",
    description:
      "Transparent government data and better tools for pro-growth voices.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects",
  },
};

export default async function ProjectsPage() {
  const configData = getSiteConfig();

  const jsonLd = buildGraph(
    generateOrganizationSchema(configData),
    generateBreadcrumbSchema("/projects", "Projects", configData.siteUrl)
  );

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        title={<>Projects &mdash; Transparency at your Fingertips</>}
        description="Transparent government data and better tools for pro-growth voices."
      />

      <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
      <section className="px-5 py-12">
        <div className="max-w-[1080px] mx-auto">
          <ProjectsGrid />
        </div>
      </section>
      </div>
    </div>
  );
}
