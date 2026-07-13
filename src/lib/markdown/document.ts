// Assembles the markdown documents served to LLM agents, mirroring the
// conventions of Cloudflare's "Markdown for Agents": YAML frontmatter,
// clean body, optional JSON-LD in a fenced block, and an x-markdown-tokens
// estimate header.
// https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/

export interface MarkdownFrontmatter {
  title: string;
  description?: string | null;
  image?: string | null;
  author?: string | null;
  published?: string | null;
  canonical: string;
}

export interface MarkdownDocument {
  body: string;
  tokens: number;
}

// JSON.stringify produces valid YAML scalars, so titles containing ":" or
// quotes can't break the frontmatter.
function frontmatterBlock(fm: MarkdownFrontmatter): string {
  const lines = ["---"];
  const push = (key: string, value: string | null | undefined) => {
    if (value) lines.push(`${key}: ${JSON.stringify(value)}`);
  };
  push("title", fm.title);
  push("description", fm.description);
  push("image", fm.image);
  push("author", fm.author);
  push("published", fm.published);
  push("canonical", fm.canonical);
  lines.push("---");
  return lines.join("\n");
}

export function buildMarkdownDocument({
  frontmatter,
  sections,
  jsonLd,
}: {
  frontmatter: MarkdownFrontmatter;
  sections: Array<string | null | undefined>;
  jsonLd?: object;
}): MarkdownDocument {
  const parts = [frontmatterBlock(frontmatter), ...sections.filter((s): s is string => Boolean(s?.trim()))];
  if (jsonLd) {
    parts.push("---\n\n```json\n" + JSON.stringify(jsonLd, null, 2) + "\n```");
  }
  const body = parts.join("\n\n") + "\n";
  return { body, tokens: Math.ceil(body.length / 4) };
}

export function markdownResponse(
  doc: MarkdownDocument,
  { canonicalUrl }: { canonicalUrl: string },
): Response {
  return new Response(doc.body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "x-markdown-tokens": String(doc.tokens),
      Vary: "Accept",
      Link: `<${canonicalUrl}>; rel="canonical"`,
      // The HTML page is the canonical document for search indexes.
      "X-Robots-Tag": "noindex",
    },
  });
}
