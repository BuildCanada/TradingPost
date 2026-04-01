import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("active") === "true";

  const items = await prisma.qandAItem.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { order: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json();
  const item = await prisma.qandAItem.create({
    data: {
      question: body.question,
      answer: body.answer,
      order: body.order ?? 0,
      active: body.active ?? true,
    },
  });
  return NextResponse.json(item);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const item = await prisma.qandAItem.update({
    where: { id: body.id },
    data: {
      question: body.question ?? undefined,
      answer: body.answer ?? undefined,
      order: body.order ?? undefined,
      active: body.active ?? undefined,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(request: Request) {
  const body = await request.json();
  await prisma.qandAItem.delete({ where: { id: body.id } });
  return NextResponse.json({ ok: true });
}
