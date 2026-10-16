"use client";

import { FormstackForm } from "../FormstackForm";
import { STEP_2, THANKS_PATH } from "../build-the-vote";

/** Step 2's form. Like step 1, it goes to our own next page once Formstack
 *  has the answers, whatever redirect CJPAC has set. */
export function Step2Form({ email }: { email: string }) {
  return (
    <FormstackForm
      slug={STEP_2.slug}
      fill={{ [STEP_2.fields.email]: email }}
      onSubmitted={() => window.location.assign(`${THANKS_PATH}/`)}
    />
  );
}
