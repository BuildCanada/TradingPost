import type { YFPollPublication } from "@/lib/api/types";
import { ArticleBody } from "./ArticleBody";

export function PollDownloads({ poll }: { poll: YFPollPublication }) {
  const { analysis_pdf, crosstabs_json, crosstabs_xlsx } = poll.downloads;
  return (
    <div className="space-y-2 text-sm">
      {analysis_pdf && <p><a href={analysis_pdf} className="underline">Download Report (PDF)</a></p>}
      {(crosstabs_json || crosstabs_xlsx) && <p>Download Crosstabs ({crosstabs_json && <a href={crosstabs_json} className="underline">JSON</a>}{crosstabs_json && crosstabs_xlsx && ", "}{crosstabs_xlsx && <a href={crosstabs_xlsx} className="underline">Excel</a>})</p>}
    </div>
  );
}

export function PollSupportingContent({ poll }: { poll: YFPollPublication }) {
  return (
    <div className="mt-10 space-y-8">
      {poll.methodology && (
        <section>
          <h2 id="poll-methodology" className="type-title-sm mb-4">
            Methodology
          </h2>
          <ArticleBody html={poll.methodology} />
        </section>
      )}
      {poll.news_release && (
        <section>
          <h2 id="poll-news-release" className="type-title-sm mb-4">
            News release
          </h2>
          <ArticleBody html={poll.news_release} />
        </section>
      )}
    </div>
  );
}
