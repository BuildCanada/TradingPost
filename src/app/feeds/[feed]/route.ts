import { PUBLICATION_FEEDS } from "@/lib/feeds";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ feed: string }> },
) {
  const { feed } = await params;
  if (!PUBLICATION_FEEDS.some(({ file }) => file === feed)) {
    return new Response("Not found", { status: 404 });
  }

  if (feed === "polls.xml") {
    const { pollAccessDenied } = await import("@/lib/poll-access");
    const denied = await pollAccessDenied("/polls");
    if (denied) return denied;
  }
  const apiUrl = process.env.YORK_FACTORY_API_URL ||
    "https://yorkfactory.buildcanada.com/api/v1";
  try {
    // Feeds are always public: never forward preview tokens or cookies.
    const upstream = await fetch(`${apiUrl}/feeds/${feed}${feed === "all.xml" ? "?exclude=polls" : ""}`, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
      headers: { Accept: "application/rss+xml" },
    });
    if (!upstream.ok) {
      return new Response("Feed unavailable", {
        status: upstream.status === 404 ? 404 : 502,
        headers: { "Cache-Control": "no-store" },
      });
    }
    const contentType = upstream.headers.get("content-type") || "";
    if (!contentType.startsWith("application/rss+xml")) {
      return new Response("Feed unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });
    }
    return new Response(upstream.body, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": feed === "polls.xml" ? "private, no-store" : "public, max-age=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Feed unavailable", {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
