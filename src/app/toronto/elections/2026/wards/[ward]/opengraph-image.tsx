import { ImageResponse } from "next/og";
import { ElectionOGImage, OG_SIZE } from "../../../electionOg";
import { findWardIndex, WARD_NUMBERS } from "../../data";
import { WARD_SHAPES } from "../../wardGeo";

export const alt = "A Toronto ward council race in the 2026 municipal election";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return WARD_NUMBERS.map((n) => ({ ward: n }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ ward: string }>;
}) {
  const { ward } = await params;
  const idx = findWardIndex(ward);
  const w = idx === -1 ? null : WARD_SHAPES[idx];

  return new ImageResponse(
    <ElectionOGImage
      kicker={w ? `WARD ${w.n} · CITY OF TORONTO` : "CITY OF TORONTO"}
      headline={w ? w.name : "Toronto's 2026 election."}
      subline="Who's running to represent your ward on council."
    />,
    { ...size },
  );
}
