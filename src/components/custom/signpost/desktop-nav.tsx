"use client";

import type { ReactNode } from "react";
import { useRef, useEffect, useCallback } from "react";
import type { TocItem as TocItemType } from "./config";
import { useSignpost } from "./store";
import { Track } from "./track";
import { Indicator } from "./progress-tracker";
import { TocTree } from "./toc-tree";
import { ShareButtons } from "@/components/share/ui/ShareButtons";

export function DesktopNav({
  topClass = "top-[90px]",
  showTopBorder = true,
  afterShare,
}: {
  topClass?: string;
  showTopBorder?: boolean;
  afterShare?: ReactNode;
}) {
  const { activeId, activeParentId, navigateTo, shareTitle, shareUrl } =
    useSignpost();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      if (!activeId) {
        container.style.setProperty("--progress-height", "0px");
        return;
      }
      const dot = container.querySelector(`[data-dot="${activeId}"]`);
      if (!dot) return;
      const h =
        (dot as HTMLElement).offsetTop + (dot as HTMLElement).offsetHeight / 2;
      container.style.setProperty("--progress-height", `${h}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [activeId]);

  const showChildren = useCallback(
    (item: TocItemType) => activeParentId === item.heading.id,
    [activeParentId],
  );

  return (
    <nav className="print-hide hidden 2xl-memo:block" aria-label="Table of contents">
      <div
        className={`sticky ${topClass} ${showTopBorder ? "border-accent border-t-[2px] " : ""}overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      >
        {shareTitle && shareUrl && (
          <div className="pb-4 mb-4 border-b border-border-light">
            <span className="type-label text-text-secondary block mb-3">
              Share
            </span>
            <ShareButtons title={shareTitle} url={shareUrl} />
            {afterShare && <div className="mt-4">{afterShare}</div>}
          </div>
        )}
        <div className="relative" ref={containerRef}>
          <Track />
          <Indicator visible={!!activeId} />
          <TocTree showChildren={showChildren} onNavigate={navigateTo} />
        </div>
      </div>
    </nav>
  );
}
