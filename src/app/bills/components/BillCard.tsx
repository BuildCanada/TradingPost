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

/* A hairline tag in the house style: square, mono, uppercase. */
function Tag({
  children,
  emphasis = false,
}: {
  children: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-1 type-label-sm ${
        emphasis
          ? "border-accent/40 bg-auburn-50 text-accent"
          : "border-border-light text-text-secondary"
      }`}
    >
      {children}
    </span>
  );
}

function BillCard({ bill }: BillCardProps) {
  const bestDate = getBillMostRecentDate(bill);
  const dateDisplay = formatBillDate(bestDate);

  const judgementValue: JudgementValue = bill.final_judgment || "abstain";
  const isProForma = bill.billID === "C-1" || bill.billID === "S-1";

  return (
    <li className="border border-border-light bg-white transition-colors hover:border-dark">
      <Link
        href={`${BASE_PATH}/${bill.billID}`}
        className="group block h-full p-5 transition-colors hover:bg-linen-50"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="type-label text-text-secondary">
              Bill {bill.billID}
              {bill.sponsorName && bill.sponsorName !== "Unknown" && (
                <span className="text-text-muted"> &middot; {bill.sponsorName}</span>
              )}
            </p>
            <h2 className="type-h4 mt-2 text-dark transition-colors group-hover:text-accent">
              {bill.shortTitle ?? bill.title}
            </h2>
          </div>

          {bill.final_judgment && (
            <Judgement judgement={judgementValue} className="shrink-0" />
          )}
        </div>

        {bill.description && (
          <p className="type-default mt-2 line-clamp-2 text-text-secondary">
            {bill.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {bill.impact && <Tag emphasis={bill.impact === "High"}>{bill.impact} impact</Tag>}
          {isProForma && <Tag>Pro forma</Tag>}
          {bill.genres?.map((genre, index) => {
            const icon = getCategoryIcon(genre);
            return (
              icon && (
                <Tag key={index}>
                  <DynamicIcon
                    className="h-3.5 w-3.5"
                    name={icon as ComponentProps<typeof DynamicIcon>["name"]}
                  />
                  {genre}
                </Tag>
              )
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border-light pt-3">
          <span className="type-label-sm text-text-secondary transition-colors group-hover:text-accent">
            Read the analysis
          </span>
          <span className="type-mono-sm text-text-secondary">{dateDisplay}</span>
        </div>
      </Link>
    </li>
  );
}

// Memoize BillCard to prevent unnecessary re-renders when bill data hasn't changed
export default memo(BillCard);
