import { ArticleContainer, ArticleLayout } from "@/components/content/ArticleLayout";
// The placeholder a memo route shows while its content streams in.
//
// It mirrors the real layout in page.tsx (hero → signpost → key messages →
// body) at the same widths and spacing, so swapping in the real memo doesn't
// shift anything on screen.
//
// Chrome that's identical on every memo — the Key Messages frame and its
// eyebrow, the numbered indices, the Signpost's rail and Share block — is
// rendered for real rather than faked as grey blocks. Only the parts that
// differ per memo are placeholders, which keeps the page recognisably a memo
// while it loads instead of a generic loading card.

const KEY_MESSAGES_FILL = {
  // The fills the real Key Messages boxes use (see page.tsx). Hardcoded there
  // too — they predate the linen ramp.
  default: "bg-[#f0e5dc]",
  toronto: "bg-[#d7e4f3]",
} as const;

const DELAYS = ["", "skeleton-delay-1", "skeleton-delay-2", "skeleton-delay-3"];

// One placeholder line. `i` staggers the sweep down a stack.
function Line({
  className,
  strong = false,
  i = 0,
}: {
  className: string;
  strong?: boolean;
  i?: number;
}) {
  return (
    <div
      className={`skeleton-bar ${strong ? "skeleton-bar-strong" : ""} ${
        DELAYS[i % DELAYS.length]
      } ${className}`}
    />
  );
}

export function MemoSkeleton({
  brand = "default",
  showBackLink = false,
  contentLabel = "memo",
}: {
  brand?: keyof typeof KEY_MESSAGES_FILL;
  showBackLink?: boolean;
  contentLabel?: "memo" | "poll";
}) {
  return (
    <div
      className="mx-[10px] my-[10px] border border-border-light bg-bg"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading {contentLabel}…</span>

      <div aria-hidden="true">
        {/* Hero — mirrors MemoHero: title, then author frame beside name/date.
            Title lines are display-weight; the author frame uses the same
            border-light square MemoHero shows before its photo loads. */}
        <ArticleContainer className="py-10">
          {showBackLink && <Line className="h-3 w-40 mb-6" />}

          <div className="max-w-[720px] mb-4 space-y-3">
            <Line className="h-8 md:h-10 w-full" strong />
            <Line className="h-8 md:h-10 w-3/4" strong i={1} />
          </div>

          <div className="flex items-center gap-5 mb-6">
            <div className="w-32 h-32 bg-border-light shrink-0" />
            <div className="space-y-2.5">
              <Line className="h-5 w-44" />
              <Line className="h-3 w-32" i={1} />
            </div>
          </div>
        </ArticleContainer>

        <ArticleLayout>
          {/* Signpost — the desktop-only rail. Its accent top rule, Share
              eyebrow, share buttons and dotted track are all real. */}
          <div className="print-hide hidden 2xl-memo:block">
            <div className="sticky top-[90px] border-accent border-t-[2px]">
              <div className="pt-4 pb-4 mb-4 border-b border-border-light">
                <span className="type-label text-text-secondary block mb-3">
                  Share
                </span>
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-12 h-12 bg-dark" />
                  ))}
                </div>
              </div>

              <div className="relative">
                {/* The rail's 2px track, matching Track's geometry. */}
                <div className="absolute bottom-2 top-0 left-[11px] w-[2px] bg-border-light" />
                <div className="space-y-4">
                  {["w-full", "w-4/5", "w-11/12", "w-3/4", "w-5/6"].map(
                    (w, i) => (
                      <div key={i} className="flex items-start">
                        <div className="flex w-[24px] shrink-0 justify-center">
                          <div className="w-[11px] h-[11px] mt-1.5 rounded-full border-[2px] border-border-light bg-bg" />
                        </div>
                        <Line className={`h-3.5 mt-1.5 ${w}`} i={i} />
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-[720px]">
            {/* Key Messages — real frame, real eyebrow, real numerals. */}
            <div
              className={`mb-8 p-6 border-[3px] border-double border-border-light space-y-4 ${KEY_MESSAGES_FILL[brand]}`}
            >
              <span className="type-label block mb-3">Key Messages</span>
              {["w-full", "w-11/12", "w-4/5"].map((w, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="type-label mt-2 shrink-0 text-text-secondary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 space-y-2.5">
                    <Line className="h-4 w-full" i={i} />
                    <Line className={`h-4 ${w}`} i={i + 1} />
                  </div>
                </div>
              ))}
            </div>

            {/* Body — paragraphs broken by section headings, on the same
                ~1.4 line-height rhythm as type-body prose. */}
            <div className="space-y-10">
              {[0, 1, 2].map((section) => (
                <div key={section} className="space-y-3.5">
                  {section > 0 && (
                    <Line className="h-6 w-1/2 mb-6" strong />
                  )}
                  {["w-full", "w-full", "w-11/12", "w-full", "w-2/3"].map(
                    (w, i) => (
                      <Line key={i} className={`h-4 ${w}`} i={i} />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        </ArticleLayout>
      </div>
    </div>
  );
}
