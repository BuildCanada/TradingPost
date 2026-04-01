import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");

    const where = featured === "true" ? { featured: true } : {};

    const memos = await prisma.memo.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { author: true },
    });
    return NextResponse.json(memos);
  } catch (err) {
    console.error("GET /api/memos error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const data = await request.json();
  const memo = await prisma.memo.create({
    data: {
      title: data.title,
      slug: data.slug,
      authorId: data.authorId,
      keyMessage1: data.keyMessage1,
      keyMessage2: data.keyMessage2 ?? null,
      keyMessage3: data.keyMessage3 ?? null,
      body: data.body,
      supporters: data.supporters ?? null,
      splashImage: data.splashImage ?? null,
      seoImage: data.seoImage ?? null,
      category: data.category ?? null,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      twitterEmbed: data.twitterEmbed ?? null,
      featured: data.featured ?? false,
    },
    include: { author: true },
  });
  return NextResponse.json(memo, { status: 201 });
}
