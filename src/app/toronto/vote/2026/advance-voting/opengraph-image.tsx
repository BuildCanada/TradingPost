import { ImageResponse } from "next/og";
import { ElectionOGImage, OG_SIZE, logoDataUri } from "../election-og";

export const alt = "Advance Voting in Toronto — Build Canada";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <ElectionOGImage
      title="Advance Voting in Toronto"
      subtitle="Six days of early voting: Tuesday, October 6 to Sunday, October 11, 10 a.m. to 7 p.m. daily. No reason needed."
      logoSrc={await logoDataUri()}
    />,
    { ...size },
  );
}
