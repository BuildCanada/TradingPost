# /bills LLM eval suite

Manual evals for the two LLM touchpoints in `/bills`:

- `summarizeBillText` (`services/billApi.ts`) — summary, 8 tenet evaluations, `final_judgment`, 3 Question Period questions.
- `socialIssueGrader` (`services/social-issue-grader.ts`) — binary "is this primarily a social issue" classifier.

The suite calls the **real** functions (full prompt → parse → normalize pipeline) against committed, hand-labeled bill fixtures. It is **run manually only** — it spends OpenAI tokens on a cache miss and is never wired into `build`, `lint`, or CI.

## Running

```bash
export OPENAI_API_KEY=sk-...      # a real key is needed for a real eval
pnpm eval:bills                   # all fixtures (cached where possible)
pnpm eval:bills --refresh         # bypass cache, re-call the API
pnpm eval:bills --only=social     # only the social-issue classifier
pnpm eval:bills --only=analysis   # only summarizeBillText
pnpm eval:bills --grep=tax        # only fixtures whose id contains "tax"
pnpm eval:bills --fallback        # force the no-key fallback path (0 tokens)
```

Exit code is non-zero when any **structural** check fails. Accuracy (judgment
vs label, social-issue confusion matrix) and cross-consistency are reported but
never gate the run — they are probabilistic.

## What it checks

- **Structural** (`checks/analysis-checks.ts`, deterministic, gates the run):
  non-empty summary (steel_man is a human-editable field, not LLM-generated, so
  it is not checked); exactly 8 tenets with ids 1–8 and valid
  `aligns|conflicts|neutral`; valid `final_judgment`; exactly 3 non-empty QP
  questions with no "Mr./Madam Speaker" prefix; no `Build Canada`/`we`/`our`
  self-reference in prose; (soft warning) tenet text not quoted in the summary.
- **Judgment accuracy** — `final_judgment` vs the fixture's `finalJudgment` label.
- **Social-issue accuracy** — `socialIssueGrader` vs `isSocialIssue` label, with
  a confusion matrix and precision/recall.
- **Cross-consistency warning** — flags when `summarizeBillText` abstains but
  `socialIssueGrader` disagrees. This is expected: `summarizeBillText` ignores
  its own `is_social_issue` field, and the app's stored `isSocialIssue` comes
  from the separate grader.

## Caching

Each response is cached to `.cache/` (gitignored), keyed by a hash of the input
text **and** the prompt text. Editing a prompt invalidates its entries
automatically; for other changes (model, reasoning effort) bump `VERSION` in
`lib/cache.ts`. Re-runs read from disk, so iterating on checks/fixtures costs no
tokens. `--refresh` forces a re-call. A machine-readable `report.json` is written
to `.cache/` each run for diffing.

## Adding a fixture

1. Bootstrap from a real bill (optional, needs `CIVICS_PROJECT_API_KEY`):
   ```bash
   pnpm tsx src/app/bills/evals/fixtures/fetch-fixture.ts C-101 my-bill
   ```
   This writes `fixtures/my-bill.md` using the same fetch + `xmlToMarkdown` path
   the app uses. You can also just author a `.md` by hand.
2. Add a labeled record to `fixtures/bills.ts` (`id`, `name`, `markdownFile`,
   and `expected.isSocialIssue` / optional `expected.finalJudgment`). Omit
   `finalJudgment` when the correct call is genuinely ambiguous.

The bundled fixtures are concise synthetic bills chosen to span the decision
space (clear social issue, pro-tenet economic, red-tape, administrative). Swap
in real bills for higher-signal accuracy numbers.
