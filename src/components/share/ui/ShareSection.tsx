"use client";

import { ShareButtons } from "./ShareButtons";
import { OGPreview } from "./OGPreview";

interface ShareSectionProps {
  title: string;
  description: string;
  image?: string;
  url: string;
}

export function ShareSection({
  title,
  description,
  image,
  url,
}: ShareSectionProps) {
  return (
    <div className="space-y-3">
      <span className="type-label text-[var(--color-text-secondary)] block">
        Share
      </span>
      <ShareButtons title={title} url={url} />
      <OGPreview
        title={title}
        description={description}
        image={image}
        url={url}
      />
    </div>
  );
}
