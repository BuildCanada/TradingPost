// Toronto 2026 resident survey — content and structure.
//
// This file is the whole survey. To change a question, reword a label, add an
// option, reorder a step, or add/remove a step entirely, edit here — the
// renderer (./SurveyClient) is generic and derives everything (step count,
// progress, validation, the submitted payload) from SURVEY_STEPS. No component
// changes are needed to modify the survey.
//
// Answer ids become the keys of the submitted payload, so treat them as stable
// once responses are being collected.

import { WARD_SHAPES } from "../wardGeo";

export type SurveyOption = {
  /** stored value — stable; the label can be reworded freely */
  value: string;
  label: string;
};

type BaseQuestion = {
  /** payload key — stable once live */
  id: string;
  label: string;
  /** Required questions block advancing past their step. */
  required?: boolean;
  /** Shown under the label, for context or a caveat. */
  help?: string;
};

export type SurveyQuestion = BaseQuestion &
  (
    | { type: "text"; placeholder?: string }
    | { type: "email"; placeholder?: string }
    | { type: "textarea"; placeholder?: string; rows?: number }
    | { type: "select"; placeholder?: string; options: SurveyOption[] }
    | { type: "radio"; options: SurveyOption[] }
    /** Compact two-up Yes / No pair. */
    | { type: "yesno" }
  );

export type SurveyStep = {
  /** short step id, used for analytics and anchors */
  id: string;
  title: string;
  /** Optional sentence under the step heading. */
  intro?: string;
  questions: SurveyQuestion[];
};

export const YES_NO: SurveyOption[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

/** The 25 council wards, straight from the ward-boundary data so this list
 *  never drifts from the map and the ward pages. */
const WARD_OPTIONS: SurveyOption[] = [
  ...WARD_SHAPES.map((w) => ({
    value: `ward-${Number(w.n)}`,
    label: `${Number(w.n)} — ${w.name}`,
  })),
  { value: "unsure", label: "I'm not sure" },
];

/** Identifies this survey's responses. An election can hold more than one
 *  survey, so this is what keeps them apart — don't reuse it. */
export const SURVEY_SLUG = "neighbourhood-priorities";

/** Stamped on every response so answers stay interpretable after the questions
 *  change. Bump it whenever a question's meaning, options, or id change —
 *  rewording for clarity doesn't need a bump. */
export const SURVEY_VERSION = "1";

export const SURVEY_META = {
  eyebrow: "Municipal election 2026",
  kicker: "City of Toronto · resident survey",
  title: "Neighbourhood priorities survey",
  intro:
    "Six short steps. Your answers shape what we push candidates on before Toronto votes on October 26.",
  submitLabel: "Submit survey",
  thankYou: {
    title: "Thank you. Your answers are in.",
    body: "We read every response. Results will be published ward by ward before the campaign period opens.",
    restartLabel: "Start again",
  },
} as const;

export const SURVEY_STEPS: SurveyStep[] = [
  {
    id: "about-you",
    title: "About you",
    questions: [
      {
        id: "postal_code",
        type: "text",
        label: "Postal code",
        placeholder: "M5V 2T6",
        required: true,
      },
      {
        id: "ward",
        type: "select",
        label: "Which ward do you live in?",
        placeholder: "Select your ward",
        options: WARD_OPTIONS,
        required: true,
      },
      {
        id: "tenure",
        type: "radio",
        label: "How long have you lived here?",
        required: true,
        options: [
          { value: "lt2", label: "Less than two years" },
          { value: "2to10", label: "Two to ten years" },
          { value: "10plus", label: "More than ten years" },
          { value: "life", label: "My whole life" },
        ],
      },
    ],
  },
  {
    id: "top-concern",
    title: "Your top concern",
    questions: [
      {
        id: "concern",
        type: "radio",
        label: "Which issue matters most to you right now?",
        required: true,
        options: [
          { value: "housing", label: "Housing costs and supply" },
          { value: "transit", label: "Transit, roads and traffic" },
          { value: "safety", label: "Community safety" },
          { value: "taxes", label: "Property taxes and city spending" },
          {
            value: "services",
            label: "Day-to-day services: snow, garbage, water",
          },
          { value: "parks", label: "Parks, libraries and recreation" },
        ],
      },
      {
        id: "concern_note",
        type: "text",
        label: "In a sentence, why?",
        placeholder: "The bus on my street never comes on time.",
      },
    ],
  },
  {
    id: "housing",
    title: "Housing",
    questions: [
      {
        id: "housing_pace",
        type: "radio",
        label: "Homes are being built in your ward at a pace that is:",
        required: true,
        options: [
          { value: "slow", label: "Too slow" },
          { value: "right", label: "About right" },
          { value: "fast", label: "Too fast" },
        ],
      },
      {
        id: "fourplex",
        type: "yesno",
        label: "Would you support fourplexes on residential streets?",
        required: true,
      },
      {
        id: "dev_charges",
        type: "yesno",
        label: "Should the city cut development charges on small buildings?",
      },
    ],
  },
  {
    id: "getting-around",
    title: "Getting around",
    questions: [
      {
        id: "commute",
        type: "select",
        label: "How do you usually get to work or school?",
        placeholder: "Select one",
        required: true,
        options: [
          { value: "car", label: "Drive" },
          { value: "transit", label: "Transit" },
          { value: "bike", label: "Bicycle" },
          { value: "walk", label: "Walk" },
          { value: "mixed", label: "A mix" },
          { value: "home", label: "I work from home" },
        ],
      },
      {
        id: "transport_priority",
        type: "radio",
        label: "Where should the next transportation dollar go?",
        required: true,
        options: [
          { value: "buses", label: "More frequent buses and streetcars" },
          { value: "roads", label: "Repaving and road repair" },
          {
            value: "crossings",
            label: "Safer crossings, sidewalks and bike lanes",
          },
          { value: "fares", label: "Lower fares" },
        ],
      },
      {
        id: "paid_parking",
        type: "yesno",
        label: "Would you accept paid street parking if it funded transit?",
      },
    ],
  },
  {
    id: "services-taxes",
    title: "Services and taxes",
    questions: [
      {
        id: "tax_tradeoff",
        type: "radio",
        label: "Which trade-off comes closest to your view?",
        required: true,
        options: [
          { value: "cut", label: "Cut taxes, accept fewer services" },
          { value: "hold", label: "Hold both roughly where they are" },
          { value: "raise", label: "Raise taxes to expand services" },
          {
            value: "efficiency",
            label: "Keep taxes flat and find savings inside city hall",
          },
        ],
      },
      {
        id: "tax_value",
        type: "yesno",
        label: "Do you feel you get fair value for your property taxes?",
        required: true,
      },
      {
        id: "other_issue",
        type: "text",
        label: "Anything we haven't asked about?",
        placeholder: "One thing the city should fix on your street",
      },
    ],
  },
  {
    id: "stay-in-touch",
    title: "Stay in touch",
    questions: [
      {
        id: "name",
        type: "text",
        label: "Name",
        placeholder: "First and last name",
      },
      {
        id: "email",
        type: "email",
        label: "Email",
        placeholder: "you@example.com",
        required: true,
        help: "We'll send you the results for your ward. Nothing else.",
      },
      {
        id: "volunteer",
        type: "yesno",
        label: "Would you like to help get out the vote in your ward?",
      },
      {
        id: "updates",
        type: "yesno",
        label: "Send me monthly Toronto updates",
      },
    ],
  },
];

export const SURVEY_STEP_COUNT = SURVEY_STEPS.length;
