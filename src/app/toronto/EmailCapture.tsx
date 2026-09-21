"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useSubscribeStore } from "@/components/subscribe/store";

/**
 * Inline email capture, used by the Toronto hero and the closing digest CTA.
 * The address is only collected here — the button hands it to the subscribe
 * modal, which still gathers the name and postal code the API requires and
 * does the actual submitting.
 *
 * `tone` matches the surface it sits on — the input border and the button both
 * have to invert, or one of them disappears into the panel.
 */
export function EmailCapture({
  /** Must be unique per instance — the page renders this more than once. */
  id,
  source,
  className = "",
  buttonLabel = "Get Updates",
  tone = "dark",
}: {
  id: string;
  source: "inline" | "footer";
  className?: string;
  buttonLabel?: string;
  tone?: "dark" | "light";
}) {
  const [email, setEmail] = useState("");
  const openModal = useSubscribeStore((s) => s.openModal);

  const onDark = tone === "dark";
  const inputTone = onDark
    ? "border-linen-100/40 focus:border-white"
    : "border-charcoal-300 focus:border-charcoal-1000";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    openModal(source, email.trim() || undefined);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col sm:flex-row sm:items-stretch gap-3 ${className}`}
    >
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      {/* Deliberately not `required`: an empty submit still opens the modal,
          so the button never dead-ends someone who just wants to sign up. */}
      <input
        id={id}
        type="email"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className={`flex-1 min-w-0 border bg-white/95 px-4 py-3 type-body-sm text-left text-charcoal-1000 placeholder:text-charcoal-400 outline-none focus:bg-white transition-colors ${inputTone}`}
      />
      <Button
        as="button"
        type="submit"
        variant={onDark ? "linen" : "charcoal"}
        className="shrink-0 justify-center"
      >
        {buttonLabel}
      </Button>
    </form>
  );
}
