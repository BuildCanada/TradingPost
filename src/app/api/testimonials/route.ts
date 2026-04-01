import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { order: "asc" },
    include: { person: true },
  });
  return NextResponse.json(testimonials);
}

export async function POST(request: Request) {
  const body = await request.json();
  const testimonial = await prisma.testimonial.create({
    data: {
      name: body.name,
      quote: body.quote,
      title: body.title ?? null,
      companyLogo: body.companyLogo ?? null,
      profilePhoto: body.profilePhoto ?? null,
      splashPhoto: body.splashPhoto ?? null,
      personId: body.personId ?? null,
      order: body.order ?? 0,
    },
  });
  return NextResponse.json(testimonial);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const testimonial = await prisma.testimonial.update({
    where: { id: body.id },
    data: {
      name: body.name ?? undefined,
      quote: body.quote ?? undefined,
      title: body.title ?? null,
      companyLogo: body.companyLogo ?? null,
      profilePhoto: body.profilePhoto ?? null,
      splashPhoto: body.splashPhoto ?? null,
      personId: body.personId ?? null,
      order: body.order ?? undefined,
    },
  });
  return NextResponse.json(testimonial);
}

export async function DELETE(request: Request) {
  const body = await request.json();
  await prisma.testimonial.delete({ where: { id: body.id } });
  return NextResponse.json({ ok: true });
}
