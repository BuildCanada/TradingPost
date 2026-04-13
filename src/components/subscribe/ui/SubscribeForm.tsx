"use client";

import { useState, type FormEvent } from "react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { useSubscribeStore } from "../store";

interface SubscribeFormProps {
  source: "inline" | "navbar" | "exit-intent" | "footer";
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
      posthog.identify(email, { email });
      posthog.capture("subscribed", { source });
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
        className="border border-charcoal-300 bg-white px-3 py-2.5 type-body placeholder:text-charcoal-400 outline-none focus:border-charcoal-1000 transition-colors"
      />
      <Button as="button" type="submit" disabled={loading} className="self-start">
        {loading ? "Subscribing..." : "Subscribe"}
      </Button>
      {error && (
        <p className="type-label-sm text-auburn-800">{error}</p>
      )}
    </form>
  );
}
