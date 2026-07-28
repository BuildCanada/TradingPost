"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSignpost } from "./store";
import { TocTree } from "./toc-tree";

export function MobileBar() {
  const {
    activeText,
    progress,
    navigateTo,
  } = useSignpost();
  const [isOpen, setIsOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(!entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="2xl-memo:hidden" aria-hidden="true" />
      <div
        className={cn(
          /* -mb cancels the bar's reserved flow height (44px button + 1px
             progress rule + 1px border) — hidden at page top, it would
             otherwise leave a ghost gap above the article. Stuck, it
             overlays content as before. */
          "print-hide 2xl-memo:hidden sticky top-[70px] z-10 -mb-[46px] border-b transition-all duration-300",
          isStuck ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none",
          isOpen ? "border-dark bg-dark" : "border-border-light bg-bg",
        )}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-11 w-full items-center justify-between px-5 font-sans text-[13px] font-medium transition-colors duration-200",
            isOpen
              ? "text-bg hover:text-linen-200"
              : "text-dark hover:text-accent",
          )}
          aria-expanded={isOpen}
          aria-label="Table of contents"
        >
          <span className="truncate pr-4">{activeText}</span>
          <svg
            width="12"
            height="7"
            viewBox="0 0 12 7"
            fill="none"
            className={cn(
              "shrink-0 transition-transform duration-300",
              isOpen && "rotate-180",
            )}
          >
            <path
              d="M1 1L6 6L11 1"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="bg-bg">
          <div className="h-px bg-charcoal-200">
            <div
              className="h-full bg-accent transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div
            className={cn(
              "overflow-hidden transition-[max-height] duration-300 ease-out motion-reduce:transition-none",
              isOpen ? "max-h-[60vh] overflow-y-auto" : "max-h-0",
            )}
          >
            <div className="px-5 py-4">
              <TocTree
                showChildren={() => isOpen}
                onNavigate={(id) => {
                  setIsOpen(false);
                  setTimeout(() => navigateTo(id), 350);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
