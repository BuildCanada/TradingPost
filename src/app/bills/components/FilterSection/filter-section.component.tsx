"use client";

import { useState } from "react";

import { cn } from "@/app/bills/lib/utils";

export interface FilterState {
  search: string;
  status: string[];
  category: string[];
  party: string[];
  chamber: string[];
  dateRange: string;
  judgement: string[];
}

export interface FilterOptions {
  statuses: string[];
  parties: string[];
  chambers: string[];
  categories: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  forceCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  filterOptions?: FilterOptions;
}

type ArrayFilterKey = "status" | "category" | "party" | "chamber" | "judgement";

/* A square, hairline checkbox in the house style — no rounded shadcn control.
   The native input is kept for keyboard and screen-reader behaviour and drawn
   with `appearance-none`; the tick is a `peer-checked` sibling. */
function FilterCheckbox({
  id,
  label,
  checked,
  onChange,
  className,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center mt-px">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="peer h-4 w-4 cursor-pointer appearance-none border border-border-light bg-linen-50 checked:border-dark checked:bg-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        <svg
          viewBox="0 0 10 10"
          aria-hidden="true"
          className="pointer-events-none absolute h-2.5 w-2.5 text-bg opacity-0 peer-checked:opacity-100"
        >
          <path
            d="M1 5.2 3.7 8 9 2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="square"
          />
        </svg>
      </span>
      <label
        htmlFor={id}
        className={cn(
          "type-default cursor-pointer leading-snug text-text-secondary hover:text-dark",
          checked && "text-dark",
          className,
        )}
      >
        {label}
      </label>
    </div>
  );
}

function FilterGroup({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <details open className="group answer-reveal border-b border-border-light">
      <summary className="flex h-11 cursor-pointer list-none items-center justify-between px-4 type-label text-text-secondary hover:text-dark [&::-webkit-details-marker]:hidden">
        <span>
          {label}
          {count > 0 && <span className="ml-2 text-accent">{count}</span>}
        </span>
        <svg
          viewBox="0 0 10 6"
          aria-hidden="true"
          className="h-1.5 w-2.5 transition-transform group-open:rotate-180"
        >
          <path
            d="M1 1l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
      </summary>
      <div className="flex flex-col gap-2.5 px-4 pb-4">{children}</div>
    </details>
  );
}

export function FilterSidebar({
  filters,
  onFiltersChange,
  onClearFilters,
  forceCollapsed,
  onCollapsedChange,
  filterOptions,
}: FilterSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  // Derive from the controlling prop when provided; otherwise use local state.
  // (Avoids syncing a prop into state via an effect.)
  const isCollapsed = forceCollapsed ?? internalCollapsed;

  // Handle collapse toggle
  const handleCollapseToggle = () => {
    const newCollapsed = !isCollapsed;
    setInternalCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };

  const updateFilter = (
    key: keyof FilterState,
    value: FilterState[keyof FilterState],
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: ArrayFilterKey, value: string) => {
    const currentValues = filters[key];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    updateFilter(key, newValues);
  };

  const activeCount =
    (filters.search ? 1 : 0) +
    filters.status.length +
    filters.category.length +
    filters.party.length +
    filters.chamber.length +
    filters.judgement.length +
    (filters.dateRange && filters.dateRange !== "all" ? 1 : 0);

  return (
    <div className="border border-border-light bg-white md:sticky md:top-[90px] md:max-h-[calc(100vh-110px)] md:overflow-y-auto">
      <div className="flex h-12 items-center justify-between gap-3 border-b border-border-light bg-linen-100 px-4">
        <span className="type-label text-dark">
          Filters
          {activeCount > 0 && (
            <span className="ml-2 text-accent">{activeCount}</span>
          )}
        </span>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="type-label-sm cursor-pointer text-text-secondary underline underline-offset-2 hover:text-accent"
            >
              Clear all
            </button>
          )}
          <button
            type="button"
            onClick={handleCollapseToggle}
            aria-expanded={!isCollapsed}
            className="type-label-sm cursor-pointer text-text-secondary hover:text-dark md:hidden"
          >
            {isCollapsed ? "Show" : "Hide"}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div>
          {/* Search */}
          <div className="border-b border-border-light p-4">
            <div className="flex h-11 items-center gap-3 border border-border-light bg-linen-50 px-3">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                className="shrink-0 text-text-secondary"
              >
                <circle
                  cx="6"
                  cy="6"
                  r="4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M9.5 9.5L13 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="text"
                placeholder="Search bills..."
                aria-label="Search bills"
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="min-w-0 flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-text-secondary"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => updateFilter("search", "")}
                  aria-label="Clear search"
                  className="shrink-0 cursor-pointer text-text-secondary hover:text-dark"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3 3l8 8M11 3l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <FilterGroup label="Judgement" count={filters.judgement.length}>
            {(["yes", "no", "abstain"] as const).map((j) => (
              <FilterCheckbox
                key={j}
                id={`judgement-${j}`}
                label={j === "abstain" ? "Abstain" : `Vote ${j}`}
                checked={filters.judgement.includes(j)}
                onChange={() => toggleArrayFilter("judgement", j)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Status" count={filters.status.length}>
            {(filterOptions?.statuses || []).map((status) => (
              <FilterCheckbox
                key={status}
                id={`status-${status}`}
                label={status}
                checked={filters.status.includes(status.toLowerCase())}
                onChange={() =>
                  toggleArrayFilter("status", status.toLowerCase())
                }
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Category" count={filters.category.length}>
            {(filterOptions?.categories || []).map((category) => (
              <FilterCheckbox
                key={category}
                id={`category-${category}`}
                label={category}
                checked={filters.category.includes(category)}
                onChange={() => toggleArrayFilter("category", category)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Sponsor party" count={filters.party.length}>
            {(filterOptions?.parties || []).map((party) => (
              <FilterCheckbox
                key={party}
                id={`party-${party}`}
                label={party}
                checked={filters.party.includes(party)}
                onChange={() => toggleArrayFilter("party", party)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Chamber" count={filters.chamber.length}>
            {(filterOptions?.chambers || []).map((chamber) => (
              <FilterCheckbox
                key={chamber}
                id={`chamber-${chamber}`}
                label={chamber}
                checked={filters.chamber.includes(chamber)}
                onChange={() => toggleArrayFilter("chamber", chamber)}
              />
            ))}
          </FilterGroup>

          <div className="p-4">
            <label
              htmlFor="bills-date-range"
              className="type-label block text-text-secondary"
            >
              Introduced
            </label>
            <select
              id="bills-date-range"
              value={filters.dateRange}
              onChange={(e) => updateFilter("dateRange", e.target.value)}
              className="mt-3 h-11 w-full cursor-pointer appearance-none border border-border-light bg-linen-50 px-3 type-mono-sm text-dark outline-none focus-visible:border-dark"
            >
              <option value="all">All time</option>
              <option value="last-month">Last month</option>
              <option value="last-3-months">Last 3 months</option>
              <option value="last-6-months">Last 6 months</option>
              <option value="last-year">Last year</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
