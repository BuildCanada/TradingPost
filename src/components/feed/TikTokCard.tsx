import Link from "next/link";
import Image from "next/image";
import { type FeedItem } from "./types";
import { SocialCardHeader } from "./SocialCardHeader";
import { FeedChevron } from "./FeedChevron";

const COLORS = {
  border: "#2f2f2f",
  headerBorder: "#2f2f2f",
  avatarBorder: "#333",
  text: "#e1e1e2",
  muted: "#8a8b91",
  bg: "#121212",
};

export function TikTokCard({ item }: { item: FeedItem }) {
  return (
    <Link
      href={item.url || "/content"}
      target="_blank"
      rel="noopener noreferrer"
      className="border-b border-r border-border-light bg-[#121212] flex flex-col group overflow-hidden"
    >
      <SocialCardHeader
        item={item}
        platformIcon="/assets/icons/platform-tiktok.svg"
        platformAlt="TikTok"
        borderColor={COLORS.headerBorder}
        textColor={COLORS.text}
        mutedColor={COLORS.muted}
        avatarBorder={COLORS.avatarBorder}
      />

      <div className="px-3 py-3 flex flex-col gap-2 flex-1">
        <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] font-medium text-[#8a8b91]">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M8 5.14v13.72a1 1 0 001.5.86l11.24-6.86a1 1 0 000-1.72L9.5 4.28A1 1 0 008 5.14z" fill="#8a8b91" />
          </svg>
          Video
        </span>

        {item.body && (
          <p className="type-default text-[#e1e1e2] line-clamp-4">
            {item.body}
          </p>
        )}
      </div>

      <div className="px-3 py-2.5 flex items-center justify-between border-t border-[#2f2f2f]">
        <Image
          src="/assets/icons/platform-tiktok.svg"
          alt="TikTok"
          width={16}
          height={16}
          className="opacity-20"
          unoptimized
        />
        <span className="inline-flex items-center gap-2 type-label px-3 py-1 border border-[#444] text-[#e1e1e2] group-hover:border-[#fe2c55] group-hover:bg-[#fe2c55] group-hover:text-white transition-all">
          See post
          <FeedChevron />
        </span>
      </div>
    </Link>
  );
}
