import { NextRequest, NextResponse } from "next/server";

interface EmbedResult {
  title: string | null;
  body: string | null;
  image: string | null;
  author: string | null;
  authorPhoto: string | null;
}

/** Strip HTML tags and decode common entities */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

async function fetchX(url: string): Promise<EmbedResult> {
  const res = await fetch(
    `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`
  );
  if (!res.ok) throw new Error(`X oEmbed failed: ${res.status}`);
  const data = await res.json();

  // Extract tweet text from the blockquote in the HTML
  const blockquoteMatch = data.html?.match(
    /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/
  );
  let tweetText = "";
  if (blockquoteMatch) {
    // Remove the trailing "— author (@handle) date" line
    const inner = blockquoteMatch[1]
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/&mdash;[\s\S]*$/, "");
    tweetText = stripHtml(inner).trim();
  }

  return {
    title: data.author_name ? `@${data.author_name}` : null,
    body: tweetText || null,
    image: null, // X oEmbed doesn't provide images
    author: data.author_name || null,
    authorPhoto: null,
  };
}

async function fetchTikTok(url: string): Promise<EmbedResult> {
  const res = await fetch(
    `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
  );
  if (!res.ok) throw new Error(`TikTok oEmbed failed: ${res.status}`);
  const data = await res.json();

  return {
    title: data.author_name ? `@${data.author_name}` : null,
    body: data.title || null,
    image: data.thumbnail_url || null,
    author: data.author_name || null,
    authorPhoto: null,
  };
}

async function fetchIG(url: string): Promise<EmbedResult> {
  // Try the public Instagram oEmbed endpoint (no token required for basic data)
  const res = await fetch(
    `https://graph.facebook.com/v22.0/instagram_oembed?url=${encodeURIComponent(url)}&omitscript=true&maxwidth=500`,
    {
      headers: {
        // If an IG access token is configured, use it; otherwise try without
        ...(process.env.INSTAGRAM_ACCESS_TOKEN
          ? { Authorization: `Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN}` }
          : {}),
      },
    }
  );

  if (!res.ok) {
    // Fallback: try the legacy endpoint
    const legacyRes = await fetch(
      `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}&omitscript=true&maxwidth=500`
    );
    if (!legacyRes.ok)
      throw new Error(`Instagram oEmbed failed: ${res.status}`);
    const data = await legacyRes.json();
    return parseIGData(data);
  }

  const data = await res.json();
  return parseIGData(data);
}

function parseIGData(data: Record<string, unknown>): EmbedResult {
  // Extract caption from the HTML embed if available
  let caption = "";
  if (data.html) {
    const captionMatch = (data.html as string).match(
      /<p[^>]*>([\s\S]*?)<\/p>/
    );
    if (captionMatch) {
      caption = stripHtml(captionMatch[1]).trim();
    }
  }

  return {
    title: data.author_name ? `@${data.author_name as string}` : null,
    body: caption || (data.title as string) || null,
    image: (data.thumbnail_url as string) || null,
    author: (data.author_name as string) || null,
    authorPhoto: null,
  };
}

const FETCHERS: Record<string, (url: string) => Promise<EmbedResult>> = {
  X: fetchX,
  TIKTOK: fetchTikTok,
  IG: fetchIG,
};

export async function POST(req: NextRequest) {
  try {
    const { url, type } = await req.json();

    if (!url || !type) {
      return NextResponse.json(
        { error: "url and type are required" },
        { status: 400 }
      );
    }

    const fetcher = FETCHERS[type];
    if (!fetcher) {
      return NextResponse.json(
        { error: `Unsupported type: ${type}` },
        { status: 400 }
      );
    }

    const result = await fetcher(url);
    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/embed error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
