"use client";

import { usePathname } from "next/navigation";

export default function ThemeShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isToronto = pathname?.startsWith("/toronto") ?? false;

  return (
    <div
      className={`${isToronto ? "theme-toronto " : ""}bg-bg border-x-2 border-b-2 border-border`}
    >
      {children}
    </div>
  );
}
