"use client";

import { Stream } from "@cloudflare/stream-react";

type HeroVideoProps = {
  videoId: string;
};

export function HeroVideo({ videoId }: HeroVideoProps) {
  return (
    <div className="absolute inset-0 overflow-hidden brightness-[0.35] pointer-events-none">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: "max(100%, 178vh)" }}
      >
        <Stream src={videoId} autoplay muted loop preload="auto" />
      </div>
    </div>
  );
}
