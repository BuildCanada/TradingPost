// Build the Vote: the Election Day volunteer drive we run with CJPAC.
//
// The two sign-up forms live in CJPAC's Formstack account, not ours. CJPAC
// owns the forms' fields and their submit redirects (step 1 → STEP_2_PATH with
// the volunteer's email, step 2 → THANKS_PATH), and receives every lead. What
// we own is the page around each form, so every Formstack ID this site depends
// on is collected here: if CJPAC rebuilds a form, this is the file to update.

export const VOLUNTEER_PATH = "/toronto/volunteer";
export const STEP_2_PATH = `${VOLUNTEER_PATH}/step-2`;
export const THANKS_PATH = `${VOLUNTEER_PATH}/thanks`;

/** Written into each form's "UTM Source" field so CJPAC can tell our sign-ups
 *  from those of their other partners. Not the visitor's own utm_source: that
 *  stays on the URL for our analytics and lands in the form's hidden
 *  "Campaign Source" field on its own. */
export const PARTNER_SOURCE = "buildcanada";

export const STEP_1 = {
  slug: "buildthevote_step1",
  fields: {
    /** Split by Formstack into `-first` and `-last` inputs. */
    name: "199478140",
    email: "199478141",
    /** Asks only for city and postal code: `-city` and `-zip` inputs. */
    address: "199478143",
    /** Visible in the form as built, so we fill it with PARTNER_SOURCE and
     *  hide it. */
    utmSource: "199478149",
    /** The opt-in checkbox for Build Canada email. Replaced by the consent
     *  line under the form, which makes submitting the form the opt-in. */
    emailOptIn: "199478245",
    /** CJPAC's own consent copy. Ours (CONSENT below) includes it and adds
     *  Build Canada email, so theirs is hidden rather than shown twice. */
    consent: "199478150",
  },
} as const;

export const STEP_2 = {
  slug: "buildthevote_step2",
  fields: {
    /** Hidden in the form. Carries the email from step 1 so CJPAC can join
     *  the two submissions. */
    email: "199478152",
  },
} as const;

/** Sent with each step 1 sign-up we copy into our own subscriber list (and
 *  from there to Customer.io), so these subscribers can be told apart. */
export const SUBSCRIBER_PLACEMENT = "build_the_vote";

/** Query parameters the step 1 redirect may carry the volunteer's email in.
 *  The proxy strips both before the page renders (see src/proxy.ts). */
export const EMAIL_PARAMS = ["email", `field${STEP_2.fields.email}`] as const;

/** Holds the email across the proxy's redirect to the clean step-2 URL. */
export const EMAIL_COOKIE = "btv_email";

export const CONSENT =
  "By submitting this form, you consent to being contacted by a CJPAC staff member or volunteer and to receive Build Canada emails.";

export const CJPAC_URL = "https://www.cjpac.ca";

/** Election Day training, Toronto time. The Zoom link itself goes out in the
 *  confirmation email, never on a public page. */
export const TRAINING_DATES = "October 19, 20, 21, 22 and 25";
