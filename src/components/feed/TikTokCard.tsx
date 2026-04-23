import Image from "next/image";
import { ContentCard, type ContentCardTheme } from "./ContentCard";
import { SocialCardHeader } from "./SocialCardHeader";
import { type FeedItem } from "./types";

const THEME: ContentCardTheme = {
  bg: "#121212",
  text: "#e1e1e2",
  muted: "#8a8b91",
  divider: "#2f2f2f",
  ctaBorder: "#444444",
  ctaText: "#e1e1e2",
  ctaHoverBg: "#fe2c55",
  ctaHoverText: "#ffffff",
  ctaHoverBorder: "#fe2c55",
};

export function TikTokCard({ item }: { item: FeedItem }) {
  return (
    <ContentCard
      href={item.url || "/content"}
      external
      theme={THEME}
      top={
        <SocialCardHeader
          item={item}
          platformIcon="/assets/icons/platform-tiktok.svg"
          platformAlt="TikTok"
          borderColor={THEME.divider}
          textColor={THEME.text}
          mutedColor={THEME.muted}
          avatarBorder="#333"
        />
      }
      label={{
        icon: (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path
              d="M8 5.14v13.72a1 1 0 001.5.86l11.24-6.86a1 1 0 000-1.72L9.5 4.28A1 1 0 008 5.14z"
              fill={THEME.muted}
            />
          </svg>
        ),
        text: "Video",
      }}
      body={
        item.body ? (
          <p className="line-clamp-4 whitespace-pre-line">{item.body}</p>
        ) : null
      }
      footer={{
        brandIcon: (
          <Image
            src="/assets/icons/platform-tiktok.svg"
            alt="TikTok"
            width={16}
            height={16}
            className="opacity-20"
            unoptimized
          />
        ),
        ctaLabel: "See post",
      }}
    />
  );
}
