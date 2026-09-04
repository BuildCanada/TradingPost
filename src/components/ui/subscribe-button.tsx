"use client";

import {
  useSubscribeStore,
  type SubscribeSource,
} from "@/components/subscribe/store";
import { Button } from "@/components/ui/button";

const variantMap = {
  primary: "charcoal",
  accent: "auburn",
  secondary: "ghost",
  light: "linen",
  "light-ghost": "linen-ghost",
} as const;

interface SubscribeButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "accent" | "secondary" | "light" | "light-ghost";
  className?: string;
  source?: SubscribeSource;
}

export function SubscribeButton({
  children,
  variant = "secondary",
  className,
  source = "inline",
}: SubscribeButtonProps) {
  const openModal = useSubscribeStore((s) => s.openModal);

  return (
    <Button
      as="button"
      onClick={() => openModal(source)}
      variant={variantMap[variant]}
      className={className}
    >
      {children}
    </Button>
  );
}
