import { ImageResponse } from "next/og";
import { ElectionOGImage, OG_SIZE, logoDataUri } from "./election-og";

export const alt = "Toronto 2026 Election — Build Canada";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <ElectionOGImage
      title="Toronto 2026 Election"
      subtitle="Every race, tracked: the candidates for mayor and all 25 council wards."
      logoSrc={await logoDataUri()}
    />,
    { ...size },
  );
}
