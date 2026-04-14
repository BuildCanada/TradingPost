"use client";

import { ShareButtons } from "./ShareButtons";

interface ShareSectionProps {
  title: string;
  url: string;
}

export function ShareSection({ title, url }: ShareSectionProps) {
  return (
    <div className="space-y-3">
      <h2 className="type-label text-text-secondary block m-0">
        Share
      </h2>
      <ShareButtons title={title} url={url} />
    </div>
  );
}
