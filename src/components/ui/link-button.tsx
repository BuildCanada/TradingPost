import { Button } from "@/components/ui/button";

const variantMap = {
  primary: "charcoal",
  accent: "auburn",
  secondary: "ghost",
} as const;

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "accent" | "secondary";
  className?: string;
}

export function LinkButton({
  href,
  children,
  variant = "secondary",
  className,
}: LinkButtonProps) {
  const isExternal = href.startsWith("http");

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
