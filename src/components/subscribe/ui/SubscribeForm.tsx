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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [postalCode, setPostalCode] = useState("");
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

    const postalRegex = /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/;
    if (!postalRegex.test(postalCode)) {
      setError("Please enter a valid Canadian postal code (e.g. A1A 1A1)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: lastName,
          postal_code: postalCode,
          source,
        }),
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

  const inputClass =
    "border border-charcoal-300 bg-white px-3 py-2.5 type-body placeholder:text-charcoal-400 outline-none focus:border-charcoal-1000 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First name"
        required
        className={inputClass}
      />
      <input
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Last name"
        required
        className={inputClass}
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className={inputClass}
      />
      <input
        type="text"
        value={postalCode}
        onChange={(e) => setPostalCode(e.target.value)}
        placeholder="Postal code (e.g. A1A 1A1)"
        required
        maxLength={7}
        className={inputClass}
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
