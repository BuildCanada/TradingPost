import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(testimonials);
  } catch (err) {
    console.error("GET /api/testimonials error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const testimonial = await prisma.testimonial.create({
      data: {
        name: body.name,
        quote: body.quote,
        profilePhoto: body.profilePhoto || null,
        splashPhoto: body.splashPhoto || null,
        order: body.order ?? 0,
      },
    });
    return NextResponse.json(testimonial, { status: 201 });
  } catch (err) {
    console.error("POST /api/testimonials error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const testimonial = await prisma.testimonial.update({
      where: { id: body.id },
      data: {
        name: body.name,
        quote: body.quote,
        profilePhoto: body.profilePhoto || null,
        splashPhoto: body.splashPhoto || null,
        order: body.order ?? 0,
      },
    });
    return NextResponse.json(testimonial);
  } catch (err) {
    console.error("PUT /api/testimonials error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.testimonial.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/testimonials error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
