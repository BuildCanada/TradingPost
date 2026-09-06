# Poll pages and inline charts

Polls live at `/polls/:slug`, backed by York Factory's separate `Poll` model and
`/api/v1/polls` API. `/polls` lists published polls. Polls and memos share the
article presentation: hero, key messages, table of contents, sharing, subscription
UI, metadata and print header. Poll pages show memo-style Key Takeaways and plain report downloads below the
share icons, followed by methodology and news release; only memos have endorsement/critique controls.

`ArticleContainer` puts fixed page gutters outside the centered content container.
`ArticleLayout` uses a 240px contents column, a 48px gap and a 720px article column
on desktop, and a single column below 1200px. The article stays the same width as
the viewport grows, including ultrawide screens. Posts and Toronto memos reuse it.

York Factory's Polls editor stores analysis markdown, crosstabs JSON, methodology,
a news release, subscriber email copy and a tweet. Saving analysis automatically
generates branded PDFs; replacing crosstabs JSON generates Excel with an index and
one sheet per question.
Email and tweet drafts remain in the admin API, not the public page. Surveyor's
publication export supplies the initial bilingual chart scaffold and crosstabs;
import it through York Factory's Polls screen and add the written analysis and takeaways.
See York Factory's `docs/api/polls.md` for the complete publishing workflow.

## Chart markdown

Wrap the contents of [inline-chart.json](inline-chart.json) in a fenced block whose
language is `buildcanada-chart`, between analysis paragraphs. The block holds
`definition` (the charts 1.x schema) and `dataset: {manifest, rows}`. Data must be
embedded and `definition.data` must be `"inline"`. The example values are illustrative.

`ArticleBody` preserves existing trusted CMS HTML and replaces only explicit chart
fences. Ordinary memos retain their existing HTML rendering path. Each chart provides
hover details, independent chart-type selection (when `types` has multiple entries),
and a searchable/sortable data table. Definitions/manifests/rows are validated, and
malformed charts fail locally rather than taking down the article. Empty values stay
missing. The `.md` representation keeps the source markdown and its chart definitions.

The new package is installed as `@buildcanada/charts-inline` (an npm alias for
`@buildcanada/charts` 1.x). Existing dashboard code remains on its current 0.3.x API;
no dashboard migration or new chart-library release is required. Sass compiles the
1.x chart chrome stylesheet. A font alias registers the site's licensed Söhne file under the library's family
name so browser typography matches its committed text metrics.

To render a chart outside the browser, save the nested `dataset` as `dataset.json`,
save `definition` as `definition.json` and change its `data` to `dataset.json`. Run
`charts validate definition.json` and `charts render definition.json --out chart.svg`.
York Factory uses the same CLI to embed static charts in its generated PDF report.

## Downloads and drafts

Download links use `/api/polls/:slug/downloads/:asset`. The server forwards an admin's
preview token and streams the response from the fixed York Factory API origin.
Only named report assets are allowed; every backend request rechecks publication
access. Downloads bypass caching, including markdown downloads. Public `.md` content
negotiation continues to work as before.

The visible links read “Download Report (PDF)” and “Download Crosstabs (JSON, Excel)”.
They sit beneath desktop share icons and beneath the mobile share section. Pending
or stale generated files are omitted until ready; poll detail reads are uncached
so finished outputs appear on the next request. Filenames include Build Canada, the
release date and poll title.

The API uses stable display keys (`analysis_pdf`, `crosstabs_pdf`) with localized
asset names in their URL values (`analysis_pdf_fr`, `crosstabs_pdf_en`). The frontend
preserves these keys for labels and the URL asset for the proxy, including English
fallback URLs in French responses.

## Checks

- `pnpm test:polls`: chart schema/data validation, CMS fence extraction and localized download contracts.
- `pnpm exec next typegen && pnpm exec tsc --noEmit`.
- ESLint on changed TypeScript files.
- Preview two chart fences in a poll. Verify charts sit between paragraphs, hover
  values, view switching, table search/sort, and independent state without URL edits.
- At mobile width, check chart sizing, data-table scrolling and report download links.
- Preview a draft as an admin; verify downloads work there but return 404 anonymously.

Deploy the companion York Factory migration/API first. Until it is deployed,
existing memo pages continue to work; `/polls` should be rolled out with the backend.
