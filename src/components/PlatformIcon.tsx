import Image from "next/image";
import { Newspaper, Bookmark, Wrench } from "lucide-react";

const ICONS: Record<string, string> = {
  X: "/assets/icons/platform-x-twitter.svg",
  TIKTOK: "/assets/icons/platform-tiktok.svg",
  IG: "/assets/icons/platform-instagram.svg",
  SUBSTACK: "/assets/icons/substack-icon.svg",
  YOUTUBE: "/assets/icons/platform-youtube.svg",
  LINKEDIN: "/assets/icons/platform-linkedin.svg",
};

const LUCIDE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  BLOG: Newspaper,
  MEMO: Bookmark,
  BUILDER: Wrench,
};

const LABELS: Record<string, string> = {
  X: "X",
  TIKTOK: "TikTok",
  IG: "Instagram",
  SUBSTACK: "Substack",
  YOUTUBE: "YouTube",
  LINKEDIN: "LinkedIn",
  BLOG: "Blog",
  MEMO: "Memo",
  BUILDER: "Builder",
};

export function PlatformIcon({
  type,
  size = 14,
  className = "",
}: {
  type: string;
  size?: number;
  className?: string;
}) {
  const LucideIcon = LUCIDE_ICONS[type];
  if (LucideIcon) return <LucideIcon size={size} className={className} />;
  const src = ICONS[type];
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={LABELS[type] || type}
      width={size}
      height={size}
      className={className}
      unoptimized
    />
  );
}

export function platformLabel(type: string): string {
  return LABELS[type] || type;
}
