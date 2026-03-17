import Image from "next/image";

const ICONS: Record<string, string> = {
  X: "/assets/icons/Platform=X (Twitter), Color=Negative.svg",
  TIKTOK: "/assets/icons/Platform=TikTok, Color=Negative.svg",
  IG: "/assets/icons/Platform=Instagram, Color=Negative.svg",
  SUBSTACK: "/assets/icons/substack-icon (1).svg",
  YOUTUBE: "/assets/icons/Platform=YouTube, Color=Negative.svg",
  LINKEDIN: "/assets/icons/Platform=LinkedIn, Color=Negative.svg",
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
