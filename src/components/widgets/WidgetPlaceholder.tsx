import Image from "next/image";
import { ProjectData } from "./types";

export default function WidgetPlaceholder({ project }: { project: ProjectData }) {
  return (
    <div className="p-8 lg:p-10 h-full flex flex-col">
      <span className="type-label font-bold text-text-secondary">
        {project.title}
      </span>
      {project.description && (
        <p className="type-body-sm text-text-secondary mt-2">
          {project.description}
        </p>
      )}
      {project.imageUrl ? (
        <div className="relative flex-1 mt-4 min-h-[200px]">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover object-top"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex-1 flex items-end gap-1.5 mt-4">
          {["55%", "80%", "65%", "100%", "45%", "70%", "90%", "50%"].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-border-light"
              style={{ height: h }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
