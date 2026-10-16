import { ImageResponse } from "next/og";
import { ElectionOGImage, OG_SIZE, logoDataUri } from "../vote/2026/election-og";

export const alt = "Build the Vote: volunteer on Toronto's Election Day — Build Canada";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <ElectionOGImage
      title="Build the Vote"
      subtitle="Give two hours on October 26 to help a candidate who shares your values win their race."
      logoSrc={await logoDataUri()}
    />,
    { ...size },
  );
}
