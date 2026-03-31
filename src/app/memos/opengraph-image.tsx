import { ImageResponse } from "next/og";
import { BuildCanadaOGImage } from "@/lib/og-image-template";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <BuildCanadaOGImage
      title="Policy Memos"
      description="Bold thinking from Canada's builders, reformers, and leaders. Read policy memos and ideas worth building on."
      label="Memos"
    />,
    { ...size }
  );
}
