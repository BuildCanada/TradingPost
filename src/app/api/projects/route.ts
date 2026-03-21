import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const featured = req.nextUrl.searchParams.get("featured");
    const projects = await prisma.project.findMany({
      where: featured === "true" ? { featured: true } : undefined,
      orderBy: { order: "asc" },
    });
    return NextResponse.json(projects);
  } catch (err) {
    console.error("GET /api/projects error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const project = await prisma.project.create({
      data: {
        slug: body.slug,
        title: body.title,
        description: body.description || null,
        externalUrl: body.externalUrl,
        size: body.size || "small",
        featured: body.featured ?? false,
        order: body.order ?? 0,
        accentColor: body.accentColor || null,
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    console.error("POST /api/projects error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const project = await prisma.project.update({
      where: { id: body.id },
      data: {
        slug: body.slug,
        title: body.title,
        description: body.description || null,
        externalUrl: body.externalUrl,
        size: body.size || "small",
        featured: body.featured ?? false,
        order: body.order ?? 0,
        accentColor: body.accentColor || null,
      },
    });
    return NextResponse.json(project);
  } catch (err) {
    console.error("PUT /api/projects error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/projects error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
