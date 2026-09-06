import { pollAccessDenied } from "@/lib/poll-access";
import { primeAdminPreviewToken } from "@/lib/preview";
import { NextRequest } from "next/server";
import { markdownBuilders } from "@/lib/markdown/content";
import { markdownResponse } from "@/lib/markdown/document";

// Serves the markdown representation of content pages at /md/{type}/{slug}.
// Not linked directly: src/proxy.ts rewrites the two public shapes here —
// /memos/foo.md and `Accept: text/markdown` on /memos/foo (same for posts
// and builders). Upstream fetches are ISR-cached at the fetch layer
// (revalidate in src/lib/api/*), so this handler is a cheap pure transform.
// Poll markdown is admin-only and primes the preview token after authorization.
// Other content keeps its existing public-only behavior.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;

  if (path.length !== 2) {
    return new Response("Not found", { status: 404 });
  }

  const [type, slug] = path;
  const build = markdownBuilders[type];
  if (!build) {
    return new Response("Not found", { status: 404 });
  }

  if (type === "polls") {
    const denied = await pollAccessDenied(`/polls/${slug}`);
    if (denied) return denied;
    await primeAdminPreviewToken();
  }

  let result;
  try {
    result = await build(decodeURIComponent(slug));
  } catch {
    return new Response("Not found", { status: 404 });
  }

  if (result.kind === "redirect") {
    const response = new Response(null, { status: 308, headers: { Location: new URL(result.location, req.url).toString() } });
    if (type === "polls") response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  const response = markdownResponse(result.doc, { canonicalUrl: result.canonicalUrl });
  if (type === "polls") response.headers.set("Cache-Control", "private, no-store");
  return response;
}
