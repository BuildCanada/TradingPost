"use client";

import { useState, type FormEvent } from "react";
import posthog from "posthog-js";

// The State of the Nation design's email-only join form, posting to the same
// /api/subscribe endpoint as SubscribeForm (name and postal code are optional
// there).
export default function JoinForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "state-of-the-nation" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      posthog.identify(email, { email });
      posthog.capture("subscribed", { source: "state-of-the-nation" });
      setJoined(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-3 max-w-[560px]"
      >
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 min-w-[240px] bg-bg border-2 border-bg text-dark font-body text-[1.05rem] px-[18px] py-3.5 outline-none placeholder:text-[#8a8178]"
        />
        <button
          type="submit"
          disabled={loading || joined}
          className="type-label uppercase tracking-[0.08em] bg-auburn-800 text-bg border-2 border-auburn-800 px-7 py-3.5 cursor-pointer transition-colors hover:bg-auburn-900 hover:border-auburn-900 disabled:cursor-default"
        >
          {joined ? "You're in" : loading ? "Joining..." : "Join"}
        </button>
      </form>
      {error && (
        <p className="mt-3 type-label-sm text-[#c9877f]">{error}</p>
      )}
    </>
  );
}
