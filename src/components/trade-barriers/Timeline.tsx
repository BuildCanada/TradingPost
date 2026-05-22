import type {
  YFAgreementHistoryEntry,
  YFAgreementStatus,
} from "@/lib/api/types";
import { AGREEMENT_STATUS_LABEL, formatDate } from "./utils";

const STATUS_BAR_COLOR: Record<YFAgreementStatus, string> = {
  awaiting_sponsorship: "bg-gray-400",
  under_negotiation: "bg-yellow-400",
  agreement_reached: "bg-orange-400",
  partially_implemented: "bg-green-400",
  implemented: "bg-green-600",
  deferred: "bg-red-400",
};

export default function Timeline({
  history,
}: {
  history: YFAgreementHistoryEntry[];
}) {
  if (!history.length) return null;

  const sorted = [...history].sort(
    (a, b) =>
      new Date(a.date_entered).getTime() - new Date(b.date_entered).getTime(),
  );

  const startDate = new Date(sorted[0].date_entered);
  const endDate = new Date();
  const totalDays = Math.max(
    1,
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  const minSpacing = 7;
  const maxPosition = 95;
  const adjustedPositions: number[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const entryDate = new Date(sorted[i].date_entered);
    const daysFromStart = Math.ceil(
      (entryDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const original = (daysFromStart / totalDays) * 100;
    let adjusted = original;
    if (i === 0) {
      adjusted = 0;
    } else {
      const prev = adjustedPositions[i - 1];
      const minRequired = prev + minSpacing;
      if (adjusted < minRequired) adjusted = minRequired;
      adjusted = Math.max(2, Math.min(maxPosition, adjusted));
    }
    adjustedPositions.push(adjusted);
  }

  const segments: { width: number; color: string; status: YFAgreementStatus }[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    const segStart = i === 0 ? 0 : adjustedPositions[i];
    const segEnd = next ? adjustedPositions[i + 1] : 100;
    if (current.status === "deferred") {
      if (segments.length) {
        segments[segments.length - 1].width =
          100 - (i === 1 ? 0 : adjustedPositions[i - 1]);
      }
      break;
    }
    segments.push({
      width: segEnd - segStart,
      color: STATUS_BAR_COLOR[current.status],
      status: current.status,
    });
  }

  return (
    <div>
      <div className="relative w-full">
        <div className="w-full h-4 bg-gray-100 rounded-lg overflow-hidden flex">
          {segments.map((s, i) => (
            <div
              key={i}
              className={`h-full ${s.color} transition-all duration-300`}
              style={{ width: `${s.width}%` }}
              title={AGREEMENT_STATUS_LABEL[s.status]}
            />
          ))}
        </div>
        <div className="relative w-full h-[8rem] mb-8">
          {sorted.map((entry, i) => {
            return (
              <div
                key={i}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${adjustedPositions[i]}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <div className="w-[1px] h-4 bg-gray-400 mb-2"></div>
                <div className="flex flex-col items-left transform rotate-90 w-36 mt-16">
                  <div className="text-xs text-gray-500 font-medium whitespace-nowrap">
                    {formatDate(entry.date_entered)}
                  </div>
                  <div className="text-xs text-gray-600 whitespace-nowrap">
                    {AGREEMENT_STATUS_LABEL[entry.status]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
