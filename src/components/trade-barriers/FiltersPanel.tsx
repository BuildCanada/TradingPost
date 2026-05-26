"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  YFAgreement,
  YFAgreementStatus,
  YFJurisdiction,
  YFTheme,
} from "@/lib/api/types";
import {
  AGREEMENT_STATUS_LABEL,
  getDaysUntilDeadline,
} from "./utils";

const DEADLINE_TYPES = [
  "Overdue",
  "Due Soon (30 days)",
  "On Track",
  "No Deadline",
] as const;
type DeadlineType = (typeof DEADLINE_TYPES)[number];

const STATUS_OPTIONS: YFAgreementStatus[] = [
  "awaiting_sponsorship",
  "under_negotiation",
  "agreement_reached",
  "partially_implemented",
  "implemented",
  "deferred",
];

interface FiltersPanelProps {
  agreements: YFAgreement[];
  jurisdictions: YFJurisdiction[];
  themes: YFTheme[];
  onFiltersChange: (filtered: YFAgreement[]) => void;
  onClearAll?: () => void;
}

interface Filters {
  statuses: YFAgreementStatus[];
  deadlineTypes: DeadlineType[];
  jurisdictionCodes: string[];
  themeIds: number[];
}

export default function FiltersPanel({
  agreements,
  jurisdictions,
  themes,
  onFiltersChange,
  onClearAll,
}: FiltersPanelProps) {
  const [filters, setFilters] = useState<Filters>({
    statuses: [],
    deadlineTypes: [],
    jurisdictionCodes: [],
    themeIds: [],
  });

  const applyFilters = useCallback(
    (f: Filters, list: YFAgreement[]) => {
      let result = [...list];
      if (f.statuses.length) {
        result = result.filter((a) => f.statuses.includes(a.status));
      }
      if (f.deadlineTypes.length) {
        result = result.filter((a) => {
          const days = getDaysUntilDeadline(a.deadline);
          if (
            f.deadlineTypes.includes("Overdue") &&
            days !== null &&
            days < 0 &&
            a.status !== "implemented"
          )
            return true;
          if (
            f.deadlineTypes.includes("Due Soon (30 days)") &&
            days !== null &&
            days <= 30 &&
            days >= 0
          )
            return true;
          if (
            f.deadlineTypes.includes("On Track") &&
            days !== null &&
            days > 30
          )
            return true;
          if (f.deadlineTypes.includes("No Deadline") && days === null)
            return true;
          return false;
        });
      }
      if (f.jurisdictionCodes.length) {
        result = result.filter((a) =>
          a.jurisdictions.some(
            (j) =>
              f.jurisdictionCodes.includes(j.code) &&
              j.status !== "declined" &&
              j.status !== "not_applicable" &&
              j.status !== "unknown",
          ),
        );
      }
      if (f.themeIds.length) {
        result = result.filter(
          (a) => a.theme && f.themeIds.includes(a.theme.id),
        );
      }
      return result;
    },
    [],
  );

  useEffect(() => {
    onFiltersChange(applyFilters(filters, agreements));
  }, [filters, agreements, applyFilters, onFiltersChange]);

  function toggle<T>(key: keyof Filters, value: T) {
    setFilters((prev) => {
      const arr = prev[key] as unknown as T[];
      const isIn = arr.includes(value);
      return {
        ...prev,
        [key]: isIn ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }

  function clearAll() {
    setFilters({
      statuses: [],
      deadlineTypes: [],
      jurisdictionCodes: [],
      themeIds: [],
    });
    onClearAll?.();
  }

  const activeCount =
    filters.statuses.length +
    filters.deadlineTypes.length +
    filters.jurisdictionCodes.length +
    filters.themeIds.length;

  return (
    <div className="bg-white border border-[#cdc4bd]">
      <div className="p-4 space-y-6">
        <FilterSection title="Status">
          {STATUS_OPTIONS.map((s) => (
            <CheckboxRow
              key={s}
              checked={filters.statuses.includes(s)}
              onChange={() => toggle<YFAgreementStatus>("statuses", s)}
              label={AGREEMENT_STATUS_LABEL[s]}
            />
          ))}
        </FilterSection>

        <FilterSection title="Deadline">
          {DEADLINE_TYPES.map((d) => (
            <CheckboxRow
              key={d}
              checked={filters.deadlineTypes.includes(d)}
              onChange={() => toggle<DeadlineType>("deadlineTypes", d)}
              label={d}
            />
          ))}
        </FilterSection>

        <FilterSection title="Jurisdictions">
          {jurisdictions.map((j) => (
            <CheckboxRow
              key={j.code}
              checked={filters.jurisdictionCodes.includes(j.code)}
              onChange={() => toggle<string>("jurisdictionCodes", j.code)}
              label={j.name}
            />
          ))}
        </FilterSection>

        {themes.length > 0 && (
          <FilterSection title="Themes">
            {themes.map((t) => (
              <CheckboxRow
                key={t.id}
                checked={filters.themeIds.includes(t.id)}
                onChange={() => toggle<number>("themeIds", t.id)}
                label={t.name}
              />
            ))}
          </FilterSection>
        )}

        {activeCount > 0 && (
          <div className="pt-4 border-t border-[#cdc4bd]">
            <div className="text-xs text-gray-500 font-mono uppercase tracking-[0.14em] mb-2">
              Active filters: {activeCount}
            </div>
          </div>
        )}
      </div>
      {activeCount > 0 && (
        <div className="p-4 pt-0">
          <button
            onClick={clearAll}
            className="text-xs font-mono uppercase tracking-[0.14em] border border-[#cdc4bd] text-gray-700 hover:bg-gray-50 px-3 py-1.5"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 my-3 uppercase tracking-[0.14em] font-mono">
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}

function CheckboxRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="border-gray-300"
      />
      <span className="text-sm text-gray-800">{label}</span>
    </label>
  );
}
