import { ProjectData } from "./types";

export default function WidgetPlaceholder({ project }: { project: ProjectData }) {
  const isBig = project.featured;

  return (
    <div className="p-4 h-full flex flex-col">
      <span className="type-label text-[var(--color-text-secondary)] text-[10px] mb-2">
        {project.title}
      </span>
      {isBig ? (
        <>
          <div className="flex-1 flex items-end gap-1.5">
            {["55%", "80%", "65%", "100%", "45%", "70%", "90%", "50%"].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-[var(--color-border-light)]"
                style={{ height: h }}
              />
            ))}
          </div>
          {project.description && (
            <p className="type-caption text-[var(--color-text-secondary)] mt-2 line-clamp-1">
              {project.description}
            </p>
          )}
        </>
      ) : (
        <div className="flex-1 flex items-end gap-1">
          {["60%", "100%", "75%", "45%", "85%", "55%"].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-[var(--color-border-light)]"
              style={{ height: h }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
