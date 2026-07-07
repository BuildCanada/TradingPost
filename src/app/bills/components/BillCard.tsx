import Link from "next/link";
import { memo, type ComponentProps } from "react";
import { BillSummary } from "@/app/bills/types";
import { Judgement, JudgementValue } from "./Judgement/judgement.component";
import { DynamicIcon } from "lucide-react/dynamic";
import { getCategoryIcon } from "@/app/bills/utils/bill-category-to-icon/bill-category-to-icon.util";
import { getBillMostRecentDate } from "@/app/bills/utils/stages-to-dates/stages-to-dates";
import { formatBillDate } from "@/app/bills/utils/format-date";
import { TenetEvaluation } from "@/app/bills/models/Bill";
import { BASE_PATH } from "@/app/bills/utils/basePath";

interface BillCardProps {
  bill: BillSummary & { tenet_evaluations?: TenetEvaluation[] };
}

function BillCard({ bill }: BillCardProps) {
  const bestDate = getBillMostRecentDate(bill);
  const dateDisplay = formatBillDate(bestDate);

  const judgementValue: JudgementValue = bill.final_judgment || "abstain";

  return (
    <li className="group border border-border-light bg-white duration-200 overflow-hidden hover:border-dark transition-colors">
      <Link href={`${BASE_PATH}/${bill.billID}`} className="block">
        <div className="p-5">
          {/* Header Section */}
          <div className="flex items-start md:flex-row flex-col-reverse  justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2"></div>
              <h2 className="text-xl mb-4 font-semibold    max-w-[70%] transition-colors leading-tight">
                {bill.shortTitle ?? bill.title}
              </h2>
            </div>

            {bill.final_judgment && <Judgement judgement={judgementValue} />}
          </div>

          {/* Description */}
          {bill.description && (
            <p
              className="text-sm text-text-secondary mb-3 leading-relaxed overflow-hidden"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical" as const,
              }}
            >
              {bill.description}
            </p>
          )}

          {/* Tags Section */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {/* Impact Badge */}
            {bill.impact && (
              <span
                className={`inline-flex items-center px-2.5 py-1 type-label-sm ${
                  bill.impact === "High"
                    ? "bg-auburn-100 text-auburn-800"
                    : bill.impact === "Medium"
                      ? "bg-linen-200 text-charcoal-700"
                      : "bg-charcoal-100 text-charcoal-600"
                }`}
              >
                {bill.impact} Impact
              </span>
            )}
            {(bill.billID === "C-1" || bill.billID === "S-1") && (
              <span className="inline-flex items-center px-2.5 py-1 type-label-sm bg-charcoal-100 text-charcoal-600">
                Pro Forma Bill
              </span>
            )}

            {/* Genre Tags (limit to 3 visible) */}
            {bill.genres &&
              bill.genres.length > 0 &&
              bill.genres.map((genre, index) => {
                const icon = getCategoryIcon(genre);
                return (
                  icon && (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 type-label-sm bg-linen-100 text-charcoal-700"
                    >
                      <DynamicIcon
                        className="w-4 h-4 mr-1"
                        name={icon as ComponentProps<typeof DynamicIcon>["name"]}
                      />{" "}
                      {genre}
                    </span>
                  )
                );
              })}
          </div>

          {/* Footer Section */}
          <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-border-light">
            <div className="flex items-center gap-4">
              <span className="text-xs text-dark">Bill {bill.billID}</span>{" "}
              {bill.sponsorName && <span>by {bill.sponsorName}</span>}
            </div>
            <span className="text-text-secondary">{dateDisplay}</span>
          </div>
        </div>
      </Link>
    </li>
  );
}

// Memoize BillCard to prevent unnecessary re-renders when bill data hasn't changed
export default memo(BillCard);
