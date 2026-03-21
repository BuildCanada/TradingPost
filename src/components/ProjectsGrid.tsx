"use client";

import { useEffect, useState } from "react";
import WidgetCard from "./widgets/WidgetCard";
import { ProjectData } from "./widgets/types";

function WidgetSkeleton({ big }: { big?: boolean }) {
  return (
    <div
      className={`border border-[var(--color-border-light)] p-4 ${
        big
          ? "min-h-[280px] md:min-h-[180px] md:col-span-2"
          : "min-h-[140px]"
      }`}
    >
      <div className="h-2.5 w-1/3 bg-[var(--color-border-light)] animate-pulse mb-3" />
      <div className="h-12 w-full bg-[var(--color-border-light)] animate-pulse opacity-50" />
    </div>
  );
}

export default function ProjectsGrid({
  featured,
  maxItems,
  filter,
}: {
  featured?: boolean;
  maxItems?: number;
  filter?: "featured" | "non-featured";
}) {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = featured ? "/api/projects?featured=true" : "/api/projects";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          let typed = data.map((d: Record<string, unknown>) => ({
            ...d,
            size: d.size === "big" ? "big" : "small",
          })) as ProjectData[];

          if (filter === "featured") {
            typed = typed.filter((p) => p.featured);
          } else if (filter === "non-featured") {
            typed = typed.filter((p) => !p.featured);
          }

          setProjects(maxItems ? typed.slice(0, maxItems) : typed);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [featured, maxItems, filter]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        <WidgetSkeleton />
        <WidgetSkeleton />
        <WidgetSkeleton big />
      </div>
    );
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
      {projects.map((project) => (
        <WidgetCard key={project.id} project={project} />
      ))}
    </div>
  );
}
