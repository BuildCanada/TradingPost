import Link from "next/link";
import { ArrowLeft, Calendar, ExternalLink, MapPin, Tag } from "lucide-react";
import type { YFAgreementDetail } from "@/lib/api/types";
import Timeline from "./Timeline";
import {
  AGREEMENT_STATUS_LABEL,
  formatDate,
  getAgreementStatusColor,
  getJurisdictionStatusColor,
  isOverdue,
  JURISDICTION_STATUS_LABEL,
} from "./utils";

export default function AgreementDetail({
  agreement,
}: {
  agreement: YFAgreementDetail;
}) {
  const overdue = isOverdue(agreement.deadline, agreement.status);

  return (
    <article className="max-w-4xl mx-auto px-6 py-8">
      <Link
        href="/trade-barriers"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Trade Barriers
      </Link>

      <h1 className="text-3xl font-soehne mb-4">{agreement.title}</h1>

      <div className="space-y-6">
        <div className="w-fit">
          <div
            className={`text-xs p-1 rounded-md border inline-block ${getAgreementStatusColor(agreement.status)}`}
          >
            {AGREEMENT_STATUS_LABEL[agreement.status]}
          </div>
          {agreement.theme && (
            <div className="mt-2 text-sm font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {agreement.theme.name}
            </div>
          )}
        </div>

        <div
          className={`text-sm ${overdue ? "text-red-600 font-medium" : "text-gray-600"}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span className="font-medium">
              {agreement.status === "implemented" ? "Completed" : "Deadline"}:
            </span>{" "}
            {formatDate(agreement.deadline)}
            {overdue && <span className="text-red-600"> (Overdue)</span>}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span className="font-medium">Launch Date:</span>{" "}
            {formatDate(agreement.launch_date)}
          </div>
        </div>

        {agreement.history.length > 0 && (
          <div className="hidden md:block">
            <h2 className="text-lg font-mono uppercase tracking-wide mb-2">Timeline</h2>
            <Timeline history={agreement.history} />
          </div>
        )}

        {agreement.summary && (
          <div>
            <h2 className="text-lg font-mono uppercase tracking-wide mb-2">Summary</h2>
            <p className="text-gray-700">{agreement.summary}</p>
          </div>
        )}

        {agreement.description && (
          <div>
            <h2 className="text-lg font-mono uppercase tracking-wide mb-2">Description</h2>
            <p className="text-gray-700">{agreement.description}</p>
          </div>
        )}

        <div>
          <h2 className="text-lg font-mono uppercase tracking-wide mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-600" />
            Jurisdiction Status
          </h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-700 uppercase tracking-wide text-sm">
                    Jurisdiction
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-700 uppercase tracking-wide text-sm">
                    Status
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-700 uppercase tracking-wide text-sm">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {agreement.jurisdictions.map((j, i) => (
                  <tr
                    key={j.code}
                    className={`border-b border-gray-200 ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-3 text-gray-900">{j.name}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded border text-xs ${getJurisdictionStatusColor(j.status)}`}
                      >
                        {JURISDICTION_STATUS_LABEL[j.status]}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 text-sm">
                      <div>{j.notes}</div>
                      {j.history && j.history.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          <div className="font-medium mb-1">Recent:</div>
                          {j.history.slice(0, 1).map((h, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                              <span>{JURISDICTION_STATUS_LABEL[h.status]}</span>
                              <span>•</span>
                              <span>{formatDate(h.date_entered)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {agreement.history.length > 0 && (
          <div>
            <h2 className="text-lg font-mono uppercase tracking-wide mb-4">
              Agreement History
            </h2>
            <div className="space-y-3">
              {agreement.history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${getAgreementStatusColor(h.status).split(" ")[0]}`}
                  ></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {AGREEMENT_STATUS_LABEL[h.status]}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(h.date_entered)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Updated:</span>{" "}
                {formatDate(agreement.updated_at)}
              </div>
            </div>
            {agreement.source_url && (
              <a
                href={agreement.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:opacity-90 text-white text-sm font-medium uppercase tracking-wide rounded-md transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Source
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
