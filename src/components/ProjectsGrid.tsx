import { PROJECTS } from "@/constants/projects";
import WidgetCard from "./widgets/WidgetCard";
import { ProjectData } from "./widgets/types";

export default function ProjectsGrid({
  featured,
  maxItems,
  filter,
  excludeSlugs,
  includeSlugs,
  columns,
}: {
  featured?: boolean;
  maxItems?: number;
  filter?: "featured" | "non-featured";
  excludeSlugs?: string[];
  includeSlugs?: string[];
  columns?: 1 | 2;
}) {
  let projects: ProjectData[] = featured
    ? PROJECTS.filter((p) => p.featured)
    : PROJECTS;

  if (includeSlugs?.length) {
    projects = includeSlugs
      .map((slug) => projects.find((p) => p.slug === slug))
      .filter((p): p is ProjectData => p != null);
  }

  if (filter === "featured") {
    projects = projects.filter((p) => p.featured);
  } else if (filter === "non-featured") {
    projects = projects.filter((p) => !p.featured);
  }

  if (excludeSlugs?.length) {
    const excluded = new Set(excludeSlugs);
    projects = projects.filter((p) => !excluded.has(p.slug));
  }

  if (maxItems) {
    projects = projects.slice(0, maxItems);
  }

  if (projects.length === 0) return null;

  return (
    <div className={`grid gap-0 ${columns === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
      {projects.map((project) => (
        <WidgetCard key={project.id} project={project} />
      ))}
    </div>
  );
}
