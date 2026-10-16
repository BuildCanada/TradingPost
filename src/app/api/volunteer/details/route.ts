import { NextRequest, NextResponse } from "next/server";

import {
  AVAILABILITY_OPTIONS,
  EMAIL_COOKIE,
  MAYORAL_OPTIONS,
  SHEET_COLUMNS,
  SHEET_TAB,
} from "@/app/toronto/volunteer/build-the-vote";
import { sheetTimestamp, upsertSheetRow } from "@/lib/google-sheet";

// Build the Vote step 2: optional details, added to the volunteer's row in the
// Sheet shared with CJPAC. The row is found by the email step 1's response put
// in an httpOnly cookie, so the email is never in a URL or the page. These
// answers (including a mayoral preference) go to the Sheet only, not to
// Customer.io.

export async function POST(req: NextRequest) {
  try {
    const email = req.cookies.get(EMAIL_COOKIE)?.value;
    if (!email) {
      return NextResponse.json({ error: "expired" }, { status: 401 });
    }

    const body = await req.json();
    const availability = Array.isArray(body.availability)
      ? AVAILABILITY_OPTIONS.filter((o) => body.availability.includes(o))
      : [];
    const mayoral = MAYORAL_OPTIONS.find((o) => o === body.mayoral) ?? "";
    const issues =
      typeof body.issues === "string" ? body.issues.trim().slice(0, 2000) : "";

    await upsertSheetRow({
      tab: SHEET_TAB,
      columns: SHEET_COLUMNS,
      email,
      values: {
        Availability: availability.join(", "),
        "Mayoral candidate": mayoral,
        Issues: issues,
        "Details added at": sheetTimestamp(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
