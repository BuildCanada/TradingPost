"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { STEP_2_PATH } from "./build-the-vote";

export const labelClass = "type-label block mb-2";
export const inputClass =
  "w-full border border-charcoal-300 bg-white px-3 py-2.5 font-serif text-[1.05rem] outline-none focus:border-charcoal-1000 transition-colors";

/**
 * Step 1 of the sign-up. Posts to /api/volunteer, which writes the sign-up to
 * the Sheet CJPAC works from and identifies the volunteer to Customer.io, then
 * moves on to step 2. The visitor's utm_* tags ride along so CJPAC can see
 * which of our campaigns brought them.
 */
export function VolunteerSignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fields = Object.fromEntries(new FormData(e.currentTarget));
    const params = new URLSearchParams(window.location.search);

    setLoading(true);
    try {
      const res = await fetch("/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          utm_source: params.get("utm_source") ?? undefined,
          utm_medium: params.get("utm_medium") ?? undefined,
          utm_campaign: params.get("utm_campaign") ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      const email = String(fields.email).trim().toLowerCase();
      posthog.identify(email, { email });
      router.push(`${STEP_2_PATH}/`);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form
      id="volunteer-signup"
      name="volunteer-signup"
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
    >
      <fieldset>
        <legend className={labelClass}>Name</legend>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            name="first_name"
            autoComplete="given-name"
            placeholder="First name"
            aria-label="First name"
            required
            maxLength={50}
            className={inputClass}
          />
          <input
            type="text"
            name="last_name"
            autoComplete="family-name"
            placeholder="Last name"
            aria-label="Last name"
            required
            maxLength={50}
            className={inputClass}
          />
        </div>
      </fieldset>
      <label>
        <span className={labelClass}>Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          maxLength={254}
          className={inputClass}
        />
      </label>
      <label>
        <span className={labelClass}>Phone</span>
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          required
          maxLength={20}
          className={inputClass}
        />
      </label>
      <fieldset>
        <legend className={labelClass}>City and postal code</legend>
        <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3">
          <input
            type="text"
            name="city"
            autoComplete="address-level2"
            placeholder="City"
            aria-label="City"
            required
            maxLength={100}
            className={inputClass}
          />
          <input
            type="text"
            name="postal_code"
            autoComplete="postal-code"
            placeholder="Postal code"
            aria-label="Postal code"
            required
            maxLength={7}
            className={inputClass}
          />
        </div>
      </fieldset>
      {/* For bots only: hidden from people and screen readers. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <div>
        <Button
          as="button"
          type="submit"
          variant="auburn"
          disabled={loading}
          className="px-7 py-4.5"
        >
          {loading ? "Signing you up…" : "Sign up"}
        </Button>
        <p role="alert" className="type-label-sm text-auburn-800 mt-3 min-h-[1.3em]">
          {error}
        </p>
      </div>
    </form>
  );
}
