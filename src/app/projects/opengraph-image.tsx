import { ImageResponse } from "next/og";
import { BuildCanadaOGImage } from "@/lib/og-image-template";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <BuildCanadaOGImage
      title="Projects"
      description="Transparent government data and better tools for pro-growth voices."
      label="Projects"
    />,
    { ...size }
  );
}
