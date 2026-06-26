import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// Surfaces the signed-in user's identity to the browser for PostHog identify.
// The access token stays httpOnly on the server; only non-sensitive identity
// fields cross to the client. Returns { user: null } when not signed in.
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(
    { user },
    { headers: { "Cache-Control": "no-store" } },
  );
}
