import { NextRequest, NextResponse } from "next/server";
import { getAccessTokenCookie } from "@/lib/auth";
import { API_URL } from "@/lib/api/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Sets the signed-in user's postal code (required before they can endorse or
// critique). Forwards to York Factory's PATCH /me with the httpOnly Bearer token.
export async function POST(req: NextRequest) {
  const token = await getAccessTokenCookie();
  if (!token) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  let payload: { postal_code?: string };
  try {
    payload = (await req.json()) as { postal_code?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const res = await fetch(`${API_URL}/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ user: { postal_code: payload.postal_code ?? "" } }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}
