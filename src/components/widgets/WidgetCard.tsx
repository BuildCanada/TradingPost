"use client";

import { Button } from "@/components/ui/button";
import registry from "./registry";
import WidgetPlaceholder from "./WidgetPlaceholder";
import { ProjectData } from "./types";

export default function WidgetCard({ project }: { project: ProjectData }) {
  const Widget = registry[project.slug];
  const isBig = project.featured;

  return (
    <div
      className={`flex flex-col h-full border border-border-light hover:border-dark transition-colors ${
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
      <div className="border-t border-border-light">
        <Button
          as="external-link"
          href={project.externalUrl}
          variant="ghost"
          className="border-0 w-full justify-start"
        >
          View Project
        </Button>
      </div>
    </div>
  );
}
