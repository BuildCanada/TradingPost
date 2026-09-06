import { pollAccessDenied } from "@/lib/poll-access";
import { API_URL } from "@/lib/api/client";
import { primeAdminPreviewToken } from "@/lib/preview";

import { POLL_DOWNLOAD_ASSETS } from "@/lib/polls/downloads";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; asset: string }> },
) {
  const { slug, asset } = await params;
  if (!POLL_DOWNLOAD_ASSETS.has(asset)) return new Response("Not found", { status: 404 });
  const denied = await pollAccessDenied(`/polls/${slug}`);
  if (denied) return denied;
  const token = await primeAdminPreviewToken();
  const url = new URL(
    `${API_URL}/polls/${encodeURIComponent(slug)}/downloads/${asset}`,
  );
  const query = new URL(request.url).searchParams;
  for (const key of ["publication", "locale"]) {
    const value = query.get(key);
    if (value) url.searchParams.set(key, value);
  }
  const upstream = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
    redirect: "error",
  });
  if (!upstream.ok)
    return new Response("Download unavailable", { status: upstream.status });
  return new Response(upstream.body, {
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition":
        upstream.headers.get("content-disposition") ?? "attachment",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
