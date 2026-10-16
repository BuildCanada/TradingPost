// Build the Vote: the Election Day volunteer drive we run with CJPAC.
//
// Volunteers sign up in two steps on our own forms. /api/volunteer writes each
// sign-up to a Google Sheet shared with CJPAC (src/lib/google-sheet.ts), which
// is how CJPAC gets its leads, and identifies the volunteer to Customer.io.
// Step 2 adds optional details to the same row of the Sheet.

export const VOLUNTEER_PATH = "/toronto/volunteer";
export const STEP_2_PATH = `${VOLUNTEER_PATH}/step-2`;
export const THANKS_PATH = `${VOLUNTEER_PATH}/thanks`;

/** Written to every row's Partner column so CJPAC can tell our sign-ups from
 *  those of their other partners. Not the visitor's own utm_source, which goes
 *  in the Source column. */
export const PARTNER_SOURCE = "buildcanada";

/** The tab of CJPAC's Sheet that sign-ups are written to, and the header row
 *  it starts with if empty. Values are matched to columns by these names, so
 *  renaming one in the Sheet means renaming it here too. */
export const SHEET_TAB = "Sign-ups";
export const SHEET_COLUMNS = [
  "Signed up at",
  "First name",
  "Last name",
  "Email",
  "Phone",
  "City",
  "Postal code",
  "Availability",
  "Mayoral candidate",
  "Issues",
  "Details added at",
  "Source",
  "Medium",
  "Campaign",
  "Partner",
] as const;

/** Set by step 1's API response so step 2 can add to the right row without
 *  the email ever appearing in a URL or in the page. httpOnly, and scoped to
 *  the API path step 2 posts to. */
export const EMAIL_COOKIE = "btv_email";
export const DETAILS_API_PATH = "/api/volunteer/details";

/** Step 2's questions, worded as CJPAC wrote them for their Formstack form.
 *  The API accepts only these options. */
export const AVAILABILITY_OPTIONS = [
  "All day",
  "Morning",
  "Afternoon",
  "Evening",
] as const;

export const MAYORAL_OPTIONS = [
  "Brad Bradford",
  "Olivia Chow",
  "Other / Not sure",
  "Prefer not to say",
] as const;

export const CONSENT =
  "By submitting this form, you consent to being contacted by a CJPAC staff member or volunteer and to receive Build Canada emails.";

export const CJPAC_URL = "https://www.cjpac.ca";

/** Election Day training, Toronto time. The Zoom link itself goes out in the
 *  confirmation email, never on a public page. */
export const TRAINING_DATES = "October 19, 20, 21, 22 and 25";
