import Image from "next/image";
import { ContentCard, type ContentCardTheme } from "./ContentCard";
import { type FeedItem, feedImage, itemHref, formatFeedDate } from "./types";

const THEME: ContentCardTheme = {
  bg: "var(--color-bg)",
  text: "var(--color-dark)",
  muted: "var(--color-text-secondary)",
  divider: "var(--color-border-light)",
  ctaBorder: "var(--color-dark)",
  ctaText: "var(--color-dark)",
  ctaHoverBg: "var(--color-accent)",
  ctaHoverText: "var(--color-bg)",
  ctaHoverBorder: "var(--color-accent)",
  titleHover: "var(--color-accent)",
};

const MUTED = "var(--color-text-secondary)";

function BuilderIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 21V7l8-4 8 4v14"
        stroke={MUTED}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="M9 21v-6h6v6"
        stroke={MUTED}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BuilderCard({ item }: { item: FeedItem }) {
  const img = feedImage(item);
  const isLogo = img === "/assets/logos/logo-standard.svg";

  return (
    <ContentCard
      href={itemHref(item)}
      theme={THEME}
      top={
        <div className="relative h-[90px] bg-dark">
          {img && (
            <Image
              src={img}
              alt={item.title || ""}
              fill
              className={
                isLogo
                  ? "object-contain p-5 opacity-80 group-hover:opacity-95 transition-opacity"
                  : "object-cover opacity-70 group-hover:opacity-85 transition-opacity"
              }
            />
          )}
        </div>
      }
      label={{ icon: <BuilderIcon />, text: "Great Canadian Builder" }}
      title={item.title}
      body={
        item.subtitle ? (
          <span style={{ color: "var(--color-text-secondary)" }}>
            {item.subtitle}
          </span>
        ) : null
      }
      bodyClassName="line-clamp-2"
      meta={item.createdAt ? formatFeedDate(item.createdAt) : null}
      footer={{
        brandIcon: <BuilderIcon />,
        ctaLabel: "Read profile",
      }}
    />
  );
}
