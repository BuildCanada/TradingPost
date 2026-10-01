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
- **`steel_man`** — the strongest good-faith case *against* the judgment just
  given, rendered on the bill page under "The other side".
- **`isSocialIssue`** — whether the bill is primarily a social/rights/identity
  issue. When true the judgment is forced to `abstain`: Builder MP weighs bills
  on economic tenets and takes no position on social questions.
- **`rationale`**, `short_title`, `needs_more_info`, `missing_details`.

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

### The LLM touchpoint

**`summarizeBillText`** (`services/billApi.ts`) is the only LLM call: one
`gpt-5` pass at high reasoning effort producing the whole `BillAnalysis`,
including `is_social_issue`. It uses **OpenAI Structured Outputs** against
`prompt/analysis-schema.ts`, so the shape is guaranteed — no markdown fence to
strip, no enum to re-case, no parse fallback. The prompt carries the judgment;
the schema carries the format.

`fromRawAnalysis` then applies the one rule the prompt states but cannot enforce
on itself: a bill that is primarily a social issue abstains, whatever judgment
the model reached.

The function degrades gracefully to deterministic fallback output when
`OPENAI_API_KEY` is unset (it never throws). A fallback carries `isFallback` and
is never persisted or posted to Slack.

## Data flow

Analysis happens on a schedule, never inside a page render.

```
      ┌─ src/instrumentation.ts (interval)  ─┐
      │                                      ├─► refreshBills()  [Mongo lease]
      └─ POST /bills/api/refresh (secret)   ─┘          │
                                                        ├─ every bill: updateBillFacts
                                                        │    (status, stages, sponsor)
                                                        └─ changed/new only, up to budget:
                                                             fetchBillMarkdown (xml→md)
                                                             summarizeBillText (LLM)
                                                             saveBillAnalysis → MongoDB
                                                             notifyNewBillAnalysis → Slack

  page.tsx ──────────┐
                     ├─► mergeBillLists / applyApiFacts ──► API facts + stored verdict
  [id]/page.tsx ─────┘
```

**Precedence, applied on both pages** (`utils/merge-bill.ts`): factual fields —
status, stages, sponsor, genres — come from the Civics API; the verdict —
summary, tenets, judgment, rationale, steel man — comes from the database. Both
pages go through the same helper, so they cannot disagree about a bill's status.

- **List page** (`page.tsx` → `BillExplorer.tsx`) renders filterable cards.
- **Detail page** (`[id]/page.tsx`) renders the summary, per-tenet breakdown,
  judgment badge, steel man, QP questions, and a provenance line saying when the
  verdict was computed and from which bill text.
- A bill the sweep has not reached yet shows its real facts with "Analysis
  pending" in place of a verdict.

### The refresh sweep

`services/refresh.ts` is the only thing that spends OpenAI calls automatically.
It takes a Mongo lease (`models/JobLock.ts`) so multiple replicas are safe, and
re-analyzes a bill only when it is new, has no analysis, or its bill text has
changed — the decision lives in `services/refresh-decision.ts` and is unit
tested. A per-sweep `analysisBudget` (default 10) bounds the cost; bills over
budget still get their facts refreshed and are picked up next sweep.

Run one by hand:

```bash
curl -X POST localhost:5050/bills/api/refresh \
  -H "Authorization: Bearer $BILLS_CRON_SECRET"
# optional body: {"analysisBudget": 3, "force": true}
```

## Directory map

| Path | Responsibility |
|---|---|
| `page.tsx`, `BillExplorer.tsx` | List page + client-side filtering |
| `[id]/page.tsx`, `components/BillDetail/*` | Bill detail view |
| `[id]/edit/page.tsx` | Admin edit form (gated) |
| `prompt/summary-and-vote-prompt.ts` | Tenets, social-issue rules, judgment signals |
| `prompt/analysis-schema.ts` | Structured-output JSON schema for the response |
| `services/billApi.ts` | Civics fetch, `summarizeBillText`, markdown conversion, DB writes |
| `services/refresh.ts`, `services/refresh-decision.ts` | The scheduled sweep and its re-analysis decision |
| `utils/merge-bill.ts` | API-facts / stored-verdict precedence, shared by both pages |
| `models/JobLock.ts` | Mongo lease so one sweep runs at a time |
| `src/instrumentation.ts` (repo root) | Schedules the sweep on server start |
| `server/*` | DB + Civics read helpers (`getUnifiedBillById`, etc.) |
| `models/*` | Mongoose `Bill` and `User` schemas |
| `api/[id]/route.ts`, `api/[id]/reprocess/route.ts` | Update / re-analyze a bill (gated) |
| `api/refresh/route.ts` | Run the sweep on demand (bearer token) |
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
| `OPENAI_API_KEY` | LLM analysis (fallback output if unset) |
| `CIVICS_PROJECT_API_KEY` | Fetch bills from the Civics Project API |
| `CIVICS_PROJECT_BASE_URL` | Defaults to `https://api.civicsproject.org` |
| `MONGO_URI` (or `MONGODB_URI`) | Analyzed-bill + user store |
| `NEXTAUTH_URL`, `NEXTAUTH_SECRET` (or `AUTH_SECRET`) | NextAuth session |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth provider |
| `NEXT_PUBLIC_APP_URL` | Absolute URL for OG/metadata |
| `BILLS_DEV_OPEN_ACCESS` | Dev-only admin bypass (see Auth) |
| `BILLS_SLACK_WEBHOOK_URL` | Slack incoming webhook for #builder-mp — posts each newly generated analysis (summary, overall vote, tenet breakdown). No posts if unset. |
| `BILLS_REFRESH_ENABLED` | `true` starts the scheduled sweep. Off by default, so dev and one-off containers never spend tokens. |
| `BILLS_REFRESH_INTERVAL_MINUTES` | Sweep interval. Defaults to 60. |
| `BILLS_CRON_SECRET` | Bearer token for `POST /bills/api/refresh`. Without it the route returns 503. |

## Local development

```bash
pnpm dev            # Next.js dev server on :5050 — visit /bills
pnpm test:bills     # unit tests for the merge precedence and sweep decision
```

## Evaluating the LLM features

The `evals/` directory holds a manual, token-conscious eval suite that runs the
real `summarizeBillText` against committed, hand-labeled
**real Parliament-45 bills** (fixtures span align / conflict / abstain /
administrative). It gates on deterministic structural checks and reports
judgment + social-issue accuracy.

```bash
pnpm eval:bills               # run all fixtures (cached where possible)
pnpm eval:bills --refresh     # bypass cache, re-call the API
```

See **`evals/README.md`** for the full guide (flags, caching, adding fixtures).
