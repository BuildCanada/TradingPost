# Builder MP (`/bills`)

Builder MP is a builder-first analysis layer over Canadian federal legislation.
It fetches real bills from the current Parliament, uses an LLM to summarize each
one and evaluate it against Build Canada's pro-growth tenets, and renders a
plain-language verdict — align (`yes`), conflict (`no`), or `abstain` — alongside
a per-tenet breakdown and Question-Period-style questions an MP might actually
ask. The goal (from the in-app FAQ): _"so that Canadians could easily understand
parliamentary bills and how they align with a pro-growth stance."_

Bill data comes from [The Civics Project](https://civicsproject.org), which
mirrors the Government of Canada's open parliamentary feeds. The app currently
tracks **Parliament 45**.

## The analysis model

Every analyzed bill produces a `BillAnalysis` (see `services/billApi.ts`) with:

- **`summary`** — 3–5 sentence plain-language summary (markdown, bulleted).
- **`tenet_evaluations`** — exactly 8 entries, one per Build Canada tenet, each
  marked `aligns | conflicts | neutral` with a short explanation.
- **`final_judgment`** — `yes | no | abstain`.
- **`question_period_questions`** — exactly 3 critical MP-style questions (no
  "Mr./Madam Speaker" prefix).
- **`rationale`**, `short_title`, `needs_more_info`, `missing_details`, and
  `steel_man` (an editorially-maintained field, not LLM-generated — see below).

### Build Canada's tenets

The judgment is grounded in 8 tenets defined in `prompt/summary-and-vote-prompt.ts`:

1. Canada should aim to be the world's most prosperous country.
2. Promote economic freedom, ambition, and breaking from bureaucratic inertia (reduce red tape).
3. Drive national productivity and global competitiveness, including removing interprovincial trade barriers and improving labour mobility (one country, one market).
4. Grow exports of Canadian products and resources, and move up the value chain by processing resources domestically rather than exporting them raw.
5. Encourage investment, innovation, and resource development.
6. Deliver better public services at lower cost (government efficiency).
7. Reform taxes to incentivize work, risk-taking, and innovation.
8. Focus on large-scale prosperity, not incrementalism.

The prompt also carries explicit **align/conflict signals** (e.g. removing trade
barriers → align; protectionism, new red tape, or large redistributive spending
→ conflict) so borderline judgments stay consistent. These tenets and signals
track Build Canada's documented positions at [buildcanada.com](https://www.buildcanada.com).

### The two LLM touchpoints

- **`summarizeBillText`** (`services/billApi.ts`) — the main analysis pass
  (`gpt-5`, high reasoning effort). Produces the full `BillAnalysis` above.
- **`socialIssueGrader`** (`services/social-issue-grader.ts`) — a small binary
  classifier: is the bill *primarily* a social/rights/identity/culture issue?
  When yes, the app treats the bill as out of the economic-tenet scope and
  the judgment is `abstain`.

Both functions degrade gracefully to deterministic fallback output when
`OPENAI_API_KEY` is unset (they never throw).

> **Note on `steel_man`:** it is a persisted, human-editable field (admin edit
> page), **not** produced by the analysis prompt. `summarizeBillText` correctly
> leaves it empty; editors fill it in. The eval suite deliberately does not
> assert it.

## Data flow

```
Civics Project API ──► getBillFromCivicsProjectApi ──► fetchBillMarkdown (xml→md)
                                                            │
                                summarizeBillText + socialIssueGrader (LLM)
                                                            │
                                     onBillNotInDatabase → persist to MongoDB
                                                            │
        page.tsx / [id]/page.tsx ◄── getUnifiedBillById ◄── Bill model
```

- **List page** (`page.tsx` → `BillExplorer.tsx`) reads analyzed bills from the
  DB and renders filterable cards.
- **Detail page** (`[id]/page.tsx`) renders the summary, per-tenet breakdown
  (`components/BillDetail/BillTenets.tsx`), judgment badge
  (`components/Judgement/`), and QP questions.
- Analyzed results are cached in **MongoDB** (`models/Bill.ts`) so a bill is only
  sent to the LLM once (re-run explicitly via the reprocess route).

## Directory map

| Path | Responsibility |
|---|---|
| `page.tsx`, `BillExplorer.tsx` | List page + client-side filtering |
| `[id]/page.tsx`, `components/BillDetail/*` | Bill detail view |
| `[id]/edit/page.tsx` | Admin edit form (gated) |
| `prompt/summary-and-vote-prompt.ts` | Tenets, social-issue rules, judgment signals, output schema |
| `services/billApi.ts` | Civics fetch, `summarizeBillText`, markdown conversion, DB persistence |
| `services/social-issue-grader.ts` | Binary social-issue classifier |
| `server/*` | DB + Civics read helpers (`getUnifiedBillById`, etc.) |
| `models/*` | Mongoose `Bill` and `User` schemas |
| `api/[id]/route.ts`, `api/[id]/reprocess/route.ts` | Update / re-analyze a bill (gated) |
| `utils/xml-to-md/` | Deterministic bill-XML → markdown conversion |
| `evals/` | Manual LLM eval suite — see `evals/README.md` |

## Auth

Read access to the public pages is open. **Admin actions (edit, reprocess) are
gated** by `requireAuthenticatedUser` (`lib/auth-guards.ts`): Google sign-in via
NextAuth, and the signed-in email must exist in the `User` allowlist in the DB.

For local development, set `BILLS_DEV_OPEN_ACCESS=true` **and** a non-production
`NODE_ENV` to bypass the allowlist entirely (both conditions are required so it
can never activate by accident in production — see `env.ts`).

## Environment

Configured in `env.ts`. Put these in `.env.local` for local dev.

| Var | Purpose |
|---|---|
| `OPENAI_API_KEY` | LLM analysis + social grader (fallback output if unset) |
| `CIVICS_PROJECT_API_KEY` | Fetch bills from the Civics Project API |
| `CIVICS_PROJECT_BASE_URL` | Defaults to `https://api.civicsproject.org` |
| `MONGO_URI` (or `MONGODB_URI`) | Analyzed-bill + user store |
| `NEXTAUTH_URL`, `NEXTAUTH_SECRET` (or `AUTH_SECRET`) | NextAuth session |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth provider |
| `NEXT_PUBLIC_APP_URL` | Absolute URL for OG/metadata |
| `BILLS_DEV_OPEN_ACCESS` | Dev-only admin bypass (see Auth) |

## Local development

```bash
pnpm dev            # Next.js dev server on :5050 — visit /bills
```

## Evaluating the LLM features

The `evals/` directory holds a manual, token-conscious eval suite that runs the
real `summarizeBillText` and `socialIssueGrader` against committed, hand-labeled
**real Parliament-45 bills** (fixtures span align / conflict / abstain /
administrative). It gates on deterministic structural checks and reports
judgment + social-issue accuracy.

```bash
pnpm eval:bills               # run all fixtures (cached where possible)
pnpm eval:bills --refresh     # bypass cache, re-call the API
```

See **`evals/README.md`** for the full guide (flags, caching, adding fixtures).
