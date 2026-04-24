"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { SubscribeButton } from "@/components/ui/subscribe-button";

/* ─── Twitter Embed ─── */

export function TwitterEmbed({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clean = html.replace(/<script[^>]*>.*?<\/script>/gi, "");
    if (containerRef.current) {
      containerRef.current.innerHTML = clean;
    }

    const win = window as unknown as {
      twttr?: { widgets?: { load?: (el?: HTMLElement) => void } };
    };
    if (win.twttr?.widgets?.load) {
      win.twttr.widgets.load(containerRef.current ?? undefined);
    } else {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [html]);

  return <div ref={containerRef} />;
}

/* ─── Compact Subscribe ─── */

export function MemoSubscribe() {
  return (
    <SubscribeButton variant="primary" source="inline" className="w-full">
      Subscribe
    </SubscribeButton>
  );
}

/* ─── Related Memos ─── */

interface RelatedMemo {
  id: string;
  title: string;
  slug: string;
  author: {
    name: string;
    photo: string | null;
  };
  category: string | null;
}

export function RelatedMemos({
  related,
  category,
  basePath = "/memos",
}: {
  related: RelatedMemo[];
  category: string | null;
  basePath?: string;
}) {
  if (related.length === 0) return null;

  const displayCategory = category ? category.replace(/-/g, " ").toUpperCase() : null;
  const heading = displayCategory ? `Other ${displayCategory} Memos` : "Other Memos";

  return (
    <div className="border border-border-light p-6">
      <h2 className="type-label text-text-secondary mb-4">
        {heading}
      </h2>
      <div className="space-y-4">
        {related.map((m) => (
          <Link
            key={m.id}
            href={`${basePath}/${m.slug}`}
            className="flex items-start gap-3 group"
          >
            <div className="w-8 h-8 bg-border-light overflow-hidden shrink-0 mt-0.5">
              {m.author.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.author.photo}
                  alt={m.author.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="type-caption font-sans font-medium leading-[1.3] group-hover:text-auburn-800 transition-colors line-clamp-2">
                {m.title}
              </h3>
              <p className="type-label-sm text-text-secondary mt-1">
                {m.author.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
