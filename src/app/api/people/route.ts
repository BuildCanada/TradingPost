import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const people = await prisma.person.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(people);
}

export async function POST(request: Request) {
  const body = await request.json();
  const person = await prisma.person.create({
    data: {
      name: body.name,
      title: body.title ?? null,
      role: body.role ?? "CORE",
      photo: body.photo ?? null,
      xUrl: body.xUrl ?? null,
      linkedinUrl: body.linkedinUrl ?? null,
      websiteUrl: body.websiteUrl ?? null,
      bio: body.bio ?? null,
      order: body.order ?? 0,
    },
  });
  return NextResponse.json(person);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const person = await prisma.person.update({
    where: { id: body.id },
    data: {
      name: body.name,
      title: body.title ?? null,
      role: body.role ?? undefined,
      photo: body.photo ?? null,
      xUrl: body.xUrl ?? null,
      linkedinUrl: body.linkedinUrl ?? null,
      websiteUrl: body.websiteUrl ?? null,
      bio: body.bio ?? null,
      order: body.order ?? undefined,
    },
  });
  return NextResponse.json(person);
}

export async function DELETE(request: Request) {
  const body = await request.json();
  await prisma.person.delete({ where: { id: body.id } });
  return NextResponse.json({ ok: true });
}
