import { ImageResponse } from "next/og";
import { ElectionOGImage, OG_SIZE, logoDataUri } from "../../election-og";
import { WARD_NUMBERS, getToronto2026 } from "../../data";

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
  const logoSrc = await logoDataUri();
  const w = (await getToronto2026()).wards.find(
    (candidate) => candidate.number === parseInt(ward, 10),
  );

  if (!w) {
    return new ImageResponse(
      <ElectionOGImage
        title="Toronto 2026 Election"
        subtitle="Every race, tracked: the candidates for mayor and all 25 council wards."
        logoSrc={logoSrc}
      />,
      { ...size },
    );
  }

  const subtitle =
    w.count === 0
      ? `No candidates registered yet for councillor in Ward ${w.number}.`
      : `${w.count} candidate${w.count === 1 ? "" : "s"} registered to run for councillor in Ward ${w.number}.`;

  return new ImageResponse(
    <ElectionOGImage
      kicker={`TORONTO 2026 ELECTION · WARD ${w.number}`}
      title={w.name}
      subtitle={subtitle}
      activeWard={w.n}
      logoSrc={logoSrc}
    />,
    { ...size },
  );
}
