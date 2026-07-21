import { NextRequest, NextResponse } from "next/server";
import { getAccessTokenCookie } from "@/lib/auth";
import { API_URL } from "@/lib/api/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Server-side proxy for memo engagement writes. The OAuth access token lives in
// an httpOnly cookie the browser can't read, so the client posts here and we
// forward to York Factory with a Bearer token. Keeps the token off the client
// and avoids any CORS/preflight against York Factory.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const token = await getAccessTokenCookie();
  if (!token) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  let payload: { kind?: string; body?: string };
  try {
    payload = (await req.json()) as { kind?: string; body?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const resource =
    payload.kind === "endorsement"
      ? "endorsements"
      : payload.kind === "critique"
        ? "critiques"
        : null;
  if (!resource) {
    return NextResponse.json({ error: "invalid_kind" }, { status: 400 });
  }

  const forwardBody =
    resource === "critiques" ? { body: payload.body ?? "" } : {};

  const res = await fetch(
    `${API_URL}/memos/${encodeURIComponent(slug)}/${resource}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(forwardBody),
      cache: "no-store",
    },
  );

  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}
