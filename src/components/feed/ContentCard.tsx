import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { FeedChevron } from "./FeedChevron";

export interface ContentCardTheme {
  bg: string;
  text: string;
  muted: string;
  divider: string;
  ctaBorder: string;
  ctaText: string;
  ctaHoverBg: string;
  ctaHoverText: string;
  ctaHoverBorder?: string;
  titleHover?: string;
  ctaHoverClassName?: string;
}

export interface ContentCardProps {
  href: string;
  external?: boolean;
  theme: ContentCardTheme;
  top?: ReactNode;
  label?: { icon?: ReactNode; text: string };
  title?: string | null;
  body?: ReactNode;
  bodyClassName?: string;
  meta?: string | null;
  footer: { brandIcon: ReactNode; ctaLabel: string };
}

export function ContentCard({
  href,
  external,
  theme,
  top,
  label,
  title,
  body,
  bodyClassName,
  meta,
  footer,
}: ContentCardProps) {
  const ctaHoverBorder = theme.ctaHoverBorder ?? theme.ctaHoverBg;
  const titleHover = theme.titleHover ?? theme.ctaHoverBg;

  const cardStyle = {
    backgroundColor: theme.bg,
    ["--cc-title-hover" as string]: titleHover,
    ["--cc-cta-hover-bg" as string]: theme.ctaHoverBg,
    ["--cc-cta-hover-text" as string]: theme.ctaHoverText,
    ["--cc-cta-hover-border" as string]: ctaHoverBorder,
  } as CSSProperties;

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="border-b border-r border-border-light flex flex-col group overflow-hidden h-64"
      style={cardStyle}
    >
      {top}

      <div className="px-5 py-4 flex flex-col gap-2 flex-1 min-h-0">
        {label && (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] font-medium"
            style={{ color: theme.muted }}
          >
            {label.icon}
            {label.text}
          </span>
        )}

        {title && (
          <h3
            className="type-h4 transition-colors group-hover:text-[color:var(--cc-title-hover)]"
            style={{ color: theme.text }}
          >
            {title}
          </h3>
        )}

        {body && (
          <div
            className={`type-default ${bodyClassName ?? "line-clamp-4"}`}
            style={{ color: theme.text }}
          >
            {body}
          </div>
        )}

        {meta && (
          <span className="type-mono-sm mt-auto" style={{ color: theme.muted }}>
            {meta}
          </span>
        )}
      </div>

      <div
        className="px-5 py-3 flex items-center justify-between border-t"
        style={{ borderColor: theme.divider }}
      >
        {footer.brandIcon}
        <span
          className={`inline-flex items-center gap-2 type-label px-3 py-1 border transition-all group-hover:bg-[color:var(--cc-cta-hover-bg)] group-hover:text-[color:var(--cc-cta-hover-text)] group-hover:border-[color:var(--cc-cta-hover-border)] ${theme.ctaHoverClassName ?? ""}`}
          style={{
            borderColor: theme.ctaBorder,
            color: theme.ctaText,
          }}
        >
          {footer.ctaLabel}
          <FeedChevron />
        </span>
      </div>
    </Link>
  );
}
