import Image from "next/image";
import { ContentCard, type ContentCardTheme } from "./ContentCard";
import { SocialCardHeader } from "./SocialCardHeader";
import { type FeedItem, isIGVideo } from "./types";

const THEME: ContentCardTheme = {
  bg: "#ffffff",
  text: "#262626",
  muted: "#8e8e8e",
  divider: "#efefef",
  ctaBorder: "#262626",
  ctaText: "#262626",
  ctaHoverBg: "#C13584",
  ctaHoverText: "#ffffff",
  ctaHoverBorder: "transparent",
  titleHover: "#C13584",
  ctaHoverClassName:
    "group-hover:bg-gradient-to-r group-hover:from-[#833AB4] group-hover:via-[#C13584] group-hover:to-[#F77737]",
};

export function IGCard({ item }: { item: FeedItem }) {
  const video = isIGVideo(item);

  return (
    <ContentCard
      href={item.url || "/content"}
      external
      theme={THEME}
      top={
        <SocialCardHeader
          item={item}
          platformIcon="/assets/icons/platform-instagram.svg"
          platformAlt="Instagram"
          borderColor={THEME.divider}
          textColor={THEME.text}
          mutedColor={THEME.muted}
          avatarBorder="var(--color-accent)"
        />
      }
      label={{
        icon: video ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path
              d="M8 5.14v13.72a1 1 0 001.5.86l11.24-6.86a1 1 0 000-1.72L9.5 4.28A1 1 0 008 5.14z"
              fill={THEME.muted}
            />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
              stroke={THEME.muted}
              strokeWidth="2"
              fill="none"
            />
            <circle cx="8.5" cy="8.5" r="1.5" fill={THEME.muted} />
            <path
              d="M21 15l-5-5L5 21"
              stroke={THEME.muted}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        ),
        text: video ? "Video" : "Photo",
      }}
      body={
        item.body ? (
          <p className="line-clamp-4 whitespace-pre-line">
            <span
              className="font-display font-medium"
              style={{ letterSpacing: "-0.02em" }}
            >
              @build_canada
            </span>{" "}
            {item.body}
          </p>
        ) : null
      }
      footer={{
        brandIcon: (
          <Image
            src="/assets/icons/platform-instagram.svg"
            alt="Instagram"
            width={16}
            height={16}
            className="brightness-0 opacity-30"
            unoptimized
          />
        ),
        ctaLabel: "See post",
      }}
    />
  );
}
