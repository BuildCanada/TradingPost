import { NextRequest, NextResponse } from "next/server";

import {
  DETAILS_API_PATH,
  EMAIL_COOKIE,
  SHEET_COLUMNS,
  SHEET_TAB,
} from "@/app/toronto/volunteer/build-the-vote";
import { identifyToCustomerio } from "@/lib/customerio";
import { normalizePostalCode } from "@/lib/elections/postal-code";
import { sheetTimestamp, upsertSheetRow } from "@/lib/google-sheet";

// Build the Vote step 1. Writes the sign-up to the Google Sheet shared with
// CJPAC, which is how CJPAC receives it, then identifies the volunteer to
// Customer.io for our own follow-up. Deliberately not York Factory: these
// aren't newsletter subscribers created by our newsletter form.
//
// The Sheet write must succeed, or the volunteer is told to try again: a
// sign-up CJPAC never sees is lost. Customer.io is best-effort.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // A field people never see; bots that fill in every input do. Answer as
    // if it worked so they don't learn to skip it.
    if (body.website) return NextResponse.json({ success: true });

    const str = (v: unknown, max: number) =>
      typeof v === "string" ? v.trim().slice(0, max) : "";

    const email = str(body.email, 254).toLowerCase();
    const firstName = str(body.first_name, 50);
    const lastName = str(body.last_name, 50);
    const phone = normalizePhone(body.phone);
    const city = str(body.city, 100);
    const postalCode = normalizePostalCode(body.postal_code);

    const checks: [boolean, string][] = [
      [Boolean(firstName && lastName), "Please enter your first and last name"],
      [EMAIL_PATTERN.test(email), "Please enter a valid email address"],
      [Boolean(phone), "Please enter a 10-digit phone number"],
      [Boolean(city), "Please enter your city"],
      [Boolean(postalCode), "Please enter a valid postal code (e.g. M5V 1A1)"],
    ];
    const failed = checks.find(([ok]) => !ok);
    if (failed) {
      return NextResponse.json({ error: failed[1] }, { status: 400 });
    }

    await upsertSheetRow({
      tab: SHEET_TAB,
      columns: SHEET_COLUMNS,
      email,
      values: {
        "Submitted At": sheetTimestamp(),
        "First Name": firstName,
        "Last Name": lastName,
        Phone: phone,
        "Postal Code": postalCode,
        // Submitting the form is consent; the form says so above the button.
        "Consent to share with CJPAC": "Yes",
      },
    });

    try {
      await identifyToCustomerio(email, {
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`,
        phone,
        city,
        postal_code: postalCode,
        toronto_2026_build_the_vote_volunteer: true,
        toronto_2026_build_the_vote_consent_to_share_with_cjpac: true,
        toronto_2026_build_the_vote_utm_source: str(body.utm_source, 100),
        toronto_2026_build_the_vote_utm_medium: str(body.utm_medium, 100),
        toronto_2026_build_the_vote_utm_campaign: str(body.utm_campaign, 100),
        // A Unix timestamp, so date-based segments can use it.
        toronto_2026_build_the_vote_signed_up_at: Math.floor(Date.now() / 1000),
      });
    } catch (err) {
      console.error(err);
    }

    // Lets step 2 add to this row without the email in a URL or the page.
    const response = NextResponse.json({ success: true });
    response.cookies.set(EMAIL_COOKIE, email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: DETAILS_API_PATH,
      maxAge: 60 * 60 * 2,
    });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

/** "416-555-0123", "(416) 555 0123", "+1 416…" → "(416) 555-0123". North
 *  American numbers only; anything else returns "". */
function normalizePhone(raw: unknown): string {
  if (typeof raw !== "string") return "";
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length !== 10) return "";
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
