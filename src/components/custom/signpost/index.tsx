"use client";

import { useCallback, useMemo } from "react";
import type { SignpostProps } from "./config";
import { useScrollSpy, useReadingProgress } from "./hooks";
import { useBuildTree, useActiveParent, useActiveText } from "./utils";
import { SignpostProvider } from "./store";
import { MobileBar } from "./mobile-bar";
import { DesktopNav } from "./desktop-nav";

export function Signpost({ headings, shareTitle, shareUrl }: SignpostProps) {
  const activeId = useScrollSpy(headings);
  const progress = useReadingProgress();
  const tree = useBuildTree(headings);
  const activeParent = useActiveParent(activeId, headings);
  const activeText = useActiveText(activeId, headings);

  const readIds = useMemo(() => {
    if (!activeId) return new Set<string>();
    const idx = headings.findIndex((h) => h.id === activeId);
    if (idx < 0) return new Set<string>();
    return new Set(headings.slice(0, idx + 1).map((h) => h.id));
  }, [activeId, headings]);

  const navigateTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  if (headings.length === 0) return <div className="hidden 2xl-memo:block" aria-hidden="true" />;

  return (
    <SignpostProvider
      value={{
        headings,
        tree,
        activeId,
        activeParentId: activeParent?.id ?? null,
        activeText,
        readIds,
        progress,
        navigateTo,
        shareTitle,
        shareUrl,
      }}
    >
      <MobileBar />
      <DesktopNav />
    </SignpostProvider>
  );
}
