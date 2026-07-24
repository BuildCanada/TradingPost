import { ImageResponse } from "next/og";
import { ElectionOGImage, OG_SIZE } from "../electionOg";

export const alt = "Toronto's 2026 municipal election — tracking every race";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <ElectionOGImage
      headline="Toronto's 2026 election."
      subline="Every race for mayor and all 25 council wards."
    />,
    { ...size },
  );
}
