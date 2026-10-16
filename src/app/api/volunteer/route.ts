import { NextRequest, NextResponse } from "next/server";

import { identifyToCustomerio } from "@/lib/customerio";
import { normalizePostalCode } from "@/lib/elections/postal-code";

// Build the Vote sign-ups, identified to Customer.io. The sign-up itself goes
// to CJPAC's Formstack; this copies who signed up into our own Customer.io so
// we can follow up. Deliberately not York Factory: these aren't newsletter
// subscribers created by our own form.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, first_name, last_name, city, postal_code } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    const str = (v: unknown, max: number) =>
      typeof v === "string" ? v.trim().slice(0, max) : undefined;
    const firstName = str(first_name, 100);
    const lastName = str(last_name, 100);

    await identifyToCustomerio(email.trim().toLowerCase(), {
      first_name: firstName,
      last_name: lastName,
      name: [firstName, lastName].filter(Boolean).join(" "),
      city: str(city, 100),
      postal_code: normalizePostalCode(postal_code),
      build_the_vote_volunteer: true,
      // A Unix timestamp, so date-based segments can use it.
      build_the_vote_signed_up_at: Math.floor(Date.now() / 1000),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
