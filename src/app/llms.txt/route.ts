import { fetchMemos } from "@/lib/api/memos";
import { fetchPosts } from "@/lib/api/posts";
import { fetchBuilders } from "@/lib/api/builders";
import { getSiteConfig } from "@/lib/api/config";

// Curated index for LLM agents (https://llmstxt.org). Links point at the .md
// representations served via src/app/md/[...path]/route.ts. Upstream outages
// degrade to the static sections instead of failing the whole file.
export const revalidate = 3600;

interface Entry {
  title: string;
  url: string;
  note?: string | null;
}

function section(heading: string, entries: Entry[]): string | null {
  if (!entries.length) return null;
  const lines = entries.map(
    (e) => `- [${e.title}](${e.url})${e.note ? `: ${e.note}` : ""}`,
  );
  return `## ${heading}\n\n${lines.join("\n")}`;
}

export async function GET() {
  const { siteUrl, orgDescription } = getSiteConfig();

  const [memos, posts, builders] = await Promise.all([
    fetchMemos().catch(() => []),
    fetchPosts().catch(() => []),
    fetchBuilders().catch(() => []),
  ]);

  const parts = [
    "# Build Canada",
    `> ${orgDescription}`,
    [
      `Build Canada publishes policy memos, posts, and profiles of great Canadian builders at ${siteUrl}.`,
      "Every memo, post, and builder profile is available as clean markdown: append `.md` to its URL,",
      "or request the HTML URL with an `Accept: text/markdown` header.",
      `The homepage (${siteUrl}) and ${siteUrl}/about describe the organization and team.`,
    ].join(" "),
    section(
      "Memos",
      memos.map((m) => ({
        title: m.title,
        url: `${siteUrl}/memos/${m.slug}.md`,
        note: m.keyMessage1,
      })),
    ),
    section(
      "Posts",
      posts.map((p) => ({
        title: p.title,
        url: `${siteUrl}/posts/${p.slug}.md`,
        note: p.keyMessage1,
      })),
    ),
    section(
      "Builders",
      builders.map((b) => ({
        title: b.tagline ? `${b.name}: ${b.tagline}` : b.name,
        url: `${siteUrl}/builders/${b.slug}.md`,
        note: b.quote,
      })),
    ),
    section("Other (HTML only)", [
      { title: "Government commitment tracker", url: `${siteUrl}/tracker`, note: "Tracks federal government commitments and their status" },
      { title: "Bills explorer", url: `${siteUrl}/bills`, note: "Plain-language summaries of Canadian legislation" },
      { title: "Projects", url: `${siteUrl}/projects`, note: "Tools and projects built by the Build Canada community" },
    ]),
  ];

  return new Response(parts.filter(Boolean).join("\n\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
