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

  /* Modals (pledge, residency, subscribe) portal to document.body, so they sit
     outside the wrapper below. Mirror the theme onto <html> so those portals
     inherit the Toronto palette instead of the site's auburn/linen one. */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-toronto", isToronto);
    return () => root.classList.remove("theme-toronto");
  }, [isToronto]);

  return (
    <div
      className={`${isToronto ? "theme-toronto " : ""}bg-bg border-x-2 border-b-2 border-border`}
    >
      {children}
    </div>
  );
}
