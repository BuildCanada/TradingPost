import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(members);
  } catch (err) {
    console.error("GET /api/team error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const member = await prisma.teamMember.create({
      data: {
        name: body.name,
        title: body.title,
        photo: body.photo || null,
        xUrl: body.xUrl || null,
        linkedinUrl: body.linkedinUrl || null,
        order: body.order ?? 0,
      },
    });
    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    console.error("POST /api/team error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const member = await prisma.teamMember.update({
      where: { id: body.id },
      data: {
        name: body.name,
        title: body.title,
        photo: body.photo || null,
        xUrl: body.xUrl || null,
        linkedinUrl: body.linkedinUrl || null,
        order: body.order ?? 0,
      },
    });
    return NextResponse.json(member);
  } catch (err) {
    console.error("PUT /api/team error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.teamMember.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/team error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
