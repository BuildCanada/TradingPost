import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const memo = await prisma.memo.findUnique({
    where: { slug },
    include: { author: true },
  });
  if (!memo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(memo);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();
  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.authorId !== undefined) data.authorId = body.authorId;
  if (body.keyMessage1 !== undefined) data.keyMessage1 = body.keyMessage1;
  if (body.keyMessage2 !== undefined) data.keyMessage2 = body.keyMessage2;
  if (body.keyMessage3 !== undefined) data.keyMessage3 = body.keyMessage3;
  if (body.body !== undefined) data.body = body.body;
  if (body.supporters !== undefined) data.supporters = body.supporters;
  if (body.splashImage !== undefined) data.splashImage = body.splashImage;
  if (body.seoImage !== undefined) data.seoImage = body.seoImage;
  if (body.category !== undefined) data.category = body.category;
  if (body.publishedAt !== undefined)
    data.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
  if (body.twitterEmbed !== undefined) data.twitterEmbed = body.twitterEmbed;
  if (body.featured !== undefined) data.featured = body.featured;

  const memo = await prisma.memo.update({
    where: { slug },
    data,
    include: { author: true },
  });
  return NextResponse.json(memo);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  await prisma.memo.delete({ where: { slug } });
  return NextResponse.json({ ok: true });
}
