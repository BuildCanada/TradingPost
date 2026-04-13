"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SectionLabel from "@/components/SectionLabel";
import {
  type ContentFeedItem,
  FilterChips,
  FeaturedPost,
  RecentCard,
  PostListRow,
  PaginationArrows,
  EmptyState,
  GreatBuildersSection,
  TYPE_MAP,
  FILTERS,
  POSTS_PER_PAGE,
} from "@/components/content";

const VALID_FILTERS = new Set<string>(FILTERS);

function updateUrl(filter: string) {
  const url = new URL(window.location.href);
  if (filter === "All") {
    url.searchParams.delete("filter");
  } else {
    url.searchParams.set("filter", filter);
  }
  window.history.replaceState(null, "", url.toString());
}

export default function ContentFeedClient({
  items,
}: {
  items: ContentFeedItem[];
}) {
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState(() => {
    const param = searchParams.get("filter");
    return param && VALID_FILTERS.has(param) ? param : "All";
  });
  const [allPostsPage, setAllPostsPage] = useState(0);

  const featuredItem = items.find((i) => i.featured);

  const recentItems = items
    .filter(
      (i) =>
        (i.type === "BLOG" || i.type === "SUBSTACK") &&
        i.id !== featuredItem?.id
    )
    .slice(0, 4);

  const excludeIds = new Set([
    ...(featuredItem ? [featuredItem.id] : []),
    ...recentItems.map((i) => i.id),
  ]);

  const filteredItems = items.filter((i) => {
    if (excludeIds.has(i.id)) return false;
    if (activeFilter === "All") return true;
    return i.type === TYPE_MAP[activeFilter];
  });

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <FilterChips
          active={activeFilter}
          onSelect={(f) => {
            setActiveFilter(f);
            setAllPostsPage(0);
            updateUrl(f);
          }}
        />
      </div>

      <div className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
        <section className="px-5 py-12 border-b border-border-light">
          <div className="max-w-[1080px] mx-auto">
            {featuredItem && (
              <>
                <SectionLabel as="h2">Featured</SectionLabel>
                <FeaturedPost item={featuredItem} />
              </>
            )}

            {recentItems.length > 0 && (
              <>
                <SectionLabel as="h2">Recent</SectionLabel>
                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                  {recentItems.map((item) => (
                    <RecentCard key={item.id} item={item} />
                  ))}
                </div>
              </>
            )}

            {filteredItems.length > 0 &&
              (() => {
                const totalPages = Math.ceil(
                  filteredItems.length / POSTS_PER_PAGE
                );
                const page = Math.min(allPostsPage, totalPages - 1);
                const pageItems = filteredItems.slice(
                  page * POSTS_PER_PAGE,
                  (page + 1) * POSTS_PER_PAGE
                );
                const onPrev = () =>
                  setAllPostsPage((p) => Math.max(0, p - 1));
                const onNext = () =>
                  setAllPostsPage((p) => Math.min(totalPages - 1, p + 1));
                return (
                  <>
                    <div className="flex items-center">
                      <SectionLabel as="h2">All Posts</SectionLabel>
                      <PaginationArrows
                        page={page}
                        totalPages={totalPages}
                        onPrev={onPrev}
                        onNext={onNext}
                      />
                    </div>
                    {pageItems.map((item) => (
                      <PostListRow key={item.id} item={item} />
                    ))}
                    <div className="flex items-center mt-3">
                      <div className="flex-1" />
                      <PaginationArrows
                        page={page}
                        totalPages={totalPages}
                        onPrev={onPrev}
                        onNext={onNext}
                      />
                    </div>
                  </>
                );
              })()}
          </div>
        </section>
      </div>

      <div className="animate-fade-in" style={{ animationDelay: "1.2s" }}>
        <GreatBuildersSection />
      </div>
    </>
  );
}
