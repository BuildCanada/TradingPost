import { Button } from "@/components/ui/button";

const variantMap = {
  primary: "charcoal",
  accent: "auburn",
  secondary: "ghost",
  light: "linen",
  "light-ghost": "linen-ghost",
} as const;

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "accent" | "secondary" | "light" | "light-ghost";
  className?: string;
}

export function LinkButton({
  href,
  children,
  variant = "secondary",
  className,
}: LinkButtonProps) {
  // mailto:/tel: are not routes — sending them through next/link makes it try
  // to navigate them. They take the anchor path, like http(s) links do.
  const isExternal = /^(https?:|mailto:|tel:)/.test(href);

  return (
    <Button
      as={isExternal ? "external-link" : "link"}
      href={href}
      variant={variantMap[variant]}
      className={className}
    >
      {children}
    </Button>
  );
}
