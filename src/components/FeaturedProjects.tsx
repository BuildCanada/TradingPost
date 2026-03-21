import Link from "next/link";
import SectionLabel from "@/components/SectionLabel";
import ProjectsGrid from "@/components/ProjectsGrid";

export default function FeaturedProjects() {
  return (
    <section className="px-5 pt-[26px] pb-[36px] border-b border-[var(--color-border-light)]">
      <SectionLabel>Projects</SectionLabel>
      <div className="max-w-[1080px] mx-auto">
        <ProjectsGrid featured maxItems={4} />
        <div className="flex justify-center mt-4">
          <Link
            href="/projects"
            className="h-7 px-2.5 border border-[var(--color-border-light)] flex items-center type-label text-[var(--color-dark)] hover:border-[var(--color-dark)] transition-colors"
          >
            View All Projects &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
