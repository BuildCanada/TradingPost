"use client";

import { useMemo } from "react";
import FeaturedHero from "./FeaturedHero";
import CategoryFilter from "./CategoryFilter";
import MemoSearch from "./MemoSearch";
import MemoResultsList from "./MemoResultsList";
import { MemoItem } from "./types";

export type { MemoItem };

export default function MemosListClient({ memos }: { memos: MemoItem[] }) {
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const m of memos) {
      if (m.category) cats.add(m.category);
    }
    return Array.from(cats).sort();
  }, [memos]);

  return (
    <>
      <FeaturedHero memos={memos} />
      <CategoryFilter categories={categories} />
      <MemoSearch />
      <MemoResultsList memos={memos} />
    </>
  );
}
