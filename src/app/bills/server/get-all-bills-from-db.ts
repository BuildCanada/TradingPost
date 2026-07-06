import "server-only";
import { connectToDatabase } from "@/app/bills/lib/mongoose";
import { Bill } from "@/app/bills/models/Bill";
import type { BillDocument } from "@/app/bills/models/Bill";
import { env } from "@/app/bills/env";

export const getAllBillsFromDB = async (): Promise<BillDocument[]> => {
  const uri = env.MONGO_URI || "";
  const hasValidMongoUri =
    uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://");
  if (!hasValidMongoUri) {
    console.warn("!!! No valid MongoDB URI found, returning empty bills array");
    return [];
  }

  try {
    await connectToDatabase();
    // The bills list only renders/filters summary-level fields. Exclude the
    // heavy analysis fields (tenet evaluations, question period questions,
    // votes, steel man) — they are dropped during the page merge anyway, so
    // fetching them only bloats the query and the client payload.
    const bills = await Bill.find({})
      .select("-tenet_evaluations -question_period_questions -votes -steel_man")
      .lean()
      .exec();
    console.log(`Fetched ${bills.length} bills from MongoDB`);

    // Return lean results directly so date fields stay as Date instances
    return bills as unknown as BillDocument[];
  } catch (error) {
    console.error("Error fetching bills from MongoDB:", error);
    return [];
  }
};
