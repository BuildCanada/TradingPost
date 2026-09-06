import assert from "node:assert/strict";
import test from "node:test";
import {
  mapPollDownloads,
  POLL_DOWNLOAD_ASSETS,
  POLL_DOWNLOAD_LABELS,
} from "./downloads";

for (const locale of ["en", "fr"]) {
  test(`${locale} report display keys retain localized PDF URLs through the proxy`, () => {
    const query = `?locale=${locale}&publication=build_canada`;
    const upstream = "https://yorkfactory.buildcanada.com/api/v1/memos/poll/downloads/";
    const downloads = mapPollDownloads("poll", {
      analysis_pdf: `${upstream}analysis_pdf_${locale}${query}`,
      crosstabs_pdf: `${upstream}crosstabs_pdf_${locale}${query}`,
      analysis_markdown: `${upstream}analysis_markdown${query}`,
      crosstabs_json: `${upstream}crosstabs_json${query}`,
    });
    assert.deepEqual(Object.keys(downloads).sort(), Object.keys(POLL_DOWNLOAD_LABELS).sort());
    for (const kind of Object.keys(POLL_DOWNLOAD_LABELS) as (keyof typeof POLL_DOWNLOAD_LABELS)[]) {
      const asset = kind.endsWith("_pdf") ? `${kind}_${locale}` : kind;
      assert.equal(downloads[kind], `/api/memos/poll/downloads/${asset}${query}`);
      assert.ok(POLL_DOWNLOAD_ASSETS.has(asset), "displayed download is accepted by proxy");
    }
  });
}

test("French requests preserve the API's English PDF fallback", () => {
  const downloads = mapPollDownloads("poll", {
    analysis_pdf: "https://example.com/api/v1/memos/poll/downloads/analysis_pdf_en?locale=fr&publication=build_canada",
  });
  assert.deepEqual(downloads, {
    analysis_pdf: "/api/memos/poll/downloads/analysis_pdf_en?locale=fr&publication=build_canada",
  });
  assert.deepEqual(mapPollDownloads("poll", {}), {});
});
