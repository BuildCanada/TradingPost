import { apiFetch } from "./client";
import { mapPollDownloads } from "../polls/downloads";
import type { YFMemoDetail, YFPollDetail, YFTeamMember, YFListResponse } from "./types";

export async function mapArticleDetail(m: YFMemoDetail | YFPollDetail) {
  const keyMessages = (m.key_messages ?? []).map((value) => {
    if (typeof value === "string") return value;
    return String((value as { message: string }).message);
  });
  const authorName = m.author_name || m.author?.name || "Build Canada";
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
      photo:
        authorName === "Build Canada"
          ? "/assets/logos/buildcanada-logo-square.svg"
          : (m.author?.profile_photo_url ?? null),
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
    bodyMarkdown: m.body_markdown,
    appendixMarkdown: m.appendix_markdown,
    supportersMarkdown: "supporters_markdown" in m ? m.supporters_markdown : null,
    poll: "poll" in m && m.poll
      ? {
          ...m.poll,
          downloads: mapPollDownloads(m.slug, m.poll.downloads),
        }
      : undefined,
    appendix: m.appendix,
    supporters: "supporters" in m ? m.supporters : null,
    bannerImage: m.banner_image_url ?? null,
    seoImage: m.seo_image_url ?? null,
    category: "category" in m ? m.category : null,
    featured: m.featured,
    twitterEmbed: m.twitter_embed,
    publishedAt: m.published_at ?? null,
    createdAt: m.published_at ?? new Date().toISOString(),
    updatedAt: m.published_at ?? new Date().toISOString(),
    endorsementsCount: "endorsements_count" in m ? m.endorsements_count ?? 0 : 0,
    critiquesCount: "critiques_count" in m ? m.critiques_count ?? 0 : 0,
    recentEndorsers: "recent_endorsers" in m ? m.recent_endorsers ?? [] : [],
    critiques: "critiques" in m ? m.critiques ?? [] : [],
  };
}
