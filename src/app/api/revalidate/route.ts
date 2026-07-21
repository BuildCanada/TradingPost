import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Called by York Factory when a memo's public engagement changes (endorsement
// added, critique approved). Bearer-protected so only York Factory can bust the
// cache. Must share REVALIDATE_SECRET with York Factory's NEXTJS_REVALIDATE_SECRET.
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "revalidation_disabled" }, { status: 503 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { tag?: string; tags?: string[] };
  try {
    body = (await req.json()) as { tag?: string; tags?: string[] };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const tags = body.tags ?? (body.tag ? [body.tag] : []);
  if (tags.length === 0) {
    return NextResponse.json({ error: "no_tags" }, { status: 400 });
  }

  // Next 16: the old single-arg revalidateTag(tag) is deprecated; "max" is the
  // documented replacement that invalidates entries carrying the tag.
  for (const tag of tags) revalidateTag(tag, "max");
  return NextResponse.json({ ok: true, revalidated: tags });
}
