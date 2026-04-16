import type { Metadata } from "next";
import Image from "next/image";
import { getSiteConfig } from "@/lib/api";
import SectionLabel from "@/components/SectionLabel";
import ProjectsGrid from "@/components/ProjectsGrid";
import { SectionHeader } from "@/components/ui/section-header";
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
      <div className="animate-fade-in" style={{ animationDelay: "0s" }}>
        <section className="relative px-5 h-[45svh] md:h-[65svh] flex flex-col justify-center border-b border-border-light overflow-hidden">
          <Image
            src="/assets/images/developer-at-hackathon.webp"
            alt="Developer working on a laptop at a Waterloo hackathon"
            fill
            className="object-cover brightness-[0.35]"
            priority
          />
          <div className="relative max-w-[1080px] mx-auto w-full">
            <SectionLabel className="text-white/60">Projects</SectionLabel>
            <h1 className="type-title mb-1 text-white">Transparency at your Fingertips</h1>
            <p className="type-body text-white/70">
              Transparent government data and better tools for pro-growth voices.
            </p>
          </div>
        </section>
      </div>

      <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
      <section className="px-5 py-12">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeader label="Projects" />
          <ProjectsGrid excludeSlugs={["great-builders"]} />
        </div>
      </section>
      </div>
    </div>
  );
}
