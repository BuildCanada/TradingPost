import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const type = searchParams.get("type");

    const where = type && type !== "All" ? { type } : {};

    const items = await prisma.feedItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error("GET /api/feed error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const item = await prisma.feedItem.create({
    data: {
      type: body.type,
      title: body.title || null,
      subtitle: body.subtitle || null,
      author: body.author || null,
      authorPhoto: body.authorPhoto || null,
      image: body.image || null,
      body: body.body || null,
      url: body.url || null,
      embedCode: body.embedCode || null,
      sourceUrl: body.sourceUrl || null,
      tags: body.tags || null,
      featured: body.featured ?? false,
      ...(body.createdAt && { createdAt: new Date(body.createdAt) }),
    },
  });

  return NextResponse.json(item, { status: 201 });
}
