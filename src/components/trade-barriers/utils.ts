import type {
  YFAgreement,
  YFAgreementJurisdiction,
  YFAgreementJurisdictionStatus,
  YFAgreementStatus,
} from "@/lib/api/types";

export const AGREEMENT_STATUS_LABEL: Record<YFAgreementStatus, string> = {
  awaiting_sponsorship: "Awaiting Sponsorship",
  under_negotiation: "Under Negotiation",
  agreement_reached: "Agreement Reached",
  partially_implemented: "Partially Implemented",
  implemented: "Implemented",
  deferred: "Deferred",
};

export const JURISDICTION_STATUS_LABEL: Record<
  YFAgreementJurisdictionStatus,
  string
> = {
  unknown: "Unknown",
  aware: "Aware",
  considering: "Considering",
  engaged: "Engaged",
  committed: "Committed",
  implementing: "Implementing",
  complete: "Complete",
  declined: "Declined",
  not_applicable: "Not Applicable",
};

export function getAgreementStatusColor(status: YFAgreementStatus): string {
  switch (status) {
    case "deferred":
      return "bg-red-100 text-red-700 border-red-300";
    case "awaiting_sponsorship":
      return "bg-gray-100 text-gray-600 border-gray-300";
    case "under_negotiation":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "agreement_reached":
      return "bg-orange-100 text-orange-700 border-orange-300";
    case "partially_implemented":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "implemented":
      return "bg-green-100 text-green-700 border-green-300";
  }
}

export function getJurisdictionStatusColor(
  status: YFAgreementJurisdictionStatus,
): string {
  switch (status) {
    case "unknown":
      return "bg-gray-100 text-gray-700 border-gray-300";
    case "aware":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "considering":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "engaged":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "committed":
      return "bg-green-50 text-green-700 border-green-200";
    case "implementing":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "complete":
      return "bg-green-100 text-green-800 border-green-300";
    case "declined":
      return "bg-red-50 text-red-700 border-red-200";
    case "not_applicable":
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "No date set";
  return new Date(dateString).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isOverdue(
  deadline: string | null,
  status: YFAgreementStatus,
): boolean {
  const days = getDaysUntilDeadline(deadline);
  return days !== null && days < 0 && status !== "implemented";
}

export interface AgreementStats {
  total: number;
  awaitingSponsorship: number;
  underNegotiation: number;
  agreementReached: number;
  partiallyImplemented: number;
  implemented: number;
  deferred: number;
}

export function getAgreementStats(agreements: YFAgreement[]): AgreementStats {
  return {
    total: agreements.length,
    awaitingSponsorship: agreements.filter(
      (a) => a.status === "awaiting_sponsorship",
    ).length,
    underNegotiation: agreements.filter((a) => a.status === "under_negotiation")
      .length,
    agreementReached: agreements.filter((a) => a.status === "agreement_reached")
      .length,
    partiallyImplemented: agreements.filter(
      (a) => a.status === "partially_implemented",
    ).length,
    implemented: agreements.filter((a) => a.status === "implemented").length,
    deferred: agreements.filter((a) => a.status === "deferred").length,
  };
}

export function getParticipatingJurisdictions(
  jurisdictions: YFAgreementJurisdiction[],
): YFAgreementJurisdiction[] {
  return jurisdictions.filter(
    (j) =>
      j.status !== "declined" &&
      j.status !== "not_applicable" &&
      j.status !== "unknown",
  );
}

export function getUniqueThemeNames(agreements: YFAgreement[]): string[] {
  const names = agreements
    .map((a) => a.theme?.name)
    .filter((n): n is string => Boolean(n && n.trim()));
  return Array.from(new Set(names)).sort();
}
