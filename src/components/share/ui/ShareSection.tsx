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
      <h2 className="type-label text-text-secondary block m-0">
        Share
      </h2>
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
