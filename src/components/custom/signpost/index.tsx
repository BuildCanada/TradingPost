"use client";

import { useCallback, useMemo } from "react";
import type { SignpostProps } from "./config";
import { useScrollSpy, useReadingProgress } from "./hooks";
import { useBuildTree, useActiveParent, useActiveText } from "./utils";
import { SignpostProvider } from "./store";
import { MobileBar } from "./mobile-bar";
import { DesktopNav } from "./desktop-nav";

export function Signpost({
  headings,
  shareTitle,
  shareUrl,
  afterShare,
  desktopTopClass,
  scrollOffset = 120,
  showMobileBar = true,
  showTopBorder,
}: SignpostProps) {
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

  const navigateTo = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - scrollOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      // Reflect the target in the URL so the reader can share a deep link,
      // without triggering the browser's own hash jump.
      history.replaceState(null, "", `#${id}`);
    },
    [scrollOffset],
  );

  if (headings.length === 0 && !afterShare)
    return <div className="hidden 2xl-memo:block" aria-hidden="true" />;

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
      {showMobileBar && <MobileBar />}
      <DesktopNav afterShare={afterShare} topClass={desktopTopClass} showTopBorder={showTopBorder} />
    </SignpostProvider>
  );
}
