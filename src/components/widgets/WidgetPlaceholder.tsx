import Image from "next/image";
import { ProjectData } from "./types";

export default function WidgetPlaceholder({ project }: { project: ProjectData }) {
  if (project.imageUrl) {
    return (
      <div className="relative h-full min-h-[180px]">
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute bottom-0 left-0 p-8 lg:p-10">
          <span className="type-label font-bold text-white mb-1 block drop-shadow-md">
            {project.title}
          </span>
        </div>
      </div>
    );
  }

  const isBig = project.featured;

  return (
    <div className="p-8 lg:p-10 h-full flex flex-col">
      <span className="type-label font-bold text-text-secondary mb-3">
        {project.title}
      </span>
      {isBig ? (
        <>
          <div className="flex-1 flex items-end gap-1.5">
            {["55%", "80%", "65%", "100%", "45%", "70%", "90%", "50%"].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-border-light"
                style={{ height: h }}
              />
            ))}
          </div>
          {project.description && (
            <p className="type-body-sm text-text-secondary mt-3 line-clamp-1">
              {project.description}
            </p>
          )}
        </>
      ) : (
        <div className="flex-1 flex items-end gap-1">
          {["60%", "100%", "75%", "45%", "85%", "55%"].map((h, i) => (
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
