import { NextRequest } from "next/server";
import { markdownBuilders } from "@/lib/markdown/content";
import { markdownResponse } from "@/lib/markdown/document";

// Serves the markdown representation of content pages at /md/{type}/{slug}.
// Not linked directly: src/proxy.ts rewrites the two public shapes here —
// /memos/foo.md and `Accept: text/markdown` on /memos/foo (same for posts
// and builders). Upstream fetches are ISR-cached at the fetch layer
// (revalidate in src/lib/api/*), so this handler is a cheap pure transform.
// Draft content can't leak: apiFetch only sends a bearer token when one is
// explicitly set in the request scope, which never happens here.
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

  let result;
  try {
    result = await build(decodeURIComponent(slug));
  } catch {
    return new Response("Not found", { status: 404 });
  }

  if (result.kind === "redirect") {
    return Response.redirect(new URL(result.location, req.url), 308);
  }

  return markdownResponse(result.doc, { canonicalUrl: result.canonicalUrl });
}
