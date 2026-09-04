"use client";

import { useState } from "react";
import Link from "next/link";
import type { WardLookupResponse } from "@/lib/elections/ward-lookup";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; result: WardLookupResponse }
  | { status: "failed" };

/**
 * Postal code → ward, for the landing page's card.
 *
 * The shared <WardLookup> is the richer version for the tracker: it needs the
 * live ward roster and a server-rendered locator tile per ward, and it links
 * to an #wards anchor. None of that exists here, so this one resolves to a
 * name and a link into the ward's own page.
 *
 * The result is a best guess, not a fact — a postal code's stored point is the
 * centroid of its delivery points, so a code straddling a ward line can land
 * in the neighbour. Hence "looks like", and no auto-navigation.
 * See docs/WARD_LOOKUP_API_SPEC.md.
 */
export function WardLookupCard() {
  const [postalCode, setPostalCode] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const typed = postalCode.trim();
    if (!typed) return;

    setState({ status: "loading" });
    try {
      // Sent exactly as typed: the API tolerates any spacing and casing, and
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

  const loading = state.status === "loading";

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="ward-lookup-postal" className="sr-only">
          Your postal code
        </label>
        <div className="flex gap-2 items-stretch">
          <input
            id="ward-lookup-postal"
            name="postal_code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            autoComplete="postal-code"
            placeholder="M4C 1S9"
            aria-describedby="ward-lookup-card-result"
            className="w-full min-w-0 max-w-[13ch] border border-charcoal-300 bg-white px-3 py-3 font-sans text-[1rem] tracking-[0.02em] uppercase placeholder:text-text-muted placeholder:normal-case outline-none focus:border-charcoal-1000 transition-colors"
          />
          <button
            type="submit"
            disabled={!postalCode.trim() || loading}
            className="flex-1 flex items-center justify-center gap-2 border border-dark bg-dark px-5 py-3 type-label !tracking-[0.12em] text-linen-100 transition-colors hover:bg-accent hover:border-accent disabled:bg-charcoal-300 disabled:border-charcoal-300 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Checking…" : "Find my ward"}
          </button>
        </div>
      </form>

      <div
        id="ward-lookup-card-result"
        aria-live="polite"
        className="mt-4 empty:mt-0"
      >
        {state.status === "done" && <Result result={state.result} />}
        {state.status === "failed" && (
          <Message>We can&rsquo;t look that up right now. Try again shortly.</Message>
        )}
      </div>
    </div>
  );
}

function Result({ result }: { result: WardLookupResponse }) {
  switch (result.reason) {
    case "resolved": {
      // ward_number is null only for named school-board wards; without it
      // there is no route to send anyone to.
      const number = result.ward?.ward_number;
      if (!number) {
        return <Message>We couldn&rsquo;t match that to a council ward.</Message>;
      }
      return (
        <div>
          <p className="font-serif text-[0.9375rem] leading-[1.45] text-dark/80">
            Looks like you&rsquo;re in{" "}
            <span className="text-accent">Ward {number}</span>
            {result.ward?.name_en ? `, ${result.ward.name_en}` : ""}.
          </p>
          <Link
            href={`/toronto/vote/2026/wards/${String(number).padStart(2, "0")}`}
            className="mt-2 inline-block type-label-sm text-accent hover:underline"
          >
            See who&rsquo;s running here
          </Link>
        </div>
      );
    }
    case "malformed_postal_code":
      return <Message>That doesn&rsquo;t look like a postal code.</Message>;
    case "unknown_postal_code":
      return (
        <Message>
          We don&rsquo;t recognize that postal code. Double-check it?
        </Message>
      );
    case "outside_boundary":
      return (
        <Message>
          That looks like it&rsquo;s outside Toronto, so there won&rsquo;t be a
          city ward for it.
        </Message>
      );
    // boundary_data_unavailable, plus any reason added later.
    default:
      return <Message>We can&rsquo;t look that up right now.</Message>;
  }
}

function Message({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-serif text-[0.9375rem] leading-[1.45] text-dark/80">
      {children}
    </p>
  );
}
