"use client";

import { useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import type { WardView } from "@/lib/elections/election-data";
import type { WardLookupResponse } from "@/lib/elections/ward-lookup";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; result: WardLookupResponse }
  | { status: "failed" };

/**
 * Postal code → ward, for the wards section.
 *
 * THE CONTROL IS ONE OBJECT
 *   It was a labelled field and a detached button, each with its own border
 *   and its own height, sitting on a baseline they only roughly shared. Two
 *   boxes with a gap between them read as two controls, and the gap is where
 *   the roughness was. They are one bordered box now, split by a single rule:
 *   type on the left, act on the right, one outline around the pair that takes
 *   the focus ring for both.
 *
 * IT IS A GUESS, AND SAYS SO
 *   A postal code's stored point is the centroid of its delivery area, so a
 *   code sitting on a ward line resolves to the neighbour. It reads as "looks
 *   like Ward 19", never navigates on its own, and always offers the full list
 *   beside itself. See docs/WARD_LOOKUP_API_SPEC.md.
 *
 * `cards` holds this region's ward tiles pre-rendered on the server, keyed by
 * ward number, because the tile's locator map is server-rendered geometry that
 * cannot be built here.
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
  const busy = state.status === "loading";

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
    <div className="max-w-[30rem]">
      <form onSubmit={handleSubmit}>
        <label
          htmlFor="ward-postal-code"
          className="type-label-sm mb-2 block text-text-muted"
        >
          Find it by postal code
        </label>

        {/* The box is the control. The input and the button are flush inside
            it, divided by one rule, and `focus-within` moves the ring to the
            whole thing so tabbing into the field lights the object the reader
            sees rather than an inner edge of it. */}
        <div className="flex items-stretch border border-dark bg-bg transition-shadow focus-within:ring-1 focus-within:ring-accent focus-within:border-accent">
          <input
            id="ward-postal-code"
            name="postal_code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            autoComplete="postal-code"
            placeholder="M4C 1S9"
            aria-describedby="ward-lookup-result"
            className="min-w-0 flex-1 bg-transparent px-4 py-3 font-sans text-[1.05rem] uppercase tracking-[0.04em] text-dark placeholder:normal-case placeholder:tracking-normal placeholder:text-text-muted focus:outline-none"
          />
          <button
            type="submit"
            disabled={!postalCode.trim() || busy}
            className="type-label-sm flex-none cursor-pointer border-l border-dark bg-dark px-5 !tracking-[0.1em] text-bg transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-35"
          >
            {busy ? "Checking…" : "Find"}
          </button>
        </div>
      </form>

      <div id="ward-lookup-result" aria-live="polite" className="empty:hidden">
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
      // Matched against our own roster so the tile shows the live candidate
      // count and the same ward name as the grid below it.
      const ward = number ? wards.find((w) => w.number === number) : undefined;
      const card = number ? cards[number] : undefined;
      if (!ward || !card) return <Unavailable />;
      return (
        <div className="mt-5">
          <p className="type-label-sm mb-2.5 text-text-muted">
            Looks like <span className="text-accent">Ward {number}</span>
          </p>
          {card}
          <a
            href="#wards"
            className="type-label-sm mt-2.5 inline-flex items-center gap-1.5 text-text-secondary transition-colors hover:text-accent"
          >
            Not right? All {wards.length} wards
            <ArrowRight className="size-3 flex-none" />
          </a>
        </div>
      );
    }
    case "malformed_postal_code":
      return <Note accent>That doesn&rsquo;t look like a postal code.</Note>;
    case "unknown_postal_code":
      return (
        <Note accent>
          We don&rsquo;t recognize that one. Worth a second look?
        </Note>
      );
    case "outside_boundary":
      return (
        <Note>
          That code looks like it is outside {cityLabel}, so there is no{" "}
          {cityLabel} ward for it.
        </Note>
      );
    // boundary_data_unavailable, plus any reason added later.
    default:
      return <Unavailable />;
  }
}

/* One line under the field, at the field's own weight. These were set at the
   body serif's full size, which made "that isn't a postal code" the loudest
   sentence in the section — a validation message shouting over the heading it
   sits beneath. */
function Note({
  children,
  accent = false,
}: {
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <p
      className={`mt-2.5 font-serif text-[0.95rem] leading-[1.4] text-pretty ${
        accent ? "text-accent" : "text-text-secondary"
      }`}
    >
      {children}
    </p>
  );
}

function Unavailable() {
  return (
    <Note>
      We can&rsquo;t look that up right now — the ward list below still works.
    </Note>
  );
}
