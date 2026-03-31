import { ImageResponse } from "next/og";
import { BuildCanadaOGImage } from "@/lib/og-image-template";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <BuildCanadaOGImage
      title="About Build Canada"
      description="Platforming the bold — individuals, ideas, and reforms — that can push our country to new frontiers."
      label="About"
    />,
    { ...size }
  );
}
