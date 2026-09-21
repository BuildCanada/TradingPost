import { ImageResponse } from "next/og";
import { ElectionOGImage, OG_SIZE, logoDataUri } from "../election-og";

export const alt = "When Is the Toronto Election? — Build Canada";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <ElectionOGImage
      title="When Is the Toronto Election?"
      subtitle="Monday, October 26, 2026 · advance voting Oct 6–11 · apply to vote by mail by Sept 24."
      logoSrc={await logoDataUri()}
    />,
    { ...size },
  );
}
