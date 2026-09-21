import { ImageResponse } from "next/og";
import { ElectionOGImage, OG_SIZE, logoDataUri } from "../../election-og";
import { getToronto2026Candidate } from "../../data";

export const alt = "Toronto 2026 Election candidate — Build Canada";
export const size = OG_SIZE;
export const contentType = "image/png";

/* No generateStaticParams, deliberately — unlike the 25 ward images beside it.
   The ballot is 388 candidates, and prerendering a PNG for every one would put
   388 satori renders in the build for images that are only ever fetched when
   somebody shares that particular candidate. They render on demand and cache
   from then on. */

export default async function Image({
  params,
}: {
  params: Promise<{ candidate: string }>;
}) {
  const { candidate: slug } = await params;
  const [logoSrc, profile] = await Promise.all([
    logoDataUri(),
    getToronto2026Candidate(slug),
  ]);

  if (!profile) {
    return new ImageResponse(
      <ElectionOGImage
        title="Toronto 2026 Election"
        subtitle="Every race, tracked: the candidates for mayor and all 25 council wards."
        logoSrc={logoSrc}
      />,
      { ...size },
    );
  }

  const { candidate, races, wards } = profile;
  const ward = wards[0];
  const race = races[0];

  /* The ward locator earns its place here: for a council candidate it answers
     "is this my ward" before the reader has read the name. A mayoral candidate
     gets the whole map unfilled, because every ward is theirs. */
  return new ImageResponse(
    <ElectionOGImage
      kicker={
        ward
          ? `TORONTO 2026 · WARD ${ward.number} · ${race.seat.toUpperCase()}`
          : `TORONTO 2026 · ${race.seat.toUpperCase()}`
      }
      title={candidate.name}
      subtitle={
        ward
          ? `Registered to run for ${race.seat.toLowerCase()} in ${ward.name}.`
          : `Registered to run for ${race.seat.toLowerCase()} of Toronto.`
      }
      activeWard={ward?.n}
      logoSrc={logoSrc}
    />,
    { ...size },
  );
}
