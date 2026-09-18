import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/app/bills/lib/mongoose";
import { Bill, type BillDocument } from "@/app/bills/models/Bill";
import { User } from "@/app/bills/models/User";
import { authOptions } from "@/app/bills/lib/auth";
import { DEV_OPEN_ACCESS } from "@/app/bills/lib/auth-guards";
import {
  type ApiBillDetail,
  fetchBillMarkdown,
  getBillFromCivicsProjectApi,
  saveBillAnalysis,
  summarizeBillText,
} from "@/app/bills/services/billApi";
import { notifyNewBillAnalysis } from "@/app/bills/services/slack-notifier";

/**
 * Admin-only endpoint to refetch a bill from the Civics Project API and re-run
 * its AI analysis.
 *
 * Fetches the latest bill record from the Civics Project API, refreshes the
 * stored metadata (title, status, stages, sponsor, genres, source, …), then
 * pulls the latest bill text, feeds it through `summarizeBillText`, and
 * overwrites the AI-generated fields in the DB.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // DEV ONLY: open access — skip the session/allowlist checks entirely.
  if (!DEV_OPEN_ACCESS) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is on the allowlist; do not create
    await connectToDatabase();
    const dbUser = await User.findOne({
      emailLower: session.user.email.toLowerCase(),
    });
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  await connectToDatabase();

  const { id } = await params;

  const existing = (await Bill.findOne({ billId: id })
    .lean()
    .exec()) as BillDocument | null;
  if (!existing) {
    return NextResponse.json({ error: "Bill not found" }, { status: 404 });
  }

  // Refetch the latest bill record from the Civics Project API.
  let apiBill: ApiBillDetail | null = null;
  try {
    apiBill = await getBillFromCivicsProjectApi(id);
  } catch (error) {
    console.error(
      `Reprocess ${id}: failed to fetch from Civics Project`,
      error,
    );
    return NextResponse.json(
      { error: "Failed to fetch latest bill data from Civics Project API" },
      { status: 502 },
    );
  }
  if (!apiBill) {
    return NextResponse.json(
      { error: "Bill not found in Civics Project API" },
      { status: 404 },
    );
  }

  // Resolve the latest bill text source from the API, falling back to stored.
  const source =
    apiBill.source ||
    (apiBill.billTexts?.[0] as { url?: string } | undefined)?.url ||
    existing.source;
  if (!source) {
    return NextResponse.json(
      { error: "No bill text source available to reprocess" },
      { status: 422 },
    );
  }

  const markdown = await fetchBillMarkdown(source);
  if (!markdown) {
    return NextResponse.json(
      { error: "Failed to fetch bill text from source" },
      { status: 502 },
    );
  }

  // Explicit admin action — exempt from the organic-traffic rate cap.
  const analysis = await summarizeBillText(markdown, { bypassCap: true });
  if (analysis.isFallback) {
    // Never overwrite a good stored analysis with a degraded placeholder
    // (missing OpenAI key, parse failure, API error).
    return NextResponse.json(
      { error: "AI analysis unavailable; existing analysis left untouched" },
      { status: 502 },
    );
  }

  // One write path, shared with the refresh sweep: it applies the same
  // provenance stamp and the same social-issue-forces-abstain rule.
  await saveBillAnalysis({ bill: apiBill, analysis, source });

  await notifyNewBillAnalysis({
    billId: id,
    title: apiBill.title,
    shortTitle: apiBill.shortTitle ?? existing.short_title,
    analysis,
  });

  return NextResponse.json({ ok: true });
}
