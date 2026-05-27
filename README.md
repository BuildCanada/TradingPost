# Build Canada

Website for Build Canada — a content platform with memos, a multi-source feed, and an admin CMS.

## Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Database**: SQLite via LibSQL + Prisma 7
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── about/                # About — team, testimonials, Q&A
│   ├── memos/                # Memo listing + /[slug] detail (static gen)
│   ├── feed/                 # Multi-source feed + /[id] detail (blogs only)
│   ├── admin/                # CMS — memo & feed CRUD, image upload
│   ├── api/
│   │   ├── memos/            # Memo CRUD endpoints
│   │   ├── feed/             # Feed CRUD + Google Sheets sync
│   │   ├── upload/           # Image upload → /public/uploads/
│   │   └── embed/            # Twitter embed generation
│   ├── robots.ts             # Disallows /admin, /api
│   └── sitemap.ts
├── components/               # Navbar, Footer, FeaturedMemos, FeedPreview, RichTextEditor, etc.
└── lib/
    └── prisma.ts             # Prisma client singleton (LibSQL adapter)
```

## Database Models

**Memo** — title, slug, author, key messages (x3), markdown body, supporters, images, category, featured flag

**FeedItem** — type (BLOG | SUBSTACK | X | TIKTOK | IG | YOUTUBE), title, author, url, sourceUrl (unique, for dedup), featured flag

Schema: [prisma/schema.prisma](prisma/schema.prisma)

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET/POST | `/api/memos` | List / create memos |
| GET/PATCH/DELETE | `/api/memos/[slug]` | Read / update / delete memo |
| GET/POST | `/api/feed` | List / create feed items |
| GET | `/api/feed/[id]` | Get feed item |
| POST | `/api/feed/sync` | Sync from Google Sheets CSV |
| POST | `/api/upload` | Upload image |

## Setup

```bash
pnpm install
pnpm prisma generate
pnpm prisma db push
pnpm dev
```

Requires a `.env` file with `DATABASE_URL` (defaults to `file:./dev.db`).

## Environment variables

Required in production:

| Variable | Purpose | Notes |
|----------|---------|-------|
| `NEXT_PUBLIC_SITE_URL` | Canonical/OG/sitemap base URL | e.g. `https://buildcanada.com`. Used by `layout.tsx`, `sitemap.ts`, `robots.ts`, `lib/api/config.ts`, and JSON-LD. |
| `NEXT_PUBLIC_TRACKER_API_BASE` | Backend host for `/tracker/api/*` rewrites | Set to wherever the Outcomes Tracker API is served. Falls back to `https://www.buildcanada.com`, which will loop after cutover. |
| `YORK_FACTORY_API_URL` | York Factory CMS base URL | Defaults to `https://yorkfactory.buildcanada.com/api/v1`. Override per environment. |
| `LUMA_API_KEY` | Luma events list (`/api/events`) | Without this the homepage events list silently returns empty. |

Recommended:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_POSTHOG_TOKEN` | PostHog analytics + client-side exception capture (`error.tsx` boundaries report here). |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog UI host. Defaults to `https://us.i.posthog.com`. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics. Loader is conditional — omit to disable. |
| `TRACKER_API_BASE` | Server-only override for tracker API base (read in `lib/tracker-api.ts` when no public var is set). |

## Deployment notes

- Set the env vars above before building. Several are baked into the static output (`NEXT_PUBLIC_*`), so a redeploy is required to change them.
- After cutover, verify `/sitemap.xml` and `/robots.txt` reference the production domain.
- Verify `/tracker` loads — if the API base is misconfigured it will silently fail to render data.
- Cloudflare-proxied projects (e.g. `/exit-tax-calculator`, `/bills`) are not served by Next; ensure their proxy rules survive any DNS / origin change.

## Design

Custom fonts: **Söhne** (headings), **Financier Text** (body), **Founders Grotesk Mono** (labels/buttons).

Palette: cream background (`#f6ebe3`), dark text (`#272727`), red accent (`#932f2f`).
