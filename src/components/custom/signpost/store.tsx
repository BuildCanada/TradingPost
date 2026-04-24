"use client";

import { createContext, useContext } from "react";
import type { Heading, TocItem } from "./config";

interface SignpostState {
  headings: Heading[];
  tree: TocItem[];
  activeId: string | null;
  activeParentId: string | null;
  activeText: string;
  readIds: Set<string>;
  progress: number;
  navigateTo: (id: string) => void;
  shareTitle?: string;
  shareUrl?: string;
}

const Ctx = createContext<SignpostState | null>(null);

export const SignpostProvider = Ctx.Provider;

export function useSignpost() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSignpost must be used within a SignpostProvider");
  return ctx;
}
