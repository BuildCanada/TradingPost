import { ImageResponse } from "next/og";
import { ElectionOGImage, OG_SIZE } from "../electionOg";

export const alt = "Get involved in Toronto's 2026 municipal election";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <ElectionOGImage
      headline="Get involved."
      subline="Pledge to vote, register, volunteer, or donate."
    />,
    { ...size },
  );
}
