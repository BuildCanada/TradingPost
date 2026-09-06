import { mapArticleDetail } from "./articles";
import { apiFetch } from "./client";
import type {
  YFListResponse,
  YFMemo,
  YFMemoDetail,
  YFPaginatedResponse,
  YFTeamMember,
} from "./types";

interface MemoSerialized {
  id: string;
  title: string;
  slug: string;
  author: { name: string; photo: string | null; title: string | null };
  keyMessage1: string | null;
  keyMessage2: string | null;
  keyMessage3: string | null;
  bannerImage: string | null;
  seoImage: string | null;
  category: string | null;
  featured: boolean;
  publishedAt: string | null;
  createdAt: string;
}

function extractKeyMessages(raw: unknown[]): string[] {
  return raw.map((km) => {
    if (typeof km === "string") return km;
    if (km && typeof km === "object" && "message" in km)
      return (km as { message: string }).message;
    return String(km);
  });
}

function mapMemo(
  m: YFMemo & { key_messages?: unknown[] },
  authorTitles: Map<string, string | null>,
): MemoSerialized {
  const keyMessages = extractKeyMessages(m.key_messages ?? []);
  const authorName = m.author?.name ?? "Build Canada";
  const authorSlug = m.author?.slug ?? "";
  const authorTitle = authorSlug
    ? (authorTitles.get(authorSlug) ?? null)
    : null;
  return {
    id: String(m.id),
    title: m.title,
    slug: m.slug,
    author: {
      name: authorName,
      photo:
        authorName === "Build Canada"
          ? "/assets/logos/buildcanada-logo-square.svg"
          : (m.author?.profile_photo_url ?? null),
      title: authorTitle,
    },
    keyMessage1: keyMessages[0] ?? null,
    keyMessage2: keyMessages[1] ?? null,
    keyMessage3: keyMessages[2] ?? null,
    bannerImage: m.banner_image_url ?? null,
    seoImage: m.seo_image_url ?? null,
    category: m.category,
    featured: m.featured,
    publishedAt: m.published_at ?? null,
    createdAt: m.published_at ?? new Date().toISOString(),
  };
}

export async function fetchMemos(params?: {
  featured?: boolean;
  category?: string;
  publication?: string;
}): Promise<MemoSerialized[]> {
  const queryParams: Record<string, string> = {};
  if (params?.featured) queryParams.featured = "true";
  if (params?.category) queryParams.category = params.category;
  if (params?.publication) queryParams.publication = params.publication;

  type MemoRow = YFMemo & { key_messages?: unknown[] };

  const fetchPage = (page: number) =>
    apiFetch<YFPaginatedResponse<MemoRow>>("/memos", {
      params: { ...queryParams, page: String(page) },
      revalidate: 60,
    });

  // Author titles don't depend on the memo pages, so this goes out alongside
  // them rather than waiting for pagination to finish. Failing to resolve
  // titles isn't fatal — memos still render without them.
  const teamPromise = apiFetch<YFListResponse<YFTeamMember>>("/team", {
    revalidate: 3600,
  }).catch(() => null);

  // Page 1 tells us how many pages there are; the rest are then fetched
  // concurrently instead of one round trip at a time.
  const first = await fetchPage(1);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, first.pagination.pages - 1) }, (_, i) =>
      fetchPage(i + 2),
    ),
  );

  const all: MemoRow[] = [first, ...rest].flatMap((res) => res.data);

  const authorTitles = new Map<string, string | null>();
  const team = await teamPromise;
  if (team) {
    for (const t of team.data) {
      authorTitles.set(t.slug, t.title ?? null);
    }
  }

  return all.map((m) => mapMemo(m, authorTitles));
}

export async function fetchMemo(
  slug: string,
  params?: { publication?: string },
) {
  const queryParams: Record<string, string> = {};
  if (params?.publication) queryParams.publication = params.publication;
  const m = await apiFetch<YFMemoDetail>(`/memos/${slug}`, {
    revalidate: 300,
    params: queryParams,
    // Tag by slug so York Factory can bust just this memo (POST /api/revalidate)
    // when an endorsement is added or a critique is approved.
    tags: [`memo:${slug}`],
  });
  return mapArticleDetail(m);
}
