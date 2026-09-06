import { POLL_DOWNLOAD_LABELS } from "@/lib/polls/downloads";
import type { YFPollPublication } from "@/lib/api/types";
import { ArticleBody } from "./ArticleBody";

export function PollDownloads({ poll }: { poll: YFPollPublication }) {
  return (
    <section
      aria-label="Poll information"
      className="mb-8 border border-border-light p-5 space-y-3"
    >
      <p className="type-label">Poll analysis</p>
      {poll.pollster && <p>Conducted by {poll.pollster}</p>}
      {poll.sample_size != null && (
        <p>Sample: {poll.sample_size.toLocaleString("en-CA")}</p>
      )}
      {(poll.fieldwork_start || poll.fieldwork_end) && (
        <p>
          Fieldwork:{" "}
          {[poll.fieldwork_start, poll.fieldwork_end]
            .filter(Boolean)
            .join(" – ")}
        </p>
      )}
      <ul className="flex flex-wrap gap-4">
        {Object.entries(POLL_DOWNLOAD_LABELS).map(([key, label]) => {
          const url = poll.downloads[key as keyof typeof POLL_DOWNLOAD_LABELS];
          return url ? (
            <li key={key}>
              <a href={url} className="underline">
                {label}
              </a>
            </li>
          ) : null;
        })}
      </ul>
    </section>
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
