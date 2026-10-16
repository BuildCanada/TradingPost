"use client";

import posthog from "posthog-js";
import { FormstackForm } from "./FormstackForm";
import { PARTNER_SOURCE, STEP_1 } from "./build-the-vote";

const { fields } = STEP_1;

/**
 * Step 1 of the sign-up. Formstack sends the volunteer to CJPAC; we also
 * identify them in PostHog and, through /api/volunteer, in Customer.io.
 *
 * Formstack may leave the page as soon as its submit handler runs, so the
 * Customer.io call goes as a keepalive request that outlives the navigation,
 * and nothing waits on it. Phone stays with CJPAC: the consent line covers
 * Build Canada email, not calls from us.
 */
export function VolunteerSignupForm() {
  const handleSubmit = (values: FormData) => {
    const value = (name: string) => {
      const v = values.get(`field${name}`);
      return typeof v === "string" ? v.trim() : "";
    };
    const email = value(fields.email);
    if (!email) return;

    posthog.identify(email, { email });

    fetch("/api/volunteer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        email,
        first_name: value(`${fields.name}-first`),
        last_name: value(`${fields.name}-last`),
        city: value(`${fields.address}-city`),
        postal_code: value(`${fields.address}-zip`),
      }),
    }).catch(() => {
      // Best-effort: CJPAC still has the sign-up.
    });
  };

  return (
    <FormstackForm
      slug={STEP_1.slug}
      fill={{ [fields.utmSource]: PARTNER_SOURCE }}
      check={[fields.emailOptIn]}
      hide={[fields.utmSource, fields.emailOptIn, fields.consent]}
      onSubmit={handleSubmit}
    />
  );
}
