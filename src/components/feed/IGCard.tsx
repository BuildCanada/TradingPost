import Link from "next/link";
import Image from "next/image";
import { type FeedItem, isIGVideo } from "./types";
import { SocialCardHeader } from "./SocialCardHeader";
import { FeedChevron } from "./FeedChevron";

const COLORS = {
  border: "#dbdbdb",
  headerBorder: "#efefef",
  avatarBorder: "var(--color-accent)",
  text: "#262626",
  muted: "#8e8e8e",
  bg: "white",
};

export function IGCard({ item }: { item: FeedItem }) {
  return (
    <Link
      href={item.url || "/content"}
      target="_blank"
      rel="noopener noreferrer"
      className="border-b border-r border-border-light flex flex-col group overflow-hidden h-64"
      style={{ backgroundColor: COLORS.bg }}
    >
      <SocialCardHeader
        item={item}
        platformIcon="/assets/icons/platform-instagram.svg"
        platformAlt="Instagram"
        borderColor={COLORS.headerBorder}
        textColor={COLORS.text}
        mutedColor={COLORS.muted}
        avatarBorder={COLORS.avatarBorder}
      />

      <div className="px-5 py-4 flex flex-col gap-2 flex-1">
        <span
          className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] font-medium"
          style={{ color: COLORS.muted }}
        >
          {isIGVideo(item) ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M8 5.14v13.72a1 1 0 001.5.86l11.24-6.86a1 1 0 000-1.72L9.5 4.28A1 1 0 008 5.14z" fill={COLORS.muted} />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke={COLORS.muted} strokeWidth="2" fill="none" />
              <circle cx="8.5" cy="8.5" r="1.5" fill={COLORS.muted} />
              <path d="M21 15l-5-5L5 21" stroke={COLORS.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          )}
          {isIGVideo(item) ? "Video" : "Photo"}
        </span>

        {item.body && (
          <p className="type-default line-clamp-4 whitespace-pre-line" style={{ color: COLORS.text }}>
            <span className="font-display font-medium" style={{ letterSpacing: "-0.02em" }}>
              @build_canada
            </span>{" "}
            {item.body}
          </p>
        )}
      </div>

      <div
        className="px-5 py-3 flex items-center justify-between border-t"
        style={{ borderColor: COLORS.headerBorder }}
      >
        <Image
          src="/assets/icons/platform-instagram.svg"
          alt="Instagram"
          width={16}
          height={16}
          className="brightness-0 opacity-30"
          unoptimized
        />
        <span className="inline-flex items-center gap-2 type-label px-3 py-1 border border-[#262626] text-[#262626] bg-white group-hover:border-transparent group-hover:text-white group-hover:bg-gradient-to-r group-hover:from-[#833AB4] group-hover:via-[#C13584] group-hover:to-[#F77737] transition-all">
          See post
          <FeedChevron />
        </span>
      </div>
    </Link>
  );
}
