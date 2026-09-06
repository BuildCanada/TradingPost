import { apiFetch } from "./client";
import { mapArticleDetail } from "./articles";
import type { YFPaginatedResponse, YFPoll, YFPollDetail } from "./types";

export async function fetchPolls() {
  const fetchPage = (page: number) =>
    apiFetch<YFPaginatedResponse<YFPoll>>("/polls", {
      params: { page: String(page) },
      revalidate: 60,
    });
  const first = await fetchPage(1);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, first.pagination.pages - 1) }, (_, i) => fetchPage(i + 2)),
  );
  return [first, ...rest].flatMap(({ data }) => data).map((poll) => ({
    id: String(poll.id), slug: poll.slug, title: poll.title, publishedAt: poll.published_at,
  }));
}

export async function fetchPoll(slug: string) {
  return mapArticleDetail(await apiFetch<YFPollDetail>(`/polls/${slug}`, {
    // Generated assets can finish between requests; never cache a stale download set.
    revalidate: 0,
    tags: [`poll:${slug}`],
  }));
}
