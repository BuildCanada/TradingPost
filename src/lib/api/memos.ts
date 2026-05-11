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
    if (km && typeof km === "object" && "message" in km) return (km as { message: string }).message;
    return String(km);
  });
}

function mapMemo(m: YFMemo & { key_messages?: unknown[] }, authorTitles: Map<string, string | null>): MemoSerialized {
  const keyMessages = extractKeyMessages(m.key_messages ?? []);
  const authorName = m.author?.name ?? "Build Canada";
  const authorSlug = m.author?.slug ?? "";
  const authorTitle = authorSlug ? (authorTitles.get(authorSlug) ?? null) : null;
  return {
    id: String(m.id),
    title: m.title,
    slug: m.slug,
    author: {
      name: authorName,
      photo: authorName === "Build Canada" ? "/assets/logos/buildcanada-logo-square.svg" : (m.author?.profile_photo_url ?? null),
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

  const all: MemoRow[] = [];
  let page = 1;

  while (true) {
    queryParams.page = String(page);
    const res = await apiFetch<YFPaginatedResponse<MemoRow>>(
      "/memos",
      { params: queryParams, revalidate: 60 }
    );
    all.push(...res.data);
    if (page >= res.pagination.pages) break;
    page++;
  }

  const authorTitles = new Map<string, string | null>();
  try {
    const team = await apiFetch<YFListResponse<YFTeamMember>>("/team", {
      revalidate: 3600,
    });
    for (const t of team.data) {
      authorTitles.set(t.slug, t.title ?? null);
    }
  } catch {}

  return all.map((m) => mapMemo(m, authorTitles));
}

export async function fetchMemo(slug: string, params?: { publication?: string }) {
  const queryParams: Record<string, string> = {};
  if (params?.publication) queryParams.publication = params.publication;
  const m = await apiFetch<YFMemoDetail>(`/memos/${slug}`, {
    revalidate: 300,
    params: queryParams,
    tags: [`memo:${slug}`],
  });
  const keyMessages = extractKeyMessages((m.key_messages ?? []) as unknown[]);
  const authorName = m.author?.name ?? "Build Canada";
  const authorSlug = m.author?.slug ?? "";

  // The memo endpoint doesn't expose author title or socials — look them up via
  // the team endpoint by slug when available.
  let teamProfile: YFTeamMember | undefined;
  if (authorSlug) {
    try {
      const team = await apiFetch<YFListResponse<YFTeamMember>>("/team", {
        revalidate: 3600,
      });
      teamProfile = team.data.find((t) => t.slug === authorSlug);
    } catch {
      teamProfile = undefined;
    }
  }

  return {
    id: String(m.id),
    title: m.title,
    slug: m.slug,
    author: {
      name: authorName,
      slug: authorSlug,
      photo: authorName === "Build Canada" ? "/assets/logos/buildcanada-logo-square.svg" : (m.author?.profile_photo_url ?? null),
      title: m.author_title ?? teamProfile?.title ?? null,
      bio: null as string | null,
      websiteUrl: null as string | null,
      xUrl: teamProfile?.twitter_url ?? null,
      linkedinUrl: teamProfile?.linkedin_url ?? null,
    },
    keyMessage1: keyMessages[0] ?? null,
    keyMessage2: keyMessages[1] ?? null,
    keyMessage3: keyMessages[2] ?? null,
    keyMessages,
    body: m.body,
    appendix: m.appendix,
    supporters: m.supporters,
    bannerImage: m.banner_image_url ?? null,
    seoImage: m.seo_image_url ?? null,
    category: m.category,
    featured: m.featured,
    twitterEmbed: m.twitter_embed,
    publishedAt: m.published_at ?? null,
    createdAt: m.published_at ?? new Date().toISOString(),
    updatedAt: m.published_at ?? new Date().toISOString(),
    endorsementsCount: m.endorsements_count ?? 0,
    critiquesCount: m.critiques_count ?? 0,
    recentEndorsers: m.recent_endorsers ?? [],
    critiques: m.critiques ?? [],
  };
}

export interface MemoEngagement {
  endorsementsCount: number;
  critiquesCount: number;
  recentEndorsers: { name: string; created_at: string }[];
  critiques: { id: number; name: string; body: string; created_at: string }[];
}

export async function fetchMemoEngagement(slug: string): Promise<MemoEngagement> {
  const m = await apiFetch<YFMemoDetail>(`/memos/${slug}`, { revalidate: 0 });
  return {
    endorsementsCount: m.endorsements_count ?? 0,
    critiquesCount: m.critiques_count ?? 0,
    recentEndorsers: m.recent_endorsers ?? [],
    critiques: m.critiques ?? [],
  };
}
