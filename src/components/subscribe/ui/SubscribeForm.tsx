"use client";

import { useEffect, useState, type FormEvent } from "react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { hubspotPageContext } from "@/lib/hubspot-context";
import { useSubscribeStore } from "../store";

interface SubscribeFormProps {
  source: "inline" | "navbar" | "exit-intent" | "footer";
  /* Pre-filled when another surface already collected the address. */
  initialEmail?: string;
  onSuccess?: () => void;
}

export function SubscribeForm({
  source,
  initialEmail,
  onSuccess,
}: SubscribeFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [postalCode, setPostalCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSubscribed = useSubscribeStore((s) => s.setSubscribed);

  // The modal unmounts between openings, so the initial state above usually
  // suffices; this covers the case where it stays mounted and the prefill
  // arrives after the first render. Never clears what the user has typed.
  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

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
          ...hubspotPageContext(),
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
    // id/name attributes double as autofill hints and give HubSpot's
    // collected-forms feature (if enabled) a sane form name and field →
    // contact-property mapping instead of CSS-class guesses
    <form
      id="newsletter-subscribe"
      name="newsletter-subscribe"
      onSubmit={handleSubmit}
      className="flex flex-col gap-3"
    >
      <input
        type="text"
        name="firstname"
        autoComplete="given-name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First name"
        required
        className={inputClass}
      />
      <input
        type="text"
        name="lastname"
        autoComplete="family-name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Last name"
        required
        className={inputClass}
      />
      <input
        type="email"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className={inputClass}
      />
      <input
        type="text"
        name="zip"
        autoComplete="postal-code"
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
