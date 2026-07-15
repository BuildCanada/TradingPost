import {
  humanizeSourceName,
  humanizeSourceUrl,
  type EconomySeriesResponse,
} from "@/lib/api/economy";

function formatFetchedDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", { dateStyle: "long" }).format(date);
}

export default function SourceLine({
  response,
}: {
  response: EconomySeriesResponse;
}) {
  const source = response.meta.source;
  if (!source) return null;
  const updated = source.last_fetched_at
    ? formatFetchedDate(source.last_fetched_at)
    : "";
  const sourceName = humanizeSourceName(source.name);
  const sourceUrl = humanizeSourceUrl(source.name, source.url);
  return (
    <p className="mt-3 type-label-sm text-dark/60">
      Source:{" "}
      {sourceUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-dark"
        >
          {sourceName}
        </a>
      ) : (
        sourceName
      )}
      {updated && <> &middot; Updated {updated}</>}
    </p>
  );
}
