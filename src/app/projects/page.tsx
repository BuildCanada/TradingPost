import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import SectionLabel from "@/components/SectionLabel";
import ProjectsGrid from "@/components/ProjectsGrid";
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

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  let siteConfig = await prisma.siteConfig.findUnique({ where: { id: "site" } });
  if (!siteConfig) {
    siteConfig = await prisma.siteConfig.create({ data: { id: "site" } });
  }
  const configData = {
    orgName: siteConfig.orgName,
    orgDescription: siteConfig.orgDescription,
    siteUrl: siteConfig.siteUrl,
    logoUrl: siteConfig.logoUrl,
    socialLinks: siteConfig.socialLinks,
  };
  const jsonLd = buildGraph(
    generateOrganizationSchema(configData),
    generateBreadcrumbSchema("/projects", "Projects", siteConfig.siteUrl)
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
      <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px]">
        <div className="max-w-[1080px] mx-auto">
          <h2 className="type-label text-text-secondary mb-3">Featured</h2>
          <ProjectsGrid filter="featured" excludeSlugs={["great-builders"]} />

          <h2 className="type-label text-text-secondary mb-3 mt-8">All Projects</h2>
          <ProjectsGrid filter="non-featured" excludeSlugs={["great-builders"]} />
        </div>
      </section>
      </div>
    </div>
  );
}
