import { ImageResponse } from "next/og";
import { ElectionOGImage, OG_SIZE, logoDataUri } from "../election-og";

export const alt = "Vote by Mail in Toronto — Build Canada";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <ElectionOGImage
      title="Vote by Mail in Toronto"
      subtitle="Two deadlines: apply by Sept 24 at 4:30 p.m., and your ballot must arrive by noon on Oct 14 — received, not postmarked."
      logoSrc={await logoDataUri()}
    />,
    { ...size },
  );
}
