"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, CircleHelp, Mail, Search } from "lucide-react";
import type {
  YFAgreement,
  YFJurisdiction,
  YFTheme,
} from "@/lib/api/types";
import ActivityChart from "./ActivityChart";
import AgreementsList from "./AgreementsList";
import FAQModal from "./FAQModal";
import FiltersPanel from "./FiltersPanel";
import KPICards from "./KPICards";
import { getAgreementStats } from "./utils";

interface Props {
  initialAgreements: YFAgreement[];
  jurisdictions: YFJurisdiction[];
  themes: YFTheme[];
}

export default function TradeBarriersPage({
  initialAgreements,
  jurisdictions,
  themes,
}: Props) {
  const [filteredByFilters, setFilteredByFilters] =
    useState<YFAgreement[]>(initialAgreements);
  const [filteredAgreements, setFilteredAgreements] =
    useState<YFAgreement[]>(initialAgreements);
  const [stats, setStats] = useState(getAgreementStats(initialAgreements));
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);

  useEffect(() => {
    setStats(getAgreementStats(filteredAgreements));
  }, [filteredAgreements]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      setFilteredAgreements(
        filteredByFilters.filter((a) => a.title.toLowerCase().includes(q)),
      );
    } else {
      setFilteredAgreements(filteredByFilters);
    }
  }, [searchQuery, filteredByFilters]);

  const handleFiltersChange = useCallback((next: YFAgreement[]) => {
    setFilteredByFilters(next);
  }, []);

  const clearAll = useCallback(() => {
    setSearchQuery("");
    setFilteredByFilters(initialAgreements);
  }, [initialAgreements]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-stone-50">
      <div className="w-full lg:w-80 flex-shrink-0 p-6 border-r border-[#cdc4bd]">
        <div className="mb-6">
          <Image
            src="/trade-barriers/buildcanada-logo.svg"
            alt="Build Canada"
            width={60}
            height={36}
          />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3 font-mono uppercase tracking-wider text-gray-900">
            Trade Barriers Tracker
          </h1>
          <p className="text-gray-600 text-sm tracking-wide">
            Tracking progress of interprovincial trade agreements across Canada.
          </p>
        </div>

        <div className="mb-2">
          <button
            onClick={() => setFaqOpen(true)}
            className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-mono uppercase tracking-wide border border-[#cdc4bd] bg-white text-gray-900 hover:bg-gray-50 transition-colors rounded-md"
          >
            <CircleHelp className="w-4 h-4 mr-2" />
            FAQ
          </button>
        </div>
        <div className="mb-6">
          <a
            href="mailto:hi@buildcanada.com?subject=Trade Barriers Feedback"
            className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-mono uppercase tracking-wide border border-[#cdc4bd] bg-white text-gray-900 hover:bg-gray-50 transition-colors rounded-md"
          >
            <Mail className="w-4 h-4 mr-2" />
            Feedback
          </a>
        </div>

        <div>
          <div className="lg:hidden">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center justify-between w-full p-3 bg-white border border-[#cdc4bd] hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-mono font-semibold uppercase tracking-wide text-gray-900">
                Filters
              </h3>
              {filtersOpen ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>

          <h3 className="hidden lg:block text-xl font-mono font-semibold mb-4 uppercase tracking-wide text-gray-900">
            Filters
          </h3>

          <div className={`lg:block ${filtersOpen ? "block" : "hidden"}`}>
            <FiltersPanel
              agreements={initialAgreements}
              jurisdictions={jurisdictions}
              themes={themes}
              onFiltersChange={handleFiltersChange}
              onClearAll={clearAll}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-mono font-semibold uppercase tracking-wide text-gray-900">
              Overview
            </h2>
            <span className="text-sm font-mono text-gray-500 uppercase tracking-wide">
              {stats.total} total trade agreements
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <StatCard label="Awaiting" value={stats.awaitingSponsorship} color="text-gray-600" />
            <StatCard label="Negotiations Initiated" value={stats.underNegotiation} color="text-yellow-500" />
            <StatCard label="Agreements Reached" value={stats.agreementReached} color="text-orange-500" />
            <StatCard label="Partially Implemented" value={stats.partiallyImplemented} color="text-green-500" />
            <StatCard label="Fully Implemented" value={stats.implemented} color="text-green-700" />
            <StatCard label="Deferred" value={stats.deferred} color="text-red-600" />
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono font-semibold uppercase tracking-wide text-gray-900">
                {stats.total > 0
                  ? ((stats.implemented / stats.total) * 100).toFixed(0)
                  : 0}
                % Implemented
              </span>
            </div>
            <div className="relative h-3 bg-gray-200 rounded-lg overflow-hidden">
              <ProgressSegment offset={0} width={pct(stats.awaitingSponsorship, stats.total)} className="bg-gray-300" />
              <ProgressSegment offset={pct(stats.awaitingSponsorship, stats.total)} width={pct(stats.underNegotiation, stats.total)} className="bg-yellow-400" />
              <ProgressSegment offset={pct(stats.awaitingSponsorship + stats.underNegotiation, stats.total)} width={pct(stats.agreementReached, stats.total)} className="bg-orange-400" />
              <ProgressSegment offset={pct(stats.awaitingSponsorship + stats.underNegotiation + stats.agreementReached, stats.total)} width={pct(stats.partiallyImplemented, stats.total)} className="bg-green-400" />
              <ProgressSegment offset={pct(stats.awaitingSponsorship + stats.underNegotiation + stats.agreementReached + stats.partiallyImplemented, stats.total)} width={pct(stats.implemented, stats.total)} className="bg-green-600" />
              <ProgressSegment offset={pct(stats.awaitingSponsorship + stats.underNegotiation + stats.agreementReached + stats.partiallyImplemented + stats.implemented, stats.total)} width={pct(stats.deferred, stats.total)} className="bg-red-500" />
            </div>
          </div>
        </div>

        <ActivityChart agreements={filteredAgreements} />
        <KPICards agreements={filteredAgreements} />

        <div>
          <div className="mb-6">
            <div className="hidden md:flex items-center justify-between mb-2">
              <h2 className="text-xl font-mono font-semibold uppercase tracking-wide text-gray-900">
                Agreements ({filteredAgreements.length})
              </h2>
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
            </div>
            <div className="md:hidden">
              <h2 className="text-xl font-mono font-semibold uppercase tracking-wide text-gray-900 mb-4">
                Agreements ({filteredAgreements.length})
              </h2>
              <SearchInput value={searchQuery} onChange={setSearchQuery} fullWidth />
            </div>
            {filteredAgreements.length !== initialAgreements.length && (
              <p className="text-sm text-gray-500 font-mono uppercase tracking-wide">
                Showing {filteredAgreements.length} of {initialAgreements.length} agreements
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AgreementsList agreements={filteredAgreements} />
          </div>

          {filteredAgreements.length === 0 && (
            <div className="bg-white border border-[#cdc4bd] text-center py-12 rounded-md">
              <div className="text-gray-500 text-lg font-mono uppercase tracking-wide">
                No agreements match your filters
              </div>
              <div className="text-gray-500 text-sm mt-2 font-mono uppercase tracking-wide">
                Try adjusting your filter criteria
              </div>
            </div>
          )}
        </div>
      </div>

      <FAQModal open={faqOpen} onOpenChange={setFaqOpen} />
    </div>
  );
}

function pct(part: number, total: number) {
  return total > 0 ? (part / total) * 100 : 0;
}

function ProgressSegment({
  offset,
  width,
  className,
}: {
  offset: number;
  width: number;
  className: string;
}) {
  return (
    <div
      className={`absolute top-0 h-full ${className}`}
      style={{ left: `${offset}%`, width: `${width}%` }}
    />
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white border border-[#cdc4bd] col-span-2 md:col-span-1 rounded-md">
      <div className="p-4">
        <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
        <div className="text-sm text-gray-500 font-mono uppercase tracking-wide">
          {label}
        </div>
      </div>
    </div>
  );
}

function SearchInput({
  value,
  onChange,
  fullWidth,
}: {
  value: string;
  onChange: (v: string) => void;
  fullWidth?: boolean;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder="Search agreements..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`pl-10 pr-4 py-2 border border-[#cdc4bd] bg-white text-sm font-mono uppercase tracking-wide text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${fullWidth ? "w-full" : "w-64"}`}
      />
    </div>
  );
}
