# People Context

## 1. Overview

The `Person` model is the central identity record in the Build Canada CMS. It serves two purposes:

1. **Team display** — People with roles `CORE`, `BOARD`, or `ADVISOR` are rendered on the `/about` page in a grouped team grid.
2. **Memo authorship** — Every `Memo` references exactly one `Person` as its author. Author info (name, photo) is displayed on memo cards, memo detail pages, and in JSON-LD structured data.

People also optionally link to `Testimonial` records. When a testimonial has an associated Person, the Person's full profile data is used for JSON-LD Review schemas.

The model is stored in SQLite via Prisma and managed through the `/admin` dashboard under the "About Us CMS" section.

---

## 2. Data Model

**Prisma schema** (`prisma/schema.prisma:27-43`):

```prisma
model Person {
  id          String   @id @default(cuid())
  name        String
  title       String?
  role        String   @default("CORE")
  photo       String?
  xUrl        String?
  linkedinUrl String?
  websiteUrl  String?
  bio         String?
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  memos       Memo[]
  testimonial Testimonial?
}
```

### Field Reference

| Field | Type | Default | Description |
|---|---|---|---|
| `id` | `String` | `cuid()` | Primary key |
| `name` | `String` | — | Display name (required) |
| `title` | `String?` | `null` | Job title / role description |
| `role` | `String` | `"CORE"` | Categorization role. Values: `CORE`, `BOARD`, `ADVISOR`, `AUTHOR` |
| `photo` | `String?` | `null` | URL to profile photo (uploaded via `/api/upload`) |
| `xUrl` | `String?` | `null` | Twitter/X profile URL |
| `linkedinUrl` | `String?` | `null` | LinkedIn profile URL |
| `websiteUrl` | `String?` | `null` | Personal website URL |
| `bio` | `String?` | `null` | Biographical text |
| `order` | `Int` | `0` | Display sort order (ascending) |
| `createdAt` | `DateTime` | `now()` | Record creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Auto-updated on modification |

### TypeScript Interface

**`src/app/about/types.ts`**:

```ts
export interface Person {
  id: string;
  name: string;
  title: string | null;
  role: string;
  photo: string | null;
  xUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  bio: string | null;
  order: number;
}
```

**Admin GUI interface** (`src/app/admin/page.tsx:77-88`):

```ts
interface PersonItem {
  id: string;
  name: string;
  title: string | null;
  role: string;
  photo: string | null;
  xUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  bio: string | null;
  order: number;
}
```

---

## 3. Relations

### Person → Memo (one-to-many)

- `Person.memos: Memo[]` — all memos authored by this person
- `Memo.authorId: String` — foreign key pointing to `Person.id`
- `Memo.author: Person` — relation with `onDelete: Restrict` (cannot delete a Person who has memos)

### Person → Testimonial (one-to-one, optional)

- `Person.testimonial: Testimonial?` — the testimonial linked to this person (if any)
- `Testimonial.personId: String?` — optional foreign key, `@unique`
- `Testimonial.person: Person?` — relation via `personId → Person.id`

When a Testimonial has a `personId`, the Person's profile data (name, title, photo, bio, social URLs) is used for JSON-LD Review schemas instead of the Testimonial's own `name`/`profilePhoto` fields.

---

## 4. Admin GUI

People are managed in the `/admin` dashboard under the **"About Us CMS"** section (selected via the dropdown at the top of the page).

### People Form

The form creates or edits a single Person record. Fields rendered:

| Form Field | Input Type | Maps To | Notes |
|---|---|---|---|
| Name | `text` (required) | `name` | |
| Title | `text` (required) | `title` | |
| Role | `select` | `role` | Options: Core Team (`CORE`), Advisor (`ADVISOR`), Board (`BOARD`), Author (`AUTHOR`) |
| X (Twitter) URL | `url` | `xUrl` | |
| LinkedIn URL | `url` | `linkedinUrl` | |
| Website URL | `url` | `websiteUrl` | |
| Bio | `textarea` | `bio` | |
| Photo | `file` upload | `photo` | Uploaded via `/api/upload`, stores URL |
| Display Order | `number` | `order` | |

### CRUD Operations

