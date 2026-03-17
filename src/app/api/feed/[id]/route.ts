import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await prisma.feedItem.findUnique({ where: { id } });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const item = await prisma.feedItem.update({
    where: { id },
    data: {
      ...(body.type !== undefined && { type: body.type }),
      ...(body.title !== undefined && { title: body.title || null }),
      ...(body.subtitle !== undefined && { subtitle: body.subtitle || null }),
      ...(body.author !== undefined && { author: body.author || null }),
      ...(body.authorPhoto !== undefined && {
        authorPhoto: body.authorPhoto || null,
      }),
      ...(body.image !== undefined && { image: body.image || null }),
      ...(body.body !== undefined && { body: body.body || null }),
      ...(body.url !== undefined && { url: body.url || null }),
      ...(body.tags !== undefined && { tags: body.tags || null }),
      ...(body.createdAt !== undefined && body.createdAt && { createdAt: new Date(body.createdAt) }),
      ...(body.featured !== undefined && { featured: body.featured }),
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.feedItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
