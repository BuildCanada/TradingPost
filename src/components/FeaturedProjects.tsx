import { SectionHeader } from "@/components/ui/section-header";
import ProjectsGrid from "@/components/ProjectsGrid";
import { LinkButton } from "@/components/ui/link-button";

export default function FeaturedProjects() {
  return (
    <section className="px-5 py-12 border-b border-border-light">
      <div className="max-w-[1080px] mx-auto">
        <SectionHeader
          label="Projects"
          action={<LinkButton href="/projects" variant="primary">View All Projects</LinkButton>}
        />
        <ProjectsGrid includeSlugs={["outcomes-tracker", "canada-spends"]} columns={1} />
      </div>
    </section>
  );
}
