import Image from "next/image";
import { ContentCard, type ContentCardTheme } from "./ContentCard";
import { type FeedItem, isValidImage, formatFeedDate } from "./types";

const THEME: ContentCardTheme = {
  bg: "#fffdf7",
  text: "#1a1a1a",
  muted: "#857e71",
  divider: "#e8e2d9",
  ctaBorder: "#1a1a1a",
  ctaText: "#1a1a1a",
  ctaHoverBg: "#FF6719",
  ctaHoverText: "#ffffff",
  ctaHoverBorder: "#FF6719",
};

function SubstackIcon({ size, opacity }: { size: number; opacity: number }) {
  return (
    <Image
      src="/assets/icons/substack-icon.svg"
      alt="Substack"
      width={size}
      height={size}
      style={{ opacity }}
      unoptimized
    />
  );
}

export function SubstackCard({ item }: { item: FeedItem }) {
  return (
    <ContentCard
      href={item.url || "/content"}
      external
      theme={THEME}
      top={
        isValidImage(item.image) ? (
          <div className="relative h-[90px]" style={{ backgroundColor: "#f7f5ef" }}>
            <Image
              src={item.image!}
              alt={item.title || ""}
              fill
              className="object-cover opacity-85 group-hover:opacity-100 transition-opacity"
            />
          </div>
        ) : null
      }
      label={{
        icon: <SubstackIcon size={12} opacity={0.6} />,
        text: "Weekly Newsletter",
      }}
      title={item.title}
      meta={formatFeedDate(item.createdAt)}
      footer={{
        brandIcon: <SubstackIcon size={16} opacity={0.25} />,
        ctaLabel: "Read",
      }}
    />
  );
}
