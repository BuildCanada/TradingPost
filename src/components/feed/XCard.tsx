import Image from "next/image";
import { ContentCard, type ContentCardTheme } from "./ContentCard";
import { SocialCardHeader } from "./SocialCardHeader";
import { type FeedItem } from "./types";

const THEME: ContentCardTheme = {
  bg: "#000000",
  text: "#e7e9ea",
  muted: "#71767b",
  divider: "#2f3336",
  ctaBorder: "#536471",
  ctaText: "#e7e9ea",
  ctaHoverBg: "#1d9bf0",
  ctaHoverText: "#ffffff",
  ctaHoverBorder: "#1d9bf0",
};

export function XCard({ item }: { item: FeedItem }) {
  return (
    <ContentCard
      href={item.url || "/content"}
      external
      theme={THEME}
      top={
        <SocialCardHeader
          item={item}
          platformIcon="/assets/icons/platform-x-twitter.svg"
          platformAlt="X"
          borderColor={THEME.divider}
          textColor={THEME.text}
          mutedColor={THEME.muted}
          avatarBorder="#333"
        />
      }
      body={
        item.body ? (
          <p
            className="font-display font-medium line-clamp-4 whitespace-pre-line"
            style={{ letterSpacing: "-0.02em" }}
          >
            {item.body}
          </p>
        ) : null
      }
      footer={{
        brandIcon: (
          <Image
            src="/assets/icons/platform-x-twitter.svg"
            alt="X"
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
