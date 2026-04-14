export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
      String.fromCharCode(parseInt(code, 16)),
    )
    .replace(/&mdash;/g, "\u2014")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&ldquo;/g, "\u201C");
}

function slugify(text: string): string {
  return decodeHtmlEntities(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function extractHeadings(html: string): {
  headings: Heading[];
  html: string;
} {
  const headings: Heading[] = [];
  const usedIds = new Set<string>();

  function uniqueSlug(text: string): string {
    const base = slugify(text) || "section";
    let slug = base;
    let counter = 1;
    while (usedIds.has(slug)) {
      slug = `${base}-${counter}`;
      counter++;
    }
    usedIds.add(slug);
    return slug;
  }

  const modified = html.replace(
    /<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi,
    (match, levelStr: string, attrs: string | undefined, content: string) => {
      attrs = attrs || "";
      const level = parseInt(levelStr) as 2 | 3;
      const text = decodeHtmlEntities(content.replace(/<[^>]+>/g, "")).trim();

      if (!text || /^[\u200b\u200c\u200d\u2060\ufeff]*$/.test(text)) return match;

      const idMatch = attrs.match(/\bid=["']([^"']+)["']/i);
      let id: string;

      if (idMatch) {
        id = idMatch[1];
        usedIds.add(id);
      } else {
        id = uniqueSlug(text);
        attrs += ` id="${id}"`;
      }

      headings.push({ id, text, level });
      return `<h${level}${attrs}>${content}</h${level}>`;
    },
  );

  return { headings, html: modified };
}
