import { ImageResponse } from "next/og";
import { fetchFeedItem } from "@/lib/api";
import { BuildCanadaOGImage } from "@/lib/og-image-template";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let item;
  try {
    item = await fetchFeedItem(id);
  } catch {
    item = null;
  }

  return new ImageResponse(
    <BuildCanadaOGImage
      title={item?.title || "Post"}
      description={item?.subtitle || undefined}
      badge={item?.author || undefined}
      label={item?.type === "BLOG" ? "Blog" : "Post"}
    />,
    { ...size }
  );
}
