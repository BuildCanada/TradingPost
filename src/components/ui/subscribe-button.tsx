"use client";

import { useSubscribeStore } from "@/components/subscribe/store";
import { cn } from "@/lib/utils";

interface SubscribeButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "accent" | "secondary";
  className?: string;
  showArrow?: boolean;
  source?: "navbar" | "exit-intent" | "footer" | "inline";
}

export function SubscribeButton({
  children,
  variant = "secondary",
  className,
  showArrow = false,
  source = "inline",
}: SubscribeButtonProps) {
  const openModal = useSubscribeStore((s) => s.openModal);

  const baseStyles =
    "type-mono uppercase inline-flex items-center gap-2 py-4 px-5 border transition-colors";
  const textStyle = {
    fontSize: "clamp(.75rem, .571rem + .476vw, .9rem)",
  };

  const variants = {
    primary:
      "border-charcoal-900 text-bg bg-charcoal-900 hover:bg-dark hover:text-bg",
    accent:
      "border-accent text-white bg-accent hover:opacity-80 transition-opacity",
    secondary: "border-border-light text-dark hover:border-dark",
  };

  return (
    <button
      onClick={() => openModal(source)}
      className={cn(baseStyles, variants[variant], className)}
      style={textStyle}
    >
      {children}
      {showArrow && (
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path
            d="M4 12l8-8M6 4h6v6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
