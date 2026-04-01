"use client";

import { useEffect, useState } from "react";
import { type FeedItem } from "@/components/feed/types";
import { IGCard, XCard, TikTokCard, SubstackCard, FeedCard } from "@/components/feed";

export default function FeedPreview() {
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    fetch("/api/feed")
      .then((r) => r.json())
      .then((data: FeedItem[]) => {
        const picks: FeedItem[] = [];
        const types = ["X", "IG", "SUBSTACK", "BLOG"];
        for (const t of types) {
          const match = data.find((d) => d.type === t);
          if (match) picks.push(match);
        }
        setItems(picks);
      });
  }, []);

  return (
    <div className="py-12">
      <div className="max-w-[1080px] mx-auto">
        <span className="type-label text-dark block pb-4">
          Content Feed
        </span>
        <div className="grid grid-cols-1 cards:grid-cols-2 gap-3">
          {items.length > 0
            ? items.map((item) =>
                item.type === "IG" ? (
                  <IGCard key={item.id} item={item} />
                ) : item.type === "X" ? (
                  <XCard key={item.id} item={item} />
                ) : item.type === "TIKTOK" ? (
                  <TikTokCard key={item.id} item={item} />
                ) : item.type === "SUBSTACK" ? (
                  <SubstackCard key={item.id} item={item} />
                ) : (
                  <FeedCard key={item.id} item={item} />
                )
              )
            : [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-[200px] border border-border-light"
                />
              ))}
        </div>
      </div>
    </div>
  );
}
