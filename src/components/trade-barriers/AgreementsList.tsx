import Link from "next/link";
import { Calendar, Tag } from "lucide-react";
import type { YFAgreement } from "@/lib/api/types";
import {
  AGREEMENT_STATUS_LABEL,
  formatDate,
  getAgreementStatusColor,
  getParticipatingJurisdictions,
  isOverdue,
} from "./utils";

export default function AgreementsList({
  agreements,
}: {
  agreements: YFAgreement[];
}) {
  return (
    <>
      {agreements.map((item) => {
        const overdue = isOverdue(item.deadline, item.status);
        const sortedHistory = [...item.history].sort(
          (a, b) =>
            new Date(a.date_entered).getTime() -
            new Date(b.date_entered).getTime(),
        );
        const recent = sortedHistory.at(-1);
        const participating = getParticipatingJurisdictions(item.jurisdictions);

        return (
          <Link
            key={item.id}
            href={`/trade-barriers/${item.slug}`}
            className="block bg-white border border-[#cdc4bd] hover:shadow-lg transition-shadow flex flex-col"
          >
            <div className="p-6 pb-4">
              <h3 className="font-sans text-xl text-charcoal-1000 mb-2 font-medium leading-tight">
                {item.title}
              </h3>
              <div className="w-fit">
                <span
                  className={`text-xs p-1 w-fit border inline-block ${getAgreementStatusColor(item.status)}`}
                >
                  {AGREEMENT_STATUS_LABEL[item.status]}
                </span>
                {item.theme && (
                  <div className="mt-2 text-sm font-semibold text-gray-800 uppercase tracking-[0.14em] flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {item.theme.name}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 pb-6 pt-0 flex-1 flex flex-col">
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {participating.slice(0, 3).map((j) => (
                    <span
                      key={j.code}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1"
                    >
                      {j.name}
                      {j.history && j.history.length > 0 && (
                        <span className="ml-1 text-gray-400">•</span>
                      )}
                    </span>
                  ))}
                  {participating.length > 3 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1">
                      +{participating.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {recent && (
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">
                    Recent History:
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-600 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${getAgreementStatusColor(recent.status).split(" ")[0]}`}
                      ></span>
                      <span className="font-medium">
                        {AGREEMENT_STATUS_LABEL[recent.status]}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span>{formatDate(recent.date_entered)}</span>
                    </div>
                    {item.history.length > 1 && (
                      <div className="text-xs text-gray-400 ml-4">
                        +{item.history.length - 1} more entries
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-[#cdc4bd]">
                <div
                  className={`text-sm ${overdue ? "text-red-600 font-medium" : "text-gray-600"}`}
                >
                  <div>
                    <Calendar className="w-4 h-4 text-gray-600 inline-block mr-1 relative -top-px" />
                    <span className="font-medium">
                      {item.status === "implemented" ? "Completed" : "Deadline"}:
                    </span>{" "}
                    {formatDate(item.deadline)}
                    {overdue && <span className="text-red-600"> (Overdue)</span>}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </>
  );
}
