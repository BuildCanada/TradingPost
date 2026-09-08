import type { ReactNode } from "react";

// Gutters belong outside the centered content width so a wider viewport cannot
// take space away from the article. Heroes and body grids use the same container.
export function ArticleContainer({ children, className = "", wide = false }: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className={`${wide ? "px-5 md:px-6" : "px-5 md:px-10"} ${className}`}>
      <div className={`mx-auto w-full ${wide ? "max-w-[1440px]" : "max-w-[1008px]"}`}>{children}</div>
    </div>
  );
}

export function ArticleLayout({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <ArticleContainer wide={wide} className="pt-4 pb-[52px]">
      <div className={`article-layout 2xl-memo:grid 2xl-memo:gap-12 ${wide ? "2xl-memo:grid-cols-[220px_minmax(0,1fr)]" : "2xl-memo:grid-cols-[240px_minmax(0,720px)]"}`}>
        {children}
      </div>
    </ArticleContainer>
  );
}
