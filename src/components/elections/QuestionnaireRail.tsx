import type { ReactNode } from "react";

import { Signpost } from "@/components/custom/signpost";
import type { Heading } from "@/components/custom/signpost/config";

/**
 * The memo pages' scroll rail, around a questionnaire.
 *
 * WHY THESE PAGES WANT IT
 *   A questionnaire read is thirty-odd cards in eight or nine titled sections,
 *   which is memo-length without being a memo: a reader who wants housing has
 *   to scroll past transit to find out whether they have passed it. The rail
 *   is the same answer it is on a memo — where am I, what is left, and a way to
 *   jump — and using the same component means it behaves identically on both,
 *   rather than being a second thing that looks like the first.
 *
 * THE TWO CONTRACTS IT HAS TO HONOUR
 *   · Every heading in `headings` must exist in the document under that id, or
 *     the rail lists a section it cannot scroll to. QuestionnaireCards puts the
 *     ids on for us — see `questionnaireHeadings`, which is the only supported
 *     way to build the list.
 *   · Reading progress is measured off `[data-memo-content]`, and the hook
 *     takes the first one in the document. So this marks the content once, and
 *     a page must not nest two of these.
 *
 * THE COLUMN
 *   Only at `2xl-memo` (1200px), the same breakpoint the memos use, and below
 *   it the rail becomes the sticky bar and the content takes the full width.
 *   The tracker's pages are already padded by their section, so this adds none
 *   of its own — it divides the width it is handed.
 */
export function QuestionnaireRail({
  headings,
  children,
}: {
  headings: Heading[];
  children: ReactNode;
}) {
  /* Nothing to point at — a rail listing no sections is a 220px hole down the
     side of the page. */
  if (headings.length === 0) return <>{children}</>;

  return (
    <div className="2xl-memo:grid 2xl-memo:grid-cols-[220px_minmax(0,1fr)] 2xl-memo:gap-12">
      <Signpost headings={headings} showTopBorder={false} />
      <div data-memo-content className="min-w-0">
        {children}
      </div>
    </div>
  );
}
