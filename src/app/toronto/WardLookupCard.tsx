"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WardLookupResponse } from "@/lib/elections/ward-lookup";

type State =
  | { status: "idle" }
  | { status: "loading" }
  /** Resolved: navigating to the ward's page. Held so the control keeps a
   *  busy label until the route paints. */
  | { status: "redirecting"; ward: number }
  /** Anything that isn't a clean hit — rendered inline. */
  | { status: "done"; result: WardLookupResponse }
  | { status: "failed" };

/**
 * Postal code → ward, for the landing page's card.
 *
 * The shared <WardLookup> is the richer version for the tracker: it needs the
 * live ward roster and a server-rendered locator tile per ward, and it links
 * to an #wards anchor. None of that exists here, so this one is just the
 * field and its outcome.
 *
 * A clean hit navigates straight to the ward's page; everything else is
 * reported in place.
 *
 * NOTE: docs/WARD_LOOKUP_API_SPEC.md asks callers not to auto-navigate,
 * because a postal code's stored point is the centroid of its delivery points
 * — a code straddling a ward line can resolve to the neighbour. Redirecting
 * is a deliberate product decision against that advice, so the ward page is
 * where someone has to notice a wrong guess.
 */
export function WardLookupCard() {
  const router = useRouter();
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
      const result: WardLookupResponse = await res.json();

      // ward_number is null for named school-board wards, which have no route
      // — those fall through to the inline messages below.
      const ward = result.reason === "resolved" ? result.ward?.ward_number : null;
      if (ward) {
        setState({ status: "redirecting", ward });
        router.push(`/toronto/vote/2026/wards/${String(ward).padStart(2, "0")}`);
        return;
      }

      setState({ status: "done", result });
    } catch (error) {
      console.error("[ward-lookup]", error);
      setState({ status: "failed" });
    }
  };

  const busy = state.status === "loading" || state.status === "redirecting";

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
            disabled={!postalCode.trim() || busy}
            className="flex-1 flex items-center justify-center gap-2 border border-dark bg-dark px-5 py-3 type-label !tracking-[0.12em] text-linen-100 transition-colors hover:bg-accent hover:border-accent disabled:bg-charcoal-300 disabled:border-charcoal-300 disabled:cursor-not-allowed cursor-pointer"
          >
            {state.status === "redirecting"
              ? `Ward ${state.ward}…`
              : state.status === "loading"
                ? "Checking…"
                : "Find my ward"}
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
    // Only reached when there is no council ward to route to — a named
    // school-board ward. A real hit has already navigated.
    case "resolved":
      return <Message>We couldn&rsquo;t match that to a council ward.</Message>;
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
