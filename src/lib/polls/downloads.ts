import type { YFPollPublication } from "../api/types";

export const POLL_DOWNLOAD_ASSETS = new Set([
  "analysis_markdown",
  "analysis_pdf_en",
  "analysis_pdf_fr",
  "crosstabs_pdf_en",
  "crosstabs_pdf_fr",
  "crosstabs_json",
  "crosstabs_xlsx",
]);

export const POLL_DOWNLOAD_LABELS = {
  analysis_markdown: "Analysis (Markdown)",
  analysis_pdf: "Analysis (PDF)",
  crosstabs_pdf: "Crosstabs (PDF)",
  crosstabs_json: "Crosstabs (JSON)",
  crosstabs_xlsx: "Crosstabs (Excel)",
};

export function mapPollDownloads(
  slug: string,
  downloads: YFPollPublication["downloads"],
): YFPollPublication["downloads"] {
  // API keys identify report kinds for display; URL assets identify the selected
  // locale (or English fallback). Preserve both instead of deriving one from the other.
  return Object.fromEntries(
    Object.entries(downloads).map(([kind, url]) => {
      const upstream = new URL(url);
      const asset = upstream.pathname.split("/").at(-1)!;
      return [
        kind,
        `/api/polls/${encodeURIComponent(slug)}/downloads/${encodeURIComponent(asset)}${upstream.search}`,
      ];
    }),
  );
}
