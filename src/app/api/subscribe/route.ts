import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/lib/api/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, first_name, last_name, postal_code } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    const res = await fetch(`${API_URL}/subscribers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        first_name: first_name || undefined,
        last_name: last_name || undefined,
        postal_code: postal_code || undefined,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.errors?.[0] || "Subscription failed" },
        { status: res.status },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
