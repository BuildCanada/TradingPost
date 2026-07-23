import { ImageResponse } from "next/og";
import { OG_SIZE, PledgeOGImage, stampDataUri } from "./og-template";

export const alt = "I pledge to vote — Toronto's 2026 municipal election";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <PledgeOGImage stampSrc={await stampDataUri()} />,
    { ...size },
  );
}
