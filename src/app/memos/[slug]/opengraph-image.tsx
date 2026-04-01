import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { BuildCanadaOGImage } from "@/lib/og-image-template";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const memo = await prisma.memo.findUnique({ where: { slug }, include: { author: true } });

  return new ImageResponse(
    <BuildCanadaOGImage
      title={memo?.title || "Policy Memo"}
      description={memo?.keyMessage1 || undefined}
      badge={memo?.author?.name || undefined}
      label="Policy Memo"
    />,
    { ...size }
  );
}
