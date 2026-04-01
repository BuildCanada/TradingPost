import { prisma } from "@/lib/prisma";
import WidgetCard from "./widgets/WidgetCard";
import { ProjectData } from "./widgets/types";

export default async function ProjectsGrid({
  featured,
  maxItems,
  filter,
  excludeSlugs,
}: {
  featured?: boolean;
  maxItems?: number;
  filter?: "featured" | "non-featured";
  excludeSlugs?: string[];
}) {
  const where = featured ? { featured: true } : undefined;
  const raw = await prisma.project.findMany({
    where,
    orderBy: { order: "asc" },
  });

  let projects = raw.map((p) => ({
    ...p,
    size: p.size === "big" ? ("big" as const) : ("small" as const),
  })) as ProjectData[];

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
      {projects.map((project) => (
        <WidgetCard key={project.id} project={project} />
      ))}
    </div>
  );
}
