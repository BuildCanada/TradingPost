import Image from "next/image";
import { type FeedItem, formatFeedDate } from "./types";

interface SocialCardHeaderProps {
  item: FeedItem;
  platformIcon: string;
  platformAlt: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
  avatarBorder: string;
}

export function SocialCardHeader({
  item,
  platformIcon,
  platformAlt,
  borderColor,
  textColor,
  mutedColor,
  avatarBorder,
}: SocialCardHeaderProps) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-3 border-b" style={{ borderColor }}>
      <div
        className="w-8 h-8 overflow-hidden shrink-0"
        style={{ border: `2px solid ${avatarBorder}` }}
      >
        <Image
          src="/assets/logos/Logocircle.webp"
          alt="Build Canada"
          width={32}
          height={32}
          className="object-cover"
        />
      </div>
      <div className="flex flex-col min-w-0">
        <span
          className="font-display text-[14px] font-medium leading-tight"
          style={{ color: textColor, letterSpacing: "-0.02em" }}
        >
          @build_canada
        </span>
        <span className="type-mono-sm leading-tight" style={{ color: mutedColor }}>
          {formatFeedDate(item.createdAt)}
        </span>
      </div>
      <div className="ml-auto shrink-0">
        <Image
          src={platformIcon}
          alt={platformAlt}
          width={14}
          height={14}
          className="opacity-50"
          unoptimized
        />
      </div>
    </div>
  );
}
