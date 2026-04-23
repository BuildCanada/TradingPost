import Image from "next/image";
import { ContentCard, type ContentCardTheme } from "./ContentCard";
import { type FeedItem, feedImage, itemHref, stripHtml, formatFeedDate } from "./types";

const THEME: ContentCardTheme = {
  bg: "var(--color-bg)",
  text: "var(--color-dark)",
  muted: "var(--color-text-secondary)",
  divider: "var(--color-border-light)",
  ctaBorder: "var(--color-dark)",
  ctaText: "var(--color-dark)",
  ctaHoverBg: "var(--color-dark)",
  ctaHoverText: "var(--color-bg)",
  ctaHoverBorder: "var(--color-dark)",
  titleHover: "var(--color-accent)",
};

const MUTED = "var(--color-text-secondary)";

function MemoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 3h9l4 4v14H6z"
        stroke={MUTED}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
      <path d="M14 3v5h5" stroke={MUTED} strokeWidth="2" fill="none" strokeLinejoin="round" />
      <path d="M9 13h7M9 17h5" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MemoCard({ item }: { item: FeedItem }) {
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
      label={{ icon: <MemoIcon />, text: "Memo" }}
      title={item.title}
      body={
        item.body ? (
          <span style={{ color: "var(--color-text-secondary)" }}>
            {stripHtml(item.body)}
          </span>
        ) : null
      }
      bodyClassName="line-clamp-2"
      meta={item.createdAt ? formatFeedDate(item.createdAt) : null}
      footer={{
        brandIcon: <MemoIcon />,
        ctaLabel: "Read memo",
      }}
    />
  );
}
