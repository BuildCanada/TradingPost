import { useMemo } from "react";
import type { Heading, TocItem } from "./config";

export function useBuildTree(headings: Heading[]) {
  return useMemo<TocItem[]>(() => {
    const items: TocItem[] = [];
    for (const h of headings) {
      if (h.level === 2) {
        items.push({ heading: h, children: [] });
      } else if (h.level === 3 && items.length > 0) {
        items[items.length - 1].children.push(h);
      }
    }
    return items;
  }, [headings]);
}

export function useActiveParent(activeId: string | null, headings: Heading[]) {
  return useMemo(() => {
    if (!activeId) return null;
    const h = headings.find((h) => h.id === activeId);
    if (!h) return null;
    if (h.level === 2) return h;
    const idx = headings.indexOf(h);
    for (let i = idx - 1; i >= 0; i--) {
      if (headings[i].level === 2) return headings[i];
    }
    return null;
  }, [activeId, headings]);
}

export function useActiveText(activeId: string | null, headings: Heading[]) {
  return useMemo(() => {
    if (!activeId) return headings[0]?.text ?? "Contents";
    return headings.find((h) => h.id === activeId)?.text ?? "Contents";
  }, [activeId, headings]);
}
