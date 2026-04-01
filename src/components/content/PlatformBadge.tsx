import Image from "next/image";

export function PlatformBadge({ type }: { type: string }) {
  const label =
    type === "SUBSTACK"
      ? "Substack"
      : type === "BLOG"
        ? "Blog"
        : type === "TIKTOK"
          ? "TikTok"
          : type === "IG"
            ? "IG"
            : type;
  const hasSocialIcon = ["X", "TIKTOK", "IG", "SUBSTACK", "YOUTUBE"].includes(
    type
  );
  const iconFile =
    type === "X"
      ? "platform-x-twitter"
      : type === "TIKTOK"
        ? "platform-tiktok"
        : type === "IG"
          ? "platform-instagram"
          : type === "SUBSTACK"
            ? "substack-icon"
            : "platform-youtube";
  return (
    <span className="bg-bg/80 text-dark px-1.5 py-0.5 flex items-center gap-1">
      {hasSocialIcon && (
        <Image
          src={`/assets/icons/${iconFile}.svg`}
          alt={type}
          width={10}
          height={10}
          className="brightness-0 opacity-70"
          unoptimized
        />
      )}
      <span className="type-label-sm">{label}</span>
    </span>
  );
}
