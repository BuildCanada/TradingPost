"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

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
    <div className="border border-[var(--color-border-light)] p-5">
      <span className="type-label text-[var(--color-text-secondary)] block mb-2">
        Subscribe
      </span>
      <p className="type-body text-[var(--color-text-secondary)] mb-3">
        Stay informed on bold ideas for Canada.
      </p>
      <form
        className="flex flex-col gap-2.5"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="email"
          placeholder="Email"
          className="border border-[var(--color-border-light)] bg-transparent px-3 py-2 type-caption placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-dark)] transition-colors"
        />
        <button
          type="submit"
          className="bg-[var(--color-dark)] text-[var(--color-bg)] type-label px-4 py-2.5 hover:bg-[var(--color-accent)] transition-colors self-start"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}

/* ─── Related Memos ─── */

interface RelatedMemo {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorImage: string | null;
  category: string | null;
}

export function RelatedMemos({
  category,
  currentSlug,
}: {
  category: string | null;
  currentSlug: string;
}) {
  const [related, setRelated] = useState<RelatedMemo[]>([]);

  useEffect(() => {
    fetch("/api/memos")
      .then((r) => r.json())
      .then((all: RelatedMemo[]) => {
        const matches = all.filter(
          (m) =>
            m.slug !== currentSlug &&
            category &&
            m.category === category
        );
        if (matches.length > 0) {
          setRelated(matches.slice(0, 2));
        } else {
          setRelated(
            all.filter((m) => m.slug !== currentSlug).slice(0, 2)
          );
        }
      });
  }, [category, currentSlug]);

  if (related.length === 0) return null;

  return (
    <div className="border border-[var(--color-border-light)] p-5">
      <span className="type-label text-[var(--color-text-secondary)] block mb-3">
        Related Memos
      </span>
      <div className="space-y-3">
        {related.map((m) => (
          <Link
            key={m.id}
            href={`/memos/${m.slug}`}
            className="flex items-start gap-3 group"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--color-border-light)] overflow-hidden shrink-0 mt-0.5">
              {m.authorImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.authorImage}
                  alt={m.author}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="type-caption font-sans font-medium leading-[1.3] group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">
                {m.title}
              </h4>
              <p className="type-label-sm text-[var(--color-text-secondary)] mt-0.5">
                {m.author}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
