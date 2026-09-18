import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { refreshBills } from "@/app/bills/services/refresh";

export const dynamic = "force-dynamic";
// A sweep analyzes up to its budget of bills at reasoning.effort "high".
export const maxDuration = 300;

function tokenMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on a length mismatch, which is itself a mismatch.
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Run the refresh sweep on demand.
 *
 * The scheduled run lives in `src/instrumentation.ts`; this is the manual kick,
 * and the seam for moving the schedule out to an external scheduler later
 * without changing what a sweep does.
 *
 * Optional body: { "analysisBudget": number, "force": boolean }.
 */
export async function POST(request: Request) {
  const secret = process.env.BILLS_CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "BILLS_CRON_SECRET is not configured" },
      { status: 503 },
    );
  }

  const provided = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!provided || !tokenMatches(provided, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { analysisBudget?: number; force?: boolean } = {};
  try {
    body = (await request.json()) ?? {};
  } catch {
    // No body is fine — the defaults are the normal case.
  }

  const result = await refreshBills({
    analysisBudget:
      typeof body.analysisBudget === "number" ? body.analysisBudget : undefined,
    force: body.force === true,
  });

  // A skipped sweep is a normal outcome (another replica holds the lease), not
  // an error — 200 with the reason, so a scheduler does not retry into a loop.
  return NextResponse.json(result);
}
