"use client";

import { cn } from "@/lib/utils";
import { useSignpost } from "./store";
import type { TocItem as TocItemType } from "./config";
import { TocItem } from "./toc-item";

interface TocTreeProps {
  showChildren: (item: TocItemType) => boolean;
  onNavigate: (id: string) => void;
}

export function TocTree({ showChildren, onNavigate }: TocTreeProps) {
  const { tree, activeId, activeParentId, readIds } = useSignpost();

  return (
    <ul className="flex flex-col gap-5">
      {tree.map((item) => {
        const isParentActive = activeParentId === item.heading.id;
        const hasChildren = item.children.length > 0;

        return (
          <li key={item.heading.id}>
            <TocItem
              id={item.heading.id}
              text={item.heading.text}
              level={2}
              isActive={isParentActive}
              isRead={readIds.has(item.heading.id)}
              onNavigate={onNavigate}
            />
            {hasChildren && (
              <ul
                className={cn(
                  "flex flex-col gap-3 overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
                  showChildren(item)
                    ? "mt-2 opacity-100"
                    : "max-h-0 opacity-0",
                )}
                style={{ maxHeight: showChildren(item) ? `${item.children.length * 28}px` : undefined }}
              >
                {item.children.map((child) => (
                  <li key={child.id}>
                    <TocItem
                      id={child.id}
                      text={child.text}
                      level={3}
                      isActive={activeId === child.id}
                      isRead={readIds.has(child.id)}
                      onNavigate={onNavigate}
                    />
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
