import Link from "next/link";
import Image from "next/image";

interface Memo {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorImage: string | null;
  keyMessage1: string;
  splashImage: string | null;
  seoImage: string | null;
}

export default function FeaturedCard({
  memo,
  label,
}: {
  memo: Memo;
  label: string;
}) {
  return (
    <Link
      href={`/memos/${memo.slug}`}
      className="rounded-[3px] p-5 flex flex-col justify-end group relative overflow-hidden h-full min-h-[140px]"
    >
      <div className="absolute inset-0 bg-[var(--color-dark)]">
        {(memo.splashImage || memo.seoImage) && (
          <Image
            src={memo.splashImage || memo.seoImage!}
            alt=""
            fill
            className="object-cover opacity-40 group-hover:opacity-50 transition-opacity"
            unoptimized
          />
        )}
      </div>

      <span className="absolute top-3 left-3 z-10 type-label-sm bg-[var(--color-bg)]/80 text-[var(--color-dark)] px-1.5 py-0.5">
        {label}
      </span>

      <div className="relative z-10 flex flex-col gap-2 cards:flex-row cards:items-end cards:gap-3">
        {memo.authorImage && (
          <div className="w-8 h-8 rounded-full bg-[var(--color-border-light)] overflow-hidden shrink-0">
            <Image
              src={memo.authorImage}
              alt={memo.author}
              width={32}
              height={32}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
        )}
        <div>
          <h3 className="type-heading text-white group-hover:text-[var(--color-bg)] transition-colors">
            {memo.title}
          </h3>
          {memo.keyMessage1 && (
            <p className="type-caption text-white/80 mt-1 line-clamp-2">
              {memo.keyMessage1}
            </p>
          )}
          <p className="type-label-sm text-white/70 mt-1">
            {memo.author}
          </p>
        </div>
      </div>
    </Link>
  );
}
