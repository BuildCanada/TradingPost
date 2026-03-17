import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const memo = await prisma.memo.findUnique({ where: { slug } });
  if (!memo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(memo);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const data = await req.json();

  const update: Record<string, unknown> = {};
  if (data.title !== undefined) update.title = data.title;
  if (data.slug !== undefined) update.slug = data.slug;
  if (data.author !== undefined) update.author = data.author;
  if (data.authorImage !== undefined) update.authorImage = data.authorImage;
  if (data.keyMessage1 !== undefined) update.keyMessage1 = data.keyMessage1;
  if (data.keyMessage2 !== undefined) update.keyMessage2 = data.keyMessage2;
  if (data.keyMessage3 !== undefined) update.keyMessage3 = data.keyMessage3;
  if (data.body !== undefined) update.body = data.body;
  if (data.supporters !== undefined) update.supporters = data.supporters;
  if (data.splashImage !== undefined) update.splashImage = data.splashImage;
  if (data.seoImage !== undefined) update.seoImage = data.seoImage;
  if (data.category !== undefined) update.category = data.category;
  if (data.publishedAt !== undefined) update.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
  if (data.twitterEmbed !== undefined) update.twitterEmbed = data.twitterEmbed;
  if (data.featured !== undefined) update.featured = data.featured;

  const memo = await prisma.memo.update({ where: { slug }, data: update });
  return NextResponse.json(memo);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  await prisma.memo.delete({ where: { slug } });
  return NextResponse.json({ ok: true });
}
