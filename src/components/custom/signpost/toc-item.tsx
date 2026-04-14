"use client";

import { cn } from "@/lib/utils";
import { DOT, DIAMOND } from "./config";
import { Label } from "./label";

interface TocItemProps {
  id: string;
  text: string;
  level: 2 | 3;
  isActive: boolean;
  isRead: boolean;
  onNavigate: (id: string) => void;
}

export function TocItem({ id, text, level, isActive, isRead, onNavigate }: TocItemProps) {
  const dotZ = isActive ? "z-20" : isRead ? "z-0" : "z-10";

  return (
    <div className="group flex items-start">
      <div
        className="flex w-[24px] shrink-0 justify-center"
        style={{ paddingTop: level === 2 ? "0px" : "2px" }}
      >
        {level === 2 && (
          <span
            data-dot={id}
            className={cn(
              "block rounded-full border border-[2px] left-px relative transition-all duration-200",
              dotZ,
              "border-border-light bg-bg group-hover:border-charcoal-700",
              isActive && "border-accent bg-linen-50",
              isRead && !isActive && "border-accent bg-linen-100"
            )}
            style={{ width: DOT, height: DOT, marginTop: "6px" }}
          />
        )}
        {level === 3 && (
          <span
            data-dot={id}
            className={cn(
              "block rotate-45 border relative left-px transition-all duration-200",
              dotZ,
              "border-border-light bg-bg group-hover:border-charcoal-700",
              isActive && "border-accent bg-linen-50",
              isRead && !isActive && "border-accent bg-linen-100"
            )}
            style={{ width: DIAMOND, height: DIAMOND, marginTop: "6px" }}
          />
        )}
      </div>
      <Label
        text={text}
        href={`#${id}`}
        isActive={isActive}
        level={level}
        onClick={(e) => {
          e.preventDefault();
          onNavigate(id);
        }}
      />
    </div>
  );
}
