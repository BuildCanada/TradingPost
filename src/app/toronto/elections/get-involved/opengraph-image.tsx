import { ImageResponse } from "next/og";
import { ElectionOGImage, OG_SIZE } from "../2026/election-og";

export const alt = "Get involved in Toronto's 2026 election — Build Canada";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <ElectionOGImage
      title="Get Involved"
      subtitle="Pledge to vote, register, volunteer, or donate — the Toronto you want doesn't vote itself in."
    />,
    { ...size },
  );
}