| Operation | HTTP Method | Endpoint | Behavior |
|---|---|---|---|
| **Create** | `POST` | `/api/people` | Creates a new Person with all form fields |
| **Read** | `GET` | `/api/people` | Returns all people ordered by `order ASC` |
| **Update** | `PUT` | `/api/people` | Updates person by `id` in request body |
| **Delete** | `DELETE` | `/api/people` | Deletes person by `id` in request body |

### People List

Below the form, all people are listed in a flat list showing: photo thumbnail, name, title, role badge, order number, and Edit/Delete buttons.

### People as Memo Author

In the **Memos CMS** section, the memo form includes an Author dropdown (`<select>`) populated from the people list. This sets `memoForm.authorId` to the selected Person's `id`.

### People as Linked Testimonial

In the **About Us CMS** section (under Testimonials), the testimonial form includes a "Linked Person" dropdown that sets `testimonialForm.personId`.

---

## 5. Consumers

### Pages

| File | How Person is Used |
|---|---|
| `src/app/about/page.tsx:26` | Fetches all people via `prisma.person.findMany({ orderBy: { order: "asc" } })`, filters to `role !== "AUTHOR"` and passes to `TeamBlock` |
| `src/app/page.tsx:17-34` | Homepage fetches memos with `include: { author: true }`. Maps `author.name` and `author.photo` into serialized memo data. Special-cases `"Build Canada"` author to use logo instead of personal photo. |
| `src/app/memos/page.tsx:29-54` | Memos listing page fetches all memos with `include: { author: true }`, serializes author name/photo the same way as homepage. |
| `src/app/memos/[slug]/page.tsx:60` | Memo detail page fetches single memo with `include: { author: true }`. Uses `author.name`, `author.photo`, `author.title`, `author.bio`, `author.websiteUrl`, `author.xUrl`, `author.linkedinUrl` for display and JSON-LD. |
| `src/app/admin/page.tsx:230-233` | Admin loads people via `GET /api/people` for the people list and the memo author dropdown. |

### Components

| File | How Person is Used |
|---|---|
| `src/app/about/TeamBlock.tsx` | Receives `members: Person[]`, groups by role (`CORE` → "Core Team", `BOARD` → "Board", `ADVISOR` → "Advisors"), renders `TeamMemberCard` for each. Shows photo, name, title, and social links (X, LinkedIn). |
| `src/components/TestimonialsBlock.tsx` | Receives testimonials (which may include `person` relation via `include: { person: true }`). The `Testimonial` interface does not expose the Person relation directly in this client component — person data is consumed server-side for JSON-LD only. |
| `src/components/ui/memo-card.tsx` | `MemoCard` receives a `Memo` type with `author: { name: string; photo: string | null }`. Renders author photo and name on memo cards. |
| `src/components/FeaturedMemos.tsx` | (indirect) Renders `MemoCard` components with author data from serialized memos. |

### API Routes

| File | How Person is Used |
|---|---|
| `src/app/api/people/route.ts` | Full CRUD for Person model: `GET` (list all), `POST` (create), `PUT` (update by id), `DELETE` (delete by id). |
| `src/app/api/memos/route.ts` | `GET` returns memos with `include: { author: true }`. `POST` creates memos referencing `authorId`. |
| `src/app/api/memos/[slug]/route.ts` | `GET`, `PATCH`, `DELETE` for single memo — all include `{ author: true }`. `PATCH` accepts `authorId` updates. |
| `src/app/api/testimonials/route.ts` | `GET` returns testimonials with `include: { person: true }`. `POST`/`PUT` accept optional `personId`. |
| `src/app/api/backup/export/route.ts:27-31` | Exports all Person rows to CSV in `backups/people_{timestamp}.csv` and `backups/people_latest.csv`. |
| `src/app/api/backup/import/route.ts:179-218` | Imports Person rows from CSV (or Google Sheets) using upsert. In `replace` mode, wipes all people first. Parses all Person fields from CSV strings. |

### JSON-LD Schema Generators

| File | How Person is Used |
|---|---|
| `src/lib/schemas/generators/person.ts` | `generatePersonSchema(person: PersonData)` — generates a Schema.org `Person` node with `name`, `jobTitle`, `image`, `description`, `url`, `sameAs` (built from `xUrl` + `linkedinUrl` + `websiteUrl`). |
| `src/lib/schemas/generators/article.ts` | `generateArticleSchema(memo, author, config)` — uses `generatePersonSchema` for the `author` field of an `Article` schema. Called from memo detail page with full Person data. |
| `src/lib/schemas/generators/review.ts` | `generateReviewSchema(testimonial, config)` — if `testimonial.person` is set, uses `generatePersonSchema(person)` for the Review's `author`. Otherwise falls back to a simple Person node using testimonial's own `name`/`title`/`profilePhoto`. Called from both homepage and about page. |

