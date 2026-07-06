import "server-only";
import { cache } from "react";
import { connectToDatabase } from "@/app/bills/lib/mongoose";
import { Bill } from "@/app/bills/models/Bill";
import type { BillDocument } from "@/app/bills/models/Bill";
import { env } from "@/app/bills/env";

// Wrapped in React.cache so repeated lookups for the same bill within a single
// server render (e.g. the page body and a helper both resolving the same id)
// share one query instead of re-hitting Mongo.
export const getBillByIdFromDB = cache(
  async (billId: string): Promise<BillDocument | null> => {
    const uri = env.MONGO_URI || "";
    const hasValidMongoUri =
      uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://");
    if (!hasValidMongoUri) return null;

    await connectToDatabase();
    const existing = (await Bill.findOne({ billId })
      .lean()
      .exec()) as BillDocument | null;
    return existing;
  },
);
