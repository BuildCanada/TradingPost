"use client";

import { cn } from "@/lib/utils";

interface LabelProps {
  text: string;
  href: string;
  isActive: boolean;
  level: 2 | 3;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function Label({ text, href, isActive, level, onClick }: LabelProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "block font-sans no-underline transition-colors duration-150 relative left-[4px]",
        level === 2 && "leading-[1.35]",
        level === 3 && "text-sm leading-[1.3]",
        isActive && "font-medium text-dark",
        !isActive && "font-normal text-charcoal-600 group-hover:text-dark",
      )}
    >
      {text}
    </a>
  );
}
