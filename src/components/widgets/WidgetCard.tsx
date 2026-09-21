"use client";

import Link from "next/link";
import registry from "./registry";
import WidgetPlaceholder from "./WidgetPlaceholder";
import { ProjectData } from "./types";

const INTERNAL_HREFS: Record<string, string> = {
  "outcomes-tracker": "/tracker",
};

function Arrow({ external }: { external: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      className={`shrink-0 transition-transform duration-200 ${
        external
          ? "group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5"
          : "group-hover/card:translate-x-1"
      }`}
    >
      <path
        d={external ? "M4 12l8-8M6 4h6v6" : "M3 8h10M9 4l4 4-4 4"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function WidgetCard({ project }: { project: ProjectData }) {
  const Widget = registry[project.slug];
  const isBig = project.featured;
  const internalHref = INTERNAL_HREFS[project.slug];

  const cardClasses = `group/card flex flex-col h-full border border-border-light hover:border-dark transition-colors ${
    isBig ? "min-h-[380px] md:min-h-[340px] md:col-span-2" : "min-h-[360px]"
  }`;

  const content = (
    <>
      <div className="flex-1">
        {Widget ? (
          <Widget project={project} />
        ) : (
          <WidgetPlaceholder project={project} />
        )}
      </div>
      <div className="border-t border-border-light">
        <span className="type-label inline-flex items-center gap-2 px-5 py-3 w-full justify-start text-dark transition-colors">
          View Project
          <Arrow external={!internalHref} />
        </span>
      </div>
    </>
  );

  if (internalHref) {
    return (
      <Link href={internalHref} className={cardClasses}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={project.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClasses}
    >
      {content}
    </a>
  );
}
