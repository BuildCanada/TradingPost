"use client";

import posthog from "posthog-js";
import { hubspotPageContext } from "@/lib/hubspot-context";
import { FormstackForm } from "./FormstackForm";
import { PARTNER_SOURCE, STEP_1, SUBSCRIBER_PLACEMENT } from "./build-the-vote";

const { fields } = STEP_1;

/**
 * Step 1 of the sign-up. Formstack sends the volunteer to CJPAC; we copy them
 * into our own subscriber list too, which is how they reach Customer.io
 * (York Factory identifies every new subscriber there). The consent line
 * under the form covers Build Canada email, so a sign-up is a subscribe.
 *
 * Formstack may leave the page as soon as its submit handler runs, so the copy
 * goes as a keepalive request that outlives the navigation, and nothing waits
 * on it. Phone stays with CJPAC: our subscriber list has nowhere to put it.
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

    fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        email,
        first_name: value(`${fields.name}-first`),
        last_name: value(`${fields.name}-last`),
        postal_code: value(`${fields.address}-zip`),
        source: SUBSCRIBER_PLACEMENT,
        ...hubspotPageContext(),
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
