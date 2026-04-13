"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import FeaturedHero from "./FeaturedHero";
import CategoryFilter from "./CategoryFilter";
import MemoSearch from "./MemoSearch";
import MemoResultsList from "./MemoResultsList";
import { MemoItem } from "./types";
import { useMemosFilter } from "./store";

export type { MemoItem };

export default function MemosListClient({ memos }: { memos: MemoItem[] }) {
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const m of memos) {
      if (m.category) cats.add(m.category);
    }
    return Array.from(cats).sort();
  }, [memos]);

  const searchParams = useSearchParams();
  const setActiveCategory = useMemosFilter((s) => s.setActiveCategory);

  useEffect(() => {
    const category = searchParams.get("category");
    if (category && categories.includes(category)) {
      setActiveCategory(category);
    }
  }, []);

  return (
    <>
      <FeaturedHero memos={memos} />
      <CategoryFilter categories={categories} />
      <MemoSearch />
      <MemoResultsList memos={memos} />
    </>
  );
}
