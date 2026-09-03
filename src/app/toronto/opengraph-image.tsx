import { ImageResponse } from "next/og";
import {
  ElectionOGImage,
  OG_SIZE,
  logoDataUri,
} from "./vote/2026/election-og";

export const alt = "Build Canada Toronto";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <ElectionOGImage
      kicker="A BUILD CANADA PUBLICATION"
      title="Build the Toronto you know is possible."
      subtitle="Complete 2026 election coverage, and bold ideas for a better city."
      logoSrc={await logoDataUri()}
      footerRight="BUILDCANADA.COM/TORONTO"
    />,
    { ...size },
  );
}
