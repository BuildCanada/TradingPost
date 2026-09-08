import { ArticleContainer } from "@/components/content/ArticleLayout";
import Image from "next/image";
import Link from "next/link";

interface MemoHeroProps {
  title: string;
  subtitle?: string | null;
  authorName: string;
  authorImage: string | null;
  date: string;
  supporters: string | null;
  variant?: "memo" | "poll";
  backHref?: string;
  backLabel?: string;
}

export function MemoHero({
  title,
  subtitle,
  authorName,
  authorImage,
  date,
  supporters,
  variant = "memo",
  backHref,
  backLabel,
}: MemoHeroProps) {
  return (
    <ArticleContainer wide={variant === "poll"} className={variant === "poll" ? "pt-5 pb-2 md:pt-6" : "py-10"}>
      {backHref && backLabel && (
        <Link
          href={backHref}
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
          {backLabel}
        </Link>
      )}

      <h1 className={`type-title max-w-[720px] ${subtitle ? "mb-1" : "mb-4"}`}>{title}</h1>
      {subtitle && (
        <p className="max-w-[720px] mb-2 font-sans text-lg md:text-xl italic leading-snug text-text-secondary">{subtitle}</p>
      )}

      {variant === "poll" ? (
        <p className="font-mono text-[15px] md:text-base leading-relaxed text-text-secondary">{date}</p>
      ) : (
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
      )}

      {supporters && variant !== "poll" && (
        <div className="pb-2">
          <span className="type-label text-text-secondary block mb-2">
            Supporters
          </span>
          <div
            className="text-sm leading-[1.4] max-w-[50%] [&_p]:m-0 [&_a]:text-dark [&_a]:underline [&_a]:font-mono [&_a]:uppercase [&_a]:hover:text-auburn-800"
            dangerouslySetInnerHTML={{ __html: supporters }}
          />
        </div>
      )}

    </ArticleContainer>
  );
}
