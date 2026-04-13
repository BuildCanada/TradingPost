import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface Memo {
  id: string;
  title: string;
  slug: string;
  author: {
    name: string;
    photo: string | null;
  };
  keyMessage1?: string | null;
  category?: string | null;
  splashImage?: string | null;
  seoImage?: string | null;
}

export function formatCategory(category: string | null | undefined): string {
  if (!category) return 'Memo';
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface CardCTAProps {
  variant?: 'light' | 'dark';
}

function CardCTA({ variant = 'light' }: CardCTAProps) {
  const isDark = variant === 'dark';
  
  return (
    <div className={cn(
      "border-t px-8 lg:px-10 py-4 flex items-center gap-2 group/cta",
      isDark ? "border-white/20" : "border-border-light"
    )}>
      <span className={cn(
        "font-label text-xs uppercase tracking-wider transition-colors",
        isDark 
          ? "text-bg/70 group-hover/cta:text-white" 
          : "text-text-secondary group-hover/cta:text-accent"
      )}>
        Read More
      </span>
      <svg 
        className={cn(
          "w-4 h-4 transition-all",
          isDark 
            ? "text-bg/70 group-hover/cta:text-white" 
            : "text-text-secondary group-hover/cta:text-accent",
          "group-hover/cta:translate-x-1"
        )}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}

interface MemoCardProps {
  memo: Memo;
  variant?: 'light' | 'dark' | 'featured';
  isLatest?: boolean;
  showLabel?: string;
  priority?: boolean;
  gridItem?: boolean;
}

export function MemoCard({ 
  memo, 
  variant = 'light', 
  isLatest = false,
  showLabel,
  priority = false,
  gridItem = false,
}: MemoCardProps) {
  const isDark = variant === 'dark' || variant === 'featured';
  const isFeatured = variant === 'featured';

  const imageEl = isDark && (memo.splashImage || memo.seoImage) ? (
    <div className="absolute inset-0 bg-dark">
      <Image
        src={memo.splashImage || memo.seoImage!}
        alt=""
        fill
        className={cn(
          "object-cover transition-opacity duration-500",
          isFeatured ? "opacity-40 group-hover:opacity-25" : "opacity-40 group-hover:opacity-50"
        )}
        unoptimized
        priority={priority}
      />
    </div>
  ) : null;

  const labelEl = showLabel ? (
    <span className={cn(
      "absolute z-10 type-label bg-bg text-dark px-2 py-1",
      isDark ? "top-4 left-4 lg:top-5 lg:left-5" : "top-4 right-4"
    )}>
      {showLabel}
    </span>
  ) : null;

  const latestEl = isLatest && !isDark ? (
    <span className="type-label-sm bg-dark text-bg px-2 py-1">
      Latest
    </span>
  ) : null;

  const authorBlock = (
    <div className="flex items-center gap-4">
      {memo.author.photo && (
        <div 
          className={cn(
            "bg-border-light overflow-hidden shrink-0",
            isFeatured ? "w-14 h-14 lg:w-16 lg:h-16" : "w-12 h-12 lg:w-[60px] lg:h-[60px]"
          )}
        >
          <Image
            src={memo.author.photo}
            alt={memo.author.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      )}
      <div>
        <p className={cn(
          "font-display font-normal leading-[1.4]",
          isDark ? "text-bg" : "",
          isFeatured ? "text-[1.125rem] lg:text-[1.25rem]" : "text-[1rem] lg:text-[1.125rem]"
        )}>
          {memo.author.name}
        </p>
        <p className={cn(
          "type-label mt-0.5",
          isDark ? "text-bg/70" : "text-text-secondary"
        )}>
          {formatCategory(memo.category)}
        </p>
      </div>
    </div>
  );

  if (isFeatured) {
    return (
      <Link
        href={`/memos/${memo.slug}`}
        className="flex flex-col justify-end group relative overflow-hidden min-h-[320px] lg:min-h-[400px] border border-border-light"
      >
        {imageEl}
        {labelEl}
        <div className="relative z-10 flex flex-col">
          <div className="p-8 lg:p-12 flex flex-col gap-5">
            <h3 className="font-display text-[1.75rem] lg:text-[2.25rem] font-normal leading-[1.15] text-bg group-hover:text-white transition-colors line-clamp-3">
              {memo.title}
            </h3>
            {memo.keyMessage1 && (
               <p className="type-default text-bg/80 line-clamp-2 max-w-2xl">
                {memo.keyMessage1}
              </p>
            )}
            {authorBlock}
          </div>
          <CardCTA variant="dark" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/memos/${memo.slug}`}
      className={cn(
        "flex flex-col group relative overflow-hidden h-full",
        !isDark && (gridItem ? "border-b border-r border-l border-border-light" : "border border-border-light"),
        isDark && !isFeatured && "justify-end min-h-[280px] lg:min-h-[320px]"
      )}
    >
      {imageEl}
      {labelEl}

      {isDark ? (
        <div className="relative z-10 flex flex-col">
          <div className="p-8 lg:p-10 flex flex-col gap-4">
            <h3 className="font-display text-[1.5rem] lg:text-[1.75rem] font-normal leading-[1.2] text-bg group-hover:text-white transition-colors line-clamp-3">
              {memo.title}
            </h3>
            {memo.keyMessage1 && (
              <p className="type-body text-bg/70 line-clamp-3">
                {memo.keyMessage1}
              </p>
            )}
            {authorBlock}
          </div>
          <CardCTA variant="dark" />
        </div>
      ) : (
        <>
          <div className="p-6 lg:p-8 flex flex-col gap-4 flex-1 relative">
            <div className="min-w-0">
              <h3 className="font-display text-[1.125rem] lg:text-[1.25rem] font-normal leading-[1.2] tracking-normal group-hover:text-accent transition-colors line-clamp-2">
                {memo.title}
              </h3>
              {memo.keyMessage1 && (
                <p className="type-default text-text-secondary mt-2 line-clamp-2">
                  {memo.keyMessage1}
                </p>
              )}
            </div>
            {latestEl && (
              <div className="flex justify-end">{latestEl}</div>
            )}
            <div className="flex items-center gap-3 mt-auto">
              {memo.author.photo && (
                <div 
                  className="w-10 h-10 lg:w-12 lg:h-12 bg-border-light overflow-hidden shrink-0"
                        >
                  <Image
                    src={memo.author.photo}
                    alt={memo.author.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div>
                <p className="font-display text-[0.875rem] lg:text-[1rem] font-normal leading-[1.4]">
                  {memo.author.name}
                </p>
                <p className="type-label text-text-secondary mt-0.5">
                  {formatCategory(memo.category)}
                </p>
              </div>
            </div>
          </div>
          <CardCTA variant="light" />
        </>
      )}
    </Link>
  );
}
