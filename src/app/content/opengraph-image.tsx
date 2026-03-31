import { ImageResponse } from "next/og";
import { BuildCanadaOGImage } from "@/lib/og-image-template";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <BuildCanadaOGImage
      title="Content Feed"
      description="Follow Build Canada across all platforms. Aggregated posts from X, TikTok, Instagram, Substack, and more."
      label="Content"
    />,
    { ...size }
  );
}
