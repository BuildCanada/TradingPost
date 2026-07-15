import "server-only";
import { cache } from "react";
import { connectToDatabase } from "@/app/bills/lib/mongoose";
import { Bill } from "@/app/bills/models/Bill";
import type { BillDocument } from "@/app/bills/models/Bill";
import { env } from "@/app/bills/env";

// Distinguishes "the bill isn't in the DB" from "we couldn't check". Callers
// that trigger expensive side effects (LLM summarization, persistence) must
// treat "unavailable" as unknown state and skip them — a missing MONGO_URI
// must never look like an empty database.
export type BillDbLookup =
  | { status: "found"; bill: BillDocument }
  | { status: "not-found" }
  | { status: "unavailable"; reason: "missing-uri" | "connect-or-query-error" };

// Wrapped in React.cache so repeated lookups for the same bill within a single
// server render (e.g. the page body and a helper both resolving the same id)
// share one query instead of re-hitting Mongo. Never throws, so the cached
// entry is always a settled result.
export const lookupBillInDB = cache(
  async (billId: string): Promise<BillDbLookup> => {
    const uri = env.MONGO_URI || "";
    const hasValidMongoUri =
      uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://");
    if (!hasValidMongoUri) {
      console.error(
        `[bills] DB unavailable for ${billId}: MONGO_URI is missing or malformed`,
      );
      return { status: "unavailable", reason: "missing-uri" };
    }

    try {
      await connectToDatabase();
      const existing = (await Bill.findOne({ billId })
        .lean()
        .exec()) as BillDocument | null;
      return existing
        ? { status: "found", bill: existing }
        : { status: "not-found" };
    } catch (error) {
      console.error(`[bills] DB unavailable for ${billId}:`, error);
      return { status: "unavailable", reason: "connect-or-query-error" };
    }
  },
);

export async function getBillByIdFromDB(
  billId: string,
): Promise<BillDocument | null> {
  const result = await lookupBillInDB(billId);
  return result.status === "found" ? result.bill : null;
}
