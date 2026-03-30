"use client";

import { useState, type FormEvent } from "react";
import { useSubscribeStore } from "../store";

interface SubscribeFormProps {
  source: "inline" | "navbar" | "exit-intent";
  onSuccess?: () => void;
}

export function SubscribeForm({ source, onSuccess }: SubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSubscribed = useSubscribeStore((s) => s.setSubscribed);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      setSubscribed();
      onSuccess?.();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="border border-[var(--color-border-light)] bg-white px-3 py-2.5 type-body placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-dark)] transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-[var(--color-dark)] text-[var(--color-bg)] type-label px-5 py-3 hover:bg-[var(--color-accent)] transition-colors self-start disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Subscribing..." : "Subscribe"}
      </button>
      {error && (
        <p className="type-label-sm text-[var(--color-accent)]">{error}</p>
      )}
    </form>
  );
}
