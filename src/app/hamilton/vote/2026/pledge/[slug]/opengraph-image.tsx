import { ImageResponse } from "next/og";
import { resolvePledgeName } from "@/lib/elections/pledge-record";
import { OG_SIZE, PledgeOGImage, stampDataUri, logoDataUri } from "../og-template";

export const alt = "A pledge to vote in Hamilton's 2026 municipal election";
export const size = OG_SIZE;
export const contentType = "image/png";

/* Query params aren't available to OG image routes; the name resolves from
   the pledge record via the slug's share token, else from the slug itself. */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return new ImageResponse(
    <PledgeOGImage
      stampSrc={await stampDataUri()}
      name={await resolvePledgeName("hamilton-2026", slug)}
      logoSrc={await logoDataUri()}
    />,
    { ...size },
  );
}
