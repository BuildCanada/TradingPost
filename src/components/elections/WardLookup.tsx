"use client";

import { useState, type ReactNode } from "react";
import type { WardView } from "@/lib/elections/election-data";
import type { WardLookupResponse } from "@/lib/elections/ward-lookup";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; result: WardLookupResponse }
  | { status: "failed" };

/**
 * Postal code → ward lookup for the wards section. The result is a best guess
 * — postal centroids sit off-line near ward boundaries — so it reads as "looks
 * like Ward 19", always offers the full ward list beside it, and never
 * navigates on its own. See docs/WARD_LOOKUP_API_SPEC.md.
 *
 * `cards` holds this region's ward tiles pre-rendered on the server, keyed by
 * ward number, because the tile's locator map is server-rendered geometry that
 * can't be built here.
 */
export default function WardLookup({
  wards,
  cards,
  cityLabel,
}: {
  wards: WardView[];
  cards: Record<number, ReactNode>;
  /** e.g. "Toronto" — names the city in the out-of-boundary message */
  cityLabel: string;
}) {
  const [postalCode, setPostalCode] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const typed = postalCode.trim();
    if (!typed) return;

    setState({ status: "loading" });
    try {
      // Sent exactly as typed — the API tolerates any spacing and casing, and
      // tells malformed input apart from an unrecognized code.
      const res = await fetch(
        `/api/elections/ward-lookup?postal_code=${encodeURIComponent(typed)}`,
      );
      if (!res.ok) throw new Error(`ward-lookup ${res.status}`);
      setState({ status: "done", result: await res.json() });
    } catch (error) {
      console.error("[ward-lookup]", error);
      setState({ status: "failed" });
    }
  };

  return (
    <div className="max-w-[46ch]">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="ward-postal-code" className="type-label text-accent">
            Enter your postal code
          </label>
          <input
            id="ward-postal-code"
            name="postal_code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            autoComplete="postal-code"
            placeholder="M4C 1S9"
            aria-describedby="ward-lookup-result"
            className="w-[13ch] border border-dark bg-bg px-4 py-3 font-sans text-[1.05rem] tracking-[0.02em] uppercase placeholder:text-text-muted placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <button
          type="submit"
          disabled={!postalCode.trim() || state.status === "loading"}
          className="type-button text-bg bg-dark px-5 py-3.5 transition-colors hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {state.status === "loading" ? "Checking…" : "Find my ward"}
        </button>
      </form>

      <div
        id="ward-lookup-result"
        aria-live="polite"
        className="mt-4 empty:mt-0"
      >
        {state.status === "done" && (
          <Result
            result={state.result}
            wards={wards}
            cards={cards}
            cityLabel={cityLabel}
          />
        )}
        {state.status === "failed" && <Unavailable />}
      </div>
    </div>
  );
}

function Result({
  result,
  wards,
  cards,
  cityLabel,
}: {
  result: WardLookupResponse;
  wards: WardView[];
  cards: Record<number, ReactNode>;
  cityLabel: string;
}) {
  switch (result.reason) {
    case "resolved": {
      // ward_number is never null for numbered municipal wards, but the type
      // allows null for named ones — without it there is nothing to match.
      const number = result.ward?.ward_number;
      // Matched against our own roster so the card shows the live candidate
      // count and the same ward name as the grid below it.
      const ward = number ? wards.find((w) => w.number === number) : undefined;
      const card = number ? cards[number] : undefined;
      if (!ward || !card) return <Unavailable />;
      return (
        <div>
          <p className="font-serif text-[1.05rem] leading-[1.45] mb-3">
            Looks like you&rsquo;re in{" "}
            <span className="text-accent">Ward {number}</span>.
          </p>
          {card}
          <a
            href="#wards"
            className="mt-3 inline-block type-label-sm text-text-secondary hover:underline"
          >
            Not right? Browse all {wards.length} wards
          </a>
        </div>
      );
    }
    case "malformed_postal_code":
      return <FieldError>That doesn&rsquo;t look like a postal code.</FieldError>;
    case "unknown_postal_code":
      return (
        <FieldError>
          We don&rsquo;t recognize that postal code. Double-check it?
        </FieldError>
      );
    case "outside_boundary":
      return (
        <p className="font-serif text-[1.05rem] leading-[1.45] text-dark/80">
          That postal code looks like it&rsquo;s outside {cityLabel} — so there
          won&rsquo;t be a {cityLabel} ward for it.
        </p>
      );
    // boundary_data_unavailable, plus any reason added later.
    default:
      return <Unavailable />;
  }
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-serif text-[1.05rem] leading-[1.45] text-accent">
      {children}
    </p>
  );
}

function Unavailable() {
  return (
    <p className="font-serif text-[1.05rem] leading-[1.45] text-dark/80">
      We can&rsquo;t look that up right now. Try again shortly, or find your ward
      in the list below.
    </p>
  );
}
