"use client";

import registry from "./registry";
import WidgetPlaceholder from "./WidgetPlaceholder";
import { ProjectData } from "./types";

export default function WidgetCard({ project }: { project: ProjectData }) {
  const Widget = registry[project.slug];
  const isBig = project.featured;

  return (
    <a
      href={project.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`border border-[var(--color-border-light)] block group hover:border-[var(--color-dark)] transition-colors ${
        isBig
          ? "min-h-[280px] md:min-h-[180px] md:col-span-2"
          : "min-h-[140px]"
      }`}
    >
      {Widget ? (
        <Widget project={project} />
      ) : (
        <WidgetPlaceholder project={project} />
      )}
    </a>
  );
}
