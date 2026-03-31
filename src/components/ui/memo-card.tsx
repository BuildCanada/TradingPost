import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface Memo {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorImage: string | null;
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
          ? "text-white/60 group-hover/cta:text-bg" 
          : "text-text-secondary group-hover/cta:text-accent"
      )}>
        Read More
      </span>
      <svg 
        className={cn(
          "w-4 h-4 transition-all",
          isDark 
            ? "text-white/60 group-hover/cta:text-bg" 
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
  variant?: 'light' | 'dark';
  isLatest?: boolean;
  showLabel?: string;
  priority?: boolean;
}

export function MemoCard({ 
  memo, 
  variant = 'light', 
  isLatest = false,
  showLabel,
  priority = false 
}: MemoCardProps) {
  const isDark = variant === 'dark';
  
  return (
    <Link
      href={`/memos/${memo.slug}`}
      className={cn(
        "flex flex-col group relative overflow-hidden h-full",
        !isDark && "border-b border-r border-border-light",
        isDark && "justify-end min-h-[280px] lg:min-h-[320px]"
      )}
    >
      {isDark && (memo.splashImage || memo.seoImage) && (
        <div className="absolute inset-0 bg-dark">
          <Image
            src={memo.splashImage || memo.seoImage!}
            alt=""
            fill
            className="object-cover opacity-40 group-hover:opacity-50 transition-opacity"
            unoptimized
            priority={priority}
          />
        </div>
      )}

      {showLabel && (
        <span className={cn(
          "absolute z-10 type-label bg-bg text-dark px-2 py-1",
          isDark ? "top-4 left-4 lg:top-5 lg:left-5" : "top-4 right-4"
        )}>
          {showLabel}
        </span>
      )}

      {isLatest && !isDark && (
        <span className="absolute top-4 right-4 type-label-sm bg-dark text-bg px-2 py-1">
          Latest
        </span>
      )}

      {isDark ? (
        <div className="relative z-10 flex flex-col">
          <div className="p-8 lg:p-10 flex flex-col gap-4">
            <h3 className="font-display text-[1.5rem] lg:text-[1.75rem] font-normal leading-[1.2] text-white group-hover:text-bg transition-colors line-clamp-3">
              {memo.title}
            </h3>
            {memo.keyMessage1 && (
              <p className="font-body text-[1rem] lg:text-[1.125rem] leading-[1.5] text-white/80 line-clamp-3">
                {memo.keyMessage1}
              </p>
            )}
            <div className="flex items-center gap-4">
              {memo.authorImage && (
                <div 
                  className="w-12 h-12 lg:w-[60px] lg:h-[60px] bg-border-light overflow-hidden shrink-0"
                  style={{ borderRadius: '2px' }}
                >
                  <Image
                    src={memo.authorImage}
                    alt={memo.author}
                    width={60}
                    height={60}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div>
                <p className="font-display text-[1rem] lg:text-[1.125rem] font-normal leading-[1.4] text-white">
                  {memo.author}
                </p>
                <p className="type-label text-white/70 mt-0.5">
                  {formatCategory(memo.category)}
                </p>
              </div>
            </div>
          </div>
          <CardCTA variant="dark" />
        </div>
      ) : (
        <>
          <div className="p-8 lg:p-10 flex flex-col gap-6 flex-1">
            <div className="min-w-0">
              <h3 className="font-display text-[1.25rem] lg:text-[1.5rem] font-normal leading-[1.2] tracking-normal group-hover:text-accent transition-colors line-clamp-3">
                {memo.title}
              </h3>
              {memo.keyMessage1 && (
                <p className="font-body text-[1rem] lg:text-[1.125rem] leading-[1.5] text-text-secondary mt-3 line-clamp-3">
                  {memo.keyMessage1}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4 mt-auto">
              {memo.authorImage && (
                <div 
                  className="w-12 h-12 lg:w-[60px] lg:h-[60px] bg-border-light overflow-hidden shrink-0"
                  style={{ borderRadius: '2px' }}
                >
                  <Image
                    src={memo.authorImage}
                    alt={memo.author}
                    width={60}
                    height={60}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div>
                <p className="font-display text-[1rem] lg:text-[1.125rem] font-normal leading-[1.4]">
                  {memo.author}
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
