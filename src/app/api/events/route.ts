import { NextRequest, NextResponse } from "next/server";
import { fetchUpcomingEvents } from "@/lib/luma/fetch";

export async function GET(req: NextRequest) {
  try {
    const limitParam = req.nextUrl.searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 3, 10) : 3;

    const events = await fetchUpcomingEvents(limit);
    return NextResponse.json({ events });
  } catch (err) {
    console.error("[api/events] Error fetching events:", err);
    return NextResponse.json({ events: [] });
  }
}
