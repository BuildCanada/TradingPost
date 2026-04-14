import Image from "next/image";
import Link from "next/link";

interface MemoHeroProps {
  category: string | null;
  title: string;
  authorName: string;
  authorImage: string | null;
  date: string;
  supporters: string | null;
}

export function MemoHero({
  category,
  title,
  authorName,
  authorImage,
  date,
  supporters,
}: MemoHeroProps) {
  return (
    <div className="max-w-[1400px] mx-auto w-full px-[5vw] py-10 md:px-[10vw]">
      <Link
        href="/memos"
        className="type-label text-text-secondary hover:text-dark transition-colors flex items-center gap-1.5 mb-6 py-1"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path
            d="M12 7H3M6 3L2 7l4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        All Memos
      </Link>

      {category && (
        <div className="flex items-center gap-2 mb-3">
          <span className="type-label text-text-secondary">Category</span>
          <span className="inline-block type-label text-bg bg-dark rounded-full px-3 py-0.5">
            {category.replace(/-/g, " ")}
          </span>
        </div>
      )}

      <h1 className="type-title mb-4 max-w-[720px]">{title}</h1>

      <div className="flex items-center gap-5 mb-6">
        <div className="w-32 h-32 rounded-none bg-border-light overflow-hidden shrink-0">
          {authorImage && (
            <Image
              src={authorImage}
              alt={authorName}
              width={128}
              height={128}
              className="w-full h-full object-cover"
              unoptimized
              priority
            />
          )}
        </div>
        <div>
          <p className="type-h3">{authorName}</p>
          <p className="type-label text-text-secondary mt-1">{date}</p>
        </div>
      </div>

      {supporters && (
        <div className="pb-6 border-b border-border-light">
          <span className="type-label text-text-secondary block mb-2">
            Supporters
          </span>
          <div
            className="prose-bc [&_p]:text-[15px] [&_p]:leading-[1.5]"
            dangerouslySetInnerHTML={{ __html: supporters }}
          />
        </div>
      )}
    </div>
  );
}
