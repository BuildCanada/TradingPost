"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ThemeShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isToronto = pathname?.startsWith("/toronto") ?? false;

  // Dialogs portal into <body>, outside this wrapper — mirror the theme class
  // on <html> so they (and the body background) inherit the Toronto palette.
  useEffect(() => {
    document.documentElement.classList.toggle("theme-toronto", isToronto);
  }, [isToronto]);

  return (
    <div
      className={`${isToronto ? "theme-toronto " : ""}bg-bg border-x-2 border-b-2 border-border`}
    >
      {children}
    </div>
  );
}
