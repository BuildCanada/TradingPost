import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let config = await prisma.siteConfig.findUnique({ where: { id: "site" } });
  if (!config) {
    config = await prisma.siteConfig.create({ data: { id: "site" } });
  }
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const config = await prisma.siteConfig.upsert({
    where: { id: "site" },
    update: {
      orgName: body.orgName,
      orgDescription: body.orgDescription ?? null,
      logoUrl: body.logoUrl ?? null,
      siteUrl: body.siteUrl,
      socialLinks: body.socialLinks ?? null,
    },
    create: {
      id: "site",
      orgName: body.orgName ?? "Build Canada",
      orgDescription: body.orgDescription ?? null,
      logoUrl: body.logoUrl ?? null,
      siteUrl: body.siteUrl ?? "https://buildcanada.ca",
      socialLinks: body.socialLinks ?? null,
    },
  });
  return NextResponse.json(config);
}
