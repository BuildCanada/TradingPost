import type { ReactNode } from "react";

// Gutters belong outside the centered content width so a wider viewport cannot
// take space away from the article. Heroes and body grids use the same container.
export function ArticleContainer({ children, className = "" }: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-5 md:px-10 ${className}`}>
      <div className="mx-auto w-full max-w-[1008px]">{children}</div>
    </div>
  );
}

export function ArticleLayout({ children }: { children: ReactNode }) {
  return (
    <ArticleContainer className="pt-4 pb-[52px]">
      <div className="article-layout 2xl-memo:grid 2xl-memo:grid-cols-[240px_minmax(0,720px)] 2xl-memo:gap-12">
        {children}
      </div>
    </ArticleContainer>
  );
}
