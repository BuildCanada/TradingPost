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
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Requires a `.env` file with `DATABASE_URL` (defaults to `file:./dev.db`).

## Design

Custom fonts: **Söhne** (headings), **Financier Text** (body), **Founders Grotesk Mono** (labels/buttons).

Palette: cream background (`#f6ebe3`), dark text (`#272727`), red accent (`#932f2f`).
