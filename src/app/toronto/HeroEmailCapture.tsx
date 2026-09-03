"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useSubscribeStore } from "@/components/subscribe/store";

/**
 * Inline email capture for the Toronto hero. The address is only collected
 * here — "Get Updates" hands it to the subscribe modal, which still gathers
 * the name and postal code the API requires and does the actual submitting.
 */
export function HeroEmailCapture() {
  const [email, setEmail] = useState("");
  const openModal = useSubscribeStore((s) => s.openModal);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    openModal("inline", email.trim() || undefined);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 flex flex-col sm:flex-row sm:items-stretch gap-3 max-w-[520px] mx-auto"
    >
      <label htmlFor="hero-email" className="sr-only">
        Email address
      </label>
      {/* Deliberately not `required`: an empty submit still opens the modal,
          so the button never dead-ends someone who just wants to sign up. */}
      <input
        id="hero-email"
        type="email"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="flex-1 min-w-0 border border-linen-100/40 bg-white/95 px-4 py-3 type-body-sm text-left text-charcoal-1000 placeholder:text-charcoal-400 outline-none focus:border-white focus:bg-white transition-colors"
      />
      <Button as="button" type="submit" variant="linen" className="shrink-0 justify-center">
        Get Updates
      </Button>
    </form>
  );
}
