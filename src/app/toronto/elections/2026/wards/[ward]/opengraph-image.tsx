import { ImageResponse } from "next/og";
import { ElectionOGImage, OG_SIZE } from "../../election-og";
import { WARD_NUMBERS, findWardIndex, getWards } from "../../data";

export const alt = "Toronto 2026 Election ward race — Build Canada";
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

  if (idx === -1) {
    return new ImageResponse(
      <ElectionOGImage
        title="Toronto 2026 Election"
        subtitle="Every race, tracked: the candidates for mayor and all 25 council wards."
      />,
      { ...size },
    );
  }

  const w = (await getWards())[idx];
  const subtitle =
    w.count === 0
      ? `No candidates registered yet for councillor in Ward ${Number(w.n)}.`
      : `${w.count} candidate${w.count === 1 ? "" : "s"} registered to run for councillor in Ward ${Number(w.n)}.`;

  return new ImageResponse(
    <ElectionOGImage
      kicker={`TORONTO 2026 ELECTION · WARD ${Number(w.n)}`}
      title={w.name}
      subtitle={subtitle}
      activeWard={w.n}
    />,
    { ...size },
  );
}
