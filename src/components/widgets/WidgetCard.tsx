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
      className={`flex flex-col h-full group border border-[var(--color-border-light)] hover:border-[var(--color-dark)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-dark)] ${
        isBig
          ? "min-h-[280px] md:min-h-[180px] md:col-span-2"
          : "min-h-[200px]"
      }`}
    >
      <div className="flex-1">
        {Widget ? (
          <Widget project={project} />
        ) : (
          <WidgetPlaceholder project={project} />
        )}
      </div>
      <div className="border-t border-[var(--color-border-light)] px-8 lg:px-10 py-4 flex items-center gap-2 group/cta">
        <span className="type-label text-[var(--color-text-secondary)] group-hover/cta:text-[var(--color-accent)] transition-colors">
          View Project
        </span>
        <svg
          className="w-4 h-4 text-[var(--color-text-secondary)] group-hover/cta:text-[var(--color-accent)] group-hover/cta:translate-x-1 transition-all"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </a>
  );
}
