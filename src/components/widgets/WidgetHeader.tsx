import { ProjectData } from "./types";

export default function WidgetHeader({
  project,
  heading,
  description,
}: {
  project: ProjectData;
  heading?: string;
  description?: string;
}) {
  const desc = description ?? project.description;

  return (
    <div>
      <span className="type-label font-bold text-[var(--color-text-secondary)]">
        {project.title}
      </span>
      {heading && (
        <h3 className="font-display text-[1.25rem] lg:text-[1.5rem] font-normal leading-[1.2] text-[var(--color-dark)] mt-2">
          {heading}
        </h3>
      )}
      {desc && (
        <p className="type-body-sm text-[var(--color-text-secondary)] mt-2">
          {desc}
        </p>
      )}
    </div>
  );
}
