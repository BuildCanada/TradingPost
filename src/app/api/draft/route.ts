import { draftMode, cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { API_URL } from "@/lib/api/client";
import { PREVIEW_TOKEN_COOKIE } from "@/lib/api/preview";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const slug = searchParams.get("slug");

  if (!token || !slug) {
    return new Response("Missing token or slug", { status: 400 });
  }

  if (!slug.startsWith("/") || slug.startsWith("//")) {
    return new Response("Invalid slug", { status: 400 });
  }

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (res.status === 401) {
    return new Response("Invalid or expired token", { status: 401 });
  }
  if (res.status === 403) {
    return new Response("Admin access required", { status: 403 });
  }
  if (!res.ok) {
    return new Response("Unable to validate token", { status: 502 });
  }

  const user = (await res.json()) as { admin?: boolean };
  if (!user.admin) {
    return new Response("Admin access required", { status: 403 });
  }

  const draft = await draftMode();
  draft.enable();

  const cookieStore = await cookies();
  cookieStore.set(PREVIEW_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  redirect(slug);
}
