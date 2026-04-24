# Build Canada Site — Project Context

## Memo Detail Page Refactor

### 1. Memos Listing — Shrink Header
- **File:** `src/app/memos/page.tsx`
- **Current:** `pt-[120px] pb-[100px] md:pt-[140px] md:pb-[120px]` hero block with display title + subtitle
- **Change:** Reduce padding dramatically. Memos should be the star.

### 2. Social Sharing + PostHog Tracking
- **Share code already exists:** `src/components/share/` (`ShareSection`, `ShareButtons` — X, LinkedIn, Threads, copy link, print)
- **Already imported** in `src/app/memos/[slug]/page.tsx:8`
- **Desktop (`2xl-memo`):** Move share buttons INTO the Signpost `DesktopNav` component, above the TOC. Currently share is hidden on `2xl-memo` breakpoint entirely — Signpost replaces sidebar but doesn't include share.
- **Mobile:** Keep share in the bottom area below the article. Remove Twitter embed and related memos (cruft). Keep share buttons + subscribe.
- **PostHog:** Add `posthog.capture("memo_shared", { platform: "x"|"linkedin"|"threads"|"copy"|"print" })` to each share button click.

### 3. Mobile MobileBar — Only Show After Scrolling Past Hero
- **File:** `src/components/custom/signpost/mobile-bar.tsx`
- **Current:** Always sticky at `top-[70px]` — visible immediately on page load
- **Change:** The bar stays in the layout flow but is invisible/zero-height until its natural position reaches the sticky threshold (`top-[70px]`). Once it would stick, it becomes visible. Implementation: `IntersectionObserver` on the bar itself — when it's no longer intersecting the viewport (scrolled past its natural position), toggle visibility on. Smooth transition on the reveal.

### 4. Remove Mobile Cruft
- **File:** `src/app/memos/[slug]/page.tsx` (lines 242-244, the mobile sidebar)
- **Change:** On mobile, hide the TwitterEmbed and RelatedMemos. Keep ShareSection and MemoSubscribe.

### 5. Fix Desktop Width + Spacing
- **Current:** `MemoHero` uses `max-w-[1400px]` with `px-[5vw]/px-[10vw]`, article is `max-w-[720px]`
- **Issue:** Desktop width is off, spacing between supporters section needs adjustment
- **Needs:** Visual confirmation — screenshots or live review to pinpoint exact spacing issues.

---

## Content Page — Hide + Replace with Great Canadian Builders
- **File:** `src/app/content/page.tsx`
- **Change:** Hide the content page. Create a new "Great Canadian Builders" page. Add it to the nav header.
- **Nav file:** `src/constants/nav-links.ts`

---

## SEO Images Verification
- Audit OG images, Twitter card images, and structured data images across all pages.