### Scripts

| File | How Person is Used |
|---|---|
| `prisma/seed.ts` | Seeds people from `authors.csv`. Maps CSV "Role" column: `"Team"` → `CORE`, `"Board"` → `BOARD`, else `ADVISOR`. Non-team CSV entries get `"AUTHOR"`. Also creates a special `"Build Canada"` person with `role: "CORE"`, `order: -1`. |
| `scripts/import-memos.ts` | Resolves memo authors from `authors.csv` by slug. For each unique author name, calls `resolveAuthorId()` which either finds an existing Person by name or creates a new one with `role: "AUTHOR"`. Also upserts the `"Build Canada"` person with a fixed id `"build-canada"`. |

---

## 6. Seeding

### `prisma/seed.ts` — `seedPeople()`

Reads `authors.csv` from the project root. Expected CSV columns:

| CSV Column | Maps To | Notes |
|---|---|---|
| `Name` | `name` | Required |
| `Slug` | (lookup key) | Stored in `authorLookup` map for memo seeding |
| `Role` | `role` | `"Team"` → `CORE`, `"Board"` → `BOARD`, anything else → `ADVISOR` for team members; `"AUTHOR"` for non-team |
| `Title` | `title` | |
| `Profile Photo` | `photo` | |
| `Twitter` | `xUrl` | |
| `LinkedIn` | `linkedinUrl` | |
| `Team Order` | `order` | Only used for team members |

Role mapping logic (`prisma/seed.ts:32-38`):
- CSV `Role` is `"Team"` or `"Board"` or `"Volunteer"` → treated as team member
  - `"Team"` → `CORE`
  - `"Board"` → `BOARD`
  - `"Volunteer"` → `ADVISOR` (falls through to default)
- All other CSV roles → `AUTHOR`

A special `"Build Canada"` person is created with `id` auto-generated, `role: "CORE"`, `order: -1`. This serves as the default author for memos that don't have a specific builder assigned.

### `scripts/import-memos.ts`

Reads `authors.csv` and `Memoscsv.csv`. For each memo, resolves the author by looking up the `Builder` slug in the author map. If no Person exists with that name, a new Person is created with `role: "AUTHOR"`. Also upserts a `"Build Canada"` person with fixed `id: "build-canada"`.

---

## 7. Role Reference

| Role Value | Label in Admin | Label on About Page | CSV Mapping | Purpose |
|---|---|---|---|---|
| `CORE` | Core Team | Core Team | CSV `"Team"` | Core team members displayed first in the team grid |
| `BOARD` | Board | Board | CSV `"Board"` | Board members displayed as a separate group |
| `ADVISOR` | Advisor | Advisors | CSV anything else (e.g. `"Volunteer"`) | Advisors displayed as a third group |
| `AUTHOR` | Author | *(not shown)* | Non-team CSV entries | Memo authors who are not team members — excluded from the `/about` team display |

### Where Each Role Appears

- **`CORE`**: About page team grid ("Core Team" group), admin People list, memo author dropdown, JSON-LD schemas
- **`BOARD`**: About page team grid ("Board" group), admin People list, memo author dropdown, JSON-LD schemas
- **`ADVISOR`**: About page team grid ("Advisors" group), admin People list, memo author dropdown, JSON-LD schemas
- **`AUTHOR`**: Admin People list, memo author dropdown, JSON-LD schemas only — **filtered out** of the about page team display via `people.filter((p) => p.role !== "AUTHOR")` in `src/app/about/page.tsx:97`

### Special Case: "Build Canada" Person

There is a synthetic Person record with `name: "Build Canada"` used as the default memo author. On the homepage and memos listing page, when `author.name === "Build Canada"`, the author photo is overridden to `/assets/logos/buildcanada-logo-square.svg` instead of using `author.photo`. This logic lives in:
- `src/app/page.tsx:27-29`
- `src/app/memos/page.tsx:41-43`
- `src/app/memos/[slug]/page.tsx:64-67`
