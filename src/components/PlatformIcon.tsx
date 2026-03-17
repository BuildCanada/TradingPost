import Image from "next/image";

const ICONS: Record<string, string> = {
  X: "/assets/icons/platform-x-twitter.svg",
  TIKTOK: "/assets/icons/platform-tiktok.svg",
  IG: "/assets/icons/platform-instagram.svg",
  SUBSTACK: "/assets/icons/substack-icon.svg",
  YOUTUBE: "/assets/icons/platform-youtube.svg",
  LINKEDIN: "/assets/icons/platform-linkedin.svg",
};

const LABELS: Record<string, string> = {
  X: "X",
  TIKTOK: "TikTok",
  IG: "Instagram",
  SUBSTACK: "Substack",
  YOUTUBE: "YouTube",
  LINKEDIN: "LinkedIn",
  BLOG: "Blog",
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
