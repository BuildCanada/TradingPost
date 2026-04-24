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
  author: { name: string; photo: string | null };
  keyMessage1: string | null;
  keyMessage2: string | null;
  keyMessage3: string | null;
  splashImage: string | null;
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

function mapMemo(m: YFMemo & { key_messages?: unknown[]; splash_image_url?: string | null; seo_image_url?: string | null }): MemoSerialized {
  const keyMessages = extractKeyMessages(m.key_messages ?? []);
  const authorName = m.author?.name ?? "Build Canada";
  return {
    id: String(m.id),
    title: m.title,
    slug: m.slug,
    author: {
      name: authorName,
      photo: authorName === "Build Canada" ? "/assets/logos/buildcanada-logo-square.svg" : (m.author?.profile_photo_url ?? null),
    },
    keyMessage1: keyMessages[0] ?? null,
    keyMessage2: keyMessages[1] ?? null,
    keyMessage3: keyMessages[2] ?? null,
    splashImage: m.splash_image_url ?? null,
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

  type MemoRow = YFMemo & { key_messages?: unknown[]; splash_image_url?: string | null };

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

  return all.map(mapMemo);
}

export async function fetchMemo(slug: string, params?: { publication?: string }) {
  const queryParams: Record<string, string> = {};
  if (params?.publication) queryParams.publication = params.publication;
  const m = await apiFetch<YFMemoDetail>(`/memos/${slug}`, {
    revalidate: 300,
    params: queryParams,
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
    splashImage: m.splash_image_url ?? null,
    seoImage: m.seo_image_url ?? null,
    category: m.category,
    featured: m.featured,
    twitterEmbed: m.twitter_embed,
    publishedAt: m.published_at ?? null,
    createdAt: m.published_at ?? new Date().toISOString(),
    updatedAt: m.published_at ?? new Date().toISOString(),
  };
}
