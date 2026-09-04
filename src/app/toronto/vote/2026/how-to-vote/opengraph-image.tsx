import { ImageResponse } from "next/og";
import { ElectionOGImage, OG_SIZE, logoDataUri } from "../election-og";

export const alt = "How to Vote in Toronto — Build Canada";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <ElectionOGImage
      title="How to Vote in Toronto"
      subtitle="Who can vote, what ID to bring, and the four ways to cast a ballot in 2026."
      logoSrc={await logoDataUri()}
    />,
    { ...size },
  );
}
