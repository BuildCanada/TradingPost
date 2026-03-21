import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(",")),
  ];
  return lines.join("\n");
}

export async function POST() {
  try {
    const [feedItems, memos, teamMembers, testimonials, projects] = await Promise.all([
      prisma.feedItem.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.memo.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.teamMember.findMany({ orderBy: { order: "asc" } }),
      prisma.testimonial.findMany({ orderBy: { order: "asc" } }),
      prisma.project.findMany({ orderBy: { order: "asc" } }),
    ]);

    const backupsDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    const files: { model: string; file: string; rows: number }[] = [];

    const datasets: { name: string; data: Record<string, unknown>[] }[] = [
      { name: "feed_items", data: feedItems as unknown as Record<string, unknown>[] },
      { name: "memos", data: memos as unknown as Record<string, unknown>[] },
      { name: "team_members", data: teamMembers as unknown as Record<string, unknown>[] },
      { name: "testimonials", data: testimonials as unknown as Record<string, unknown>[] },
      { name: "projects", data: projects as unknown as Record<string, unknown>[] },
    ];

    for (const { name, data } of datasets) {
      const filename = `${name}_${timestamp}.csv`;
      const filepath = path.join(backupsDir, filename);
      fs.writeFileSync(filepath, toCsv(data), "utf-8");

      // Also write a "latest" copy for easy push-to-sheets
      const latestPath = path.join(backupsDir, `${name}_latest.csv`);
      fs.writeFileSync(latestPath, toCsv(data), "utf-8");

      files.push({ model: name, file: filename, rows: data.length });
    }

    return NextResponse.json({
      success: true,
      timestamp,
      files,
      total: feedItems.length + memos.length + teamMembers.length + testimonials.length + projects.length,
    });
  } catch (error) {
    console.error("Backup export error:", error);
    return NextResponse.json(
      { error: "Export failed", details: String(error) },
      { status: 500 }
    );
  }
}
