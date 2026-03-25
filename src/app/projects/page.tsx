import type { Metadata } from "next";
import Image from "next/image";
import SectionLabel from "@/components/SectionLabel";
import ProjectsGrid from "@/components/ProjectsGrid";

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
    card: "summary",
    title: "Projects",
  },
};

export default function ProjectsPage() {
  return (
    <div className="mx-[10px] my-[10px] border border-[var(--color-border-light)] bg-[var(--color-bg)] overflow-x-clip">
      {/* Header */}
      <div className="animate-fade-in" style={{ animationDelay: "0s" }}>
        <section className="relative px-5 border-b border-[var(--color-border-light)] overflow-hidden">
          <Image
            src="/assets/images/developer-at-hackathon.webp"
            alt="Developer working on a laptop at a Waterloo hackathon"
            fill
            className="object-cover brightness-[0.35]"
            priority
          />
          <div className="relative max-w-[1080px] mx-auto py-[60px] md:pt-[140px] md:pb-[80px] lg:pt-[180px]">
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
          <h2 className="type-label text-[var(--color-text-secondary)] mb-3">Featured</h2>
          <ProjectsGrid filter="featured" excludeSlugs={["great-builders"]} />

          <h2 className="type-label text-[var(--color-text-secondary)] mb-3 mt-8">All Projects</h2>
          <ProjectsGrid filter="non-featured" excludeSlugs={["great-builders"]} />
        </div>
      </section>
      </div>
    </div>
  );
}
