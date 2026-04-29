"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import FeaturedHero from "./FeaturedHero";
import CategoryFilter from "./CategoryFilter";
import MemoSearch from "./MemoSearch";
import MemoResultsList from "./MemoResultsList";
import { MemoItem } from "./types";
import { useMemosFilter } from "./store";

export type { MemoItem };

function CategoryFromSearchParams({ categories }: { categories: string[] }) {
  const searchParams = useSearchParams();
  const setActiveCategory = useMemosFilter((s) => s.setActiveCategory);

  useEffect(() => {
    const category = searchParams.get("category");
    if (category && categories.includes(category)) {
      setActiveCategory(category);
    }
  }, []);

  return null;
}

export default function MemosListClient({
  memos,
  basePath = "/memos",
  showCategoryFilter = true,
  resultsLabel,
}: {
  memos: MemoItem[];
  basePath?: string;
  showCategoryFilter?: boolean;
  resultsLabel?: string;
}) {
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const m of memos) {
      if (m.category) cats.add(m.category);
    }
    return Array.from(cats).sort();
  }, [memos]);

  return (
    <>
      {showCategoryFilter && (
        <Suspense fallback={null}>
          <CategoryFromSearchParams categories={categories} />
        </Suspense>
      )}
      <FeaturedHero memos={memos} basePath={basePath} />
      {showCategoryFilter && <CategoryFilter categories={categories} />}
      <MemoSearch placeholder={`Search ${(resultsLabel ?? "memos").toLowerCase()}...`} />
      <MemoResultsList memos={memos} basePath={basePath} resultsLabel={resultsLabel} />
    </>
  );
}
