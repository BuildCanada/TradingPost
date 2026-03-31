import { ImageResponse } from "next/og";
import { BuildCanadaOGImage } from "@/lib/og-image-template";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <BuildCanadaOGImage
      title="Canada's Voice for Builders"
      description="Bold thinking from builders, reformers, and leaders pushing Canada to new frontiers."
      label="Homepage"
    />,
    { ...size }
  );
}
