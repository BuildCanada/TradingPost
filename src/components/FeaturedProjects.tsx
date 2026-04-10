import SectionLabel from "@/components/SectionLabel";
import ProjectsGrid from "@/components/ProjectsGrid";
import { LinkButton } from "@/components/ui/link-button";

export default function FeaturedProjects() {
  return (
    <section className="px-5 pt-[26px] pb-[36px] border-b border-border-light">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel>Projects</SectionLabel>
        <ProjectsGrid includeSlugs={["outcomes-tracker", "canada-spends"]} columns={1} />
        <div className="flex justify-start mt-4">
          <LinkButton href="/projects" variant="primary">
            View All Projects
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
