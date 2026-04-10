import Link from "next/link";
import Image from "next/image";
import { type FeedItem } from "./types";
import { SocialCardHeader } from "./SocialCardHeader";
import { FeedChevron } from "./FeedChevron";

const COLORS = {
  border: "#2f3336",
  headerBorder: "#2f3336",
  avatarBorder: "#333",
  text: "#e7e9ea",
  muted: "#71767b",
  bg: "black",
  buttonBorder: "#536471",
};

export function XCard({ item }: { item: FeedItem }) {
  return (
    <Link
      href={item.url || "/content"}
      target="_blank"
      rel="noopener noreferrer"
      className="border-b border-r border-border-light bg-black flex flex-col group overflow-hidden"
    >
      <SocialCardHeader
        item={item}
        platformIcon="/assets/icons/platform-x-twitter.svg"
        platformAlt="X"
        borderColor={COLORS.headerBorder}
        textColor={COLORS.text}
        mutedColor={COLORS.muted}
        avatarBorder={COLORS.avatarBorder}
      />

      <div className="px-5 py-4 flex flex-col gap-2 flex-1">
        <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] font-medium text-[#71767b]">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M4 4h16v12H5.17L4 17.17V4z" stroke="#71767b" strokeWidth="2" fill="none" strokeLinejoin="round" />
          </svg>
          Post
        </span>

        {item.body && (
          <p className="type-default text-[#e7e9ea] line-clamp-4 whitespace-pre-line">
            {item.body}
          </p>
        )}
      </div>

      <div className="px-5 py-3 flex items-center justify-between border-t border-[#2f3336]">
        <Image
          src="/assets/icons/platform-x-twitter.svg"
          alt="X"
          width={16}
          height={16}
          className="opacity-20"
          unoptimized
        />
        <span className="inline-flex items-center gap-2 type-label px-3 py-1 border border-[#536471] text-[#e7e9ea] group-hover:border-[#1d9bf0] group-hover:bg-[#1d9bf0] group-hover:text-white transition-all">
          See post
          <FeedChevron />
        </span>
      </div>
    </Link>
  );
}
