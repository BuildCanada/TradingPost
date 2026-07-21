"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const BallotScene = dynamic(() => import("./BallotScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <span className="type-label text-text-secondary">
        Printing your ballot…
      </span>
    </div>
  ),
});

type PledgeStatus = "idle" | "submitting" | "pledged" | "error";

export default function PledgeClient({
  initialName,
  region,
}: {
  initialName: string;
  /** e.g. "ward-5" from a ward-scoped pledge link; defaults to city-wide */
  region?: string;
}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<PledgeStatus>("idle");
  const [error, setError] = useState("");

  async function submitPledge(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting" || status === "pledged") return;
    setStatus("submitting");
    setError("");

    try {
      const res = await fetch("/api/elections/pledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, region }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong");
      }
      setStatus("pledged");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="theme-election bg-bg text-dark">
      <div className="relative h-[calc(100dvh-20px)] min-h-[480px] border-2 border-dark bg-[#efe4da] overflow-clip">
        {/* ── The ballot, full bleed ─────────────────────────── */}
        <div className="absolute inset-0">
          <BallotScene name={name} />
        </div>

        {/* ── Overlaid header ────────────────────────────────── */}
        <div className="pointer-events-none absolute top-0 inset-x-0 flex flex-wrap items-start justify-between gap-x-8 gap-y-5 p-6 md:p-10">
          <div>
            <p className="type-label text-accent mb-4">
              Municipal Election · City of Toronto
            </p>
            <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(2.25rem,4.5vw,3.75rem)] max-w-[14ch] text-balance">
              {status === "pledged"
                ? "You’re on the record."
                : "Put it in writing."}
            </h1>
          </div>

          {/* ── Pledge form ──────────────────────────────────── */}
          <form
            onSubmit={submitPledge}
            className="pointer-events-auto flex flex-col gap-4 max-w-[24rem]"
          >
            <div>
              <label
                htmlFor="pledge-name"
                className="type-label-sm text-text-secondary block mb-2"
              >
                Name on ballot
              </label>
              <input
                id="pledge-name"
                type="text"
                value={name}
                maxLength={40}
                onChange={(e) => setName(e.target.value)}
                placeholder="A Toronto Voter"
                className="font-serif text-[1.25rem] bg-transparent border-0 border-b-2 border-dark px-0 py-1 w-[18ch] focus:outline-none focus:border-accent placeholder:text-text-muted"
              />
            </div>
            {status !== "pledged" ? (
              <>
                <div>
                  <label
                    htmlFor="pledge-email"
                    className="type-label-sm text-text-secondary block mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="pledge-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="font-serif text-[1.25rem] bg-transparent border-0 border-b-2 border-dark px-0 py-1 w-[18ch] focus:outline-none focus:border-accent placeholder:text-text-muted"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="group/btn self-start inline-flex items-center gap-3 type-button text-bg bg-accent px-6 py-3.5 transition-colors hover:bg-auburn-700 disabled:opacity-60"
                >
                  {status === "submitting" ? "Recording…" : "Pledge to vote"}
                  <ArrowRight className="size-4 shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
                </button>
                {status === "error" && (
                  <p className="type-label-sm text-accent">{error}</p>
                )}
              </>
            ) : (
              <p className="inline-flex items-center gap-2 self-start type-label-sm text-accent border border-accent px-3 py-1.5">
                <Check className="size-3.5" />
                Pledge recorded — see you October 26
              </p>
            )}
          </form>
        </div>

        {/* ── Overlaid footer ────────────────────────────────── */}
        <div className="pointer-events-none absolute bottom-0 inset-x-0 flex flex-wrap items-center justify-between gap-4 p-6 md:px-10 md:py-8">
          <Link
            href="/toronto/elections/2026"
            className="pointer-events-auto group/btn inline-flex items-center gap-2 type-button text-dark hover:text-accent"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover/btn:-translate-x-0.5" />
            Back to the election tracker
          </Link>
          <p className="type-label-sm text-text-secondary">
            Drag the ballot around · Polls open 10:00 a.m. – 8:00 p.m.
          </p>
        </div>
      </div>
    </div>
  );
}
