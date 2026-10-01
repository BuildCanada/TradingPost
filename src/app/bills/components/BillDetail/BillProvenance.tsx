import React from "react";
import type { UnifiedBill } from "@/app/bills/utils/billConverters";

interface BillProvenanceProps {
  bill: UnifiedBill;
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-CA", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Says which version of the bill was judged, and when.
 *
 * Bills are amended as they move through the House, and a verdict on the first
 * reading text is not a verdict on the text that passed. Naming the date is the
 * difference between an opinion and a citable one.
 */
export function BillProvenance({ bill }: BillProvenanceProps) {
  if (bill.analysisPending) {
    return (
      <p className="text-sm text-text-secondary">
        Analysis pending — this bill has not been assessed yet. The facts above
        come from the Parliament of Canada record.
      </p>
    );
  }

  if (!bill.analysisGeneratedAt) return null;

  const generatedAt = new Date(bill.analysisGeneratedAt);
  if (Number.isNaN(generatedAt.getTime())) return null;

  return (
    <p className="text-sm text-text-secondary">
      Assessed {DATE_FORMAT.format(generatedAt)}
      {bill.analysisSourceRef ? (
        <>
          {" from the "}
          <a
            className="text-accent hover:underline"
            href={bill.analysisSourceRef}
            rel="noreferrer"
            target="_blank"
          >
            bill text published at that date
          </a>
        </>
      ) : null}
      . Later amendments may not be reflected.
    </p>
  );
}
