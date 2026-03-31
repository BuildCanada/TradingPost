import Link from "next/link";
import Image from "next/image";
import { MemoItem, formatDate, shortenName } from "./types";

export default function MemoListItem({ memo }: { memo: MemoItem }) {
  return (
    <Link
      href={`/memos/${memo.slug}`}
      className="flex items-start gap-3 py-3.5 border-b border-border-light group"
    >
      <div className="w-10 h-10 rounded bg-border-light shrink-0 overflow-hidden mt-0.5">
        {memo.authorImage && (
          <Image
            src={memo.authorImage}
            alt={memo.author}
            width={40}
            height={40}
            className="w-full h-full object-cover"
            unoptimized
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="type-h4 group-hover:text-accent transition-colors line-clamp-1">
          {memo.title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="type-label text-text-secondary">
            <span className="hidden wide:inline">{memo.author}</span>
            <span className="wide:hidden">
              {shortenName(memo.author)}
            </span>
          </p>
          <span className="text-text-secondary">&middot;</span>
          <p className="type-label-sm text-text-secondary">
            {formatDate(memo.publishedAt, memo.createdAt)}
          </p>
        </div>
        <p className="type-caption text-text-secondary mt-1 line-clamp-2">
          {memo.keyMessage1}
        </p>
      </div>

      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className="shrink-0 mt-1 text-text-secondary group-hover:text-accent transition-colors"
      >
        <path
          d="M2 7h9M8 3l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
