import Link from "next/link";
import Image from "next/image";

interface Memo {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorImage: string | null;
  publishedAt: string | null;
  createdAt: string;
  splashImage: string | null;
  seoImage: string | null;
}

export default function PickCard({ memo, isLatest }: { memo: Memo; isLatest?: boolean }) {
  return (
    <Link
      href={`/memos/${memo.slug}`}
      className="border border-[var(--color-border-light)] rounded-[3px] p-3 flex flex-col gap-2 cards:flex-row cards:items-center cards:gap-2.5 group relative overflow-hidden"
    >
      {memo.authorImage && (
        <div className="w-7 h-7 rounded-full bg-[var(--color-border-light)] overflow-hidden shrink-0 relative z-10">
          <Image
            src={memo.authorImage}
            alt={memo.author}
            width={28}
            height={28}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      )}
      <div className="relative z-10 min-w-0">
        <h4 className="type-caption font-sans font-medium tracking-tight group-hover:text-[var(--color-accent)] transition-colors line-clamp-2" style={{ lineHeight: 1.1 }}>
          {memo.title}
        </h4>
        <p className="type-label-sm text-[var(--color-text-secondary)] mt-0.5">
          {memo.author}
        </p>
        <div className="flex items-center gap-1.5">
          <p className="type-label-sm text-[var(--color-text-muted)]">
            {new Date(memo.publishedAt || memo.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
          {isLatest && (
            <span className="type-label-sm bg-[var(--color-dark)] text-[var(--color-bg)] px-1.5 py-px rounded-sm leading-none">
              Latest
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
