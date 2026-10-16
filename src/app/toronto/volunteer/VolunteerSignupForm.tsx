"use client";

import { useRef } from "react";
import posthog from "posthog-js";
import { FormstackForm } from "./FormstackForm";
import { PARTNER_SOURCE, STEP_1, STEP_2_PATH } from "./build-the-vote";

const { fields } = STEP_1;

/**
 * Step 1 of the sign-up. Formstack sends the volunteer to CJPAC; we also
 * identify them in PostHog and, through /api/volunteer, in Customer.io.
 *
 * Formstack may leave the page as soon as its submit handler runs, so the
 * Customer.io call goes as a keepalive request that outlives the navigation,
 * and nothing waits on it. Phone stays with CJPAC: the consent line covers
 * Build Canada email, not calls from us.
 *
 * Once Formstack has the submission we send the volunteer to our own step 2
 * ourselves, rather than following the redirect set in CJPAC's Formstack. The
 * email rides along in the URL as that redirect's would; the proxy moves it
 * into a cookie before the page renders (see src/proxy.ts).
 */
export function VolunteerSignupForm() {
  const emailRef = useRef("");

  const handleSubmit = (values: FormData) => {
    const value = (name: string) => {
      const v = values.get(`field${name}`);
      return typeof v === "string" ? v.trim() : "";
    };
    const email = value(fields.email);
    if (!email) return;
    emailRef.current = email;

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
      onSubmitted={() => {
        const email = emailRef.current;
        window.location.assign(
          email
            ? `${STEP_2_PATH}/?email=${encodeURIComponent(email)}`
            : `${STEP_2_PATH}/`,
        );
      }}
    />
  );
}
