// Stand-in candidate questionnaire responses, for building the alignment view
// before the read endpoint exists.
//
// WHY THE NAMES ARE INVENTED
//   These three are fictional, and deliberately not anyone on the real roster
//   in candidates.ts. A candidate's answers are attributed public statements
//   about what they will do in office — putting made-up positions next to a
//   real registered candidate's name would be a fabricated quotation, and it
//   would survive a screenshot, a demo, or a stray deploy long enough to be
//   read as real. The shape is what this fixture is for; the names are not.
//
//   For the same reason the UI that renders these carries a visible sample-data
//   notice. Delete the notice only when the data behind it is real.
//
// WHAT IT MIRRORS
//   Shape matches York Factory's warehouse.election_candidate_survey_responses.
//   Question ids and option values are the live ones from the city-priorities
//   survey (version 1) rather than invented keys, so the comparison exercises
//   real joins: that table's `answers_match_the_survey` validation rejects an
//   answer keyed to a question the survey doesn't have.
//
//   Between them the three cover every verdict alignToCandidates can return —
//   agree, differ, unclear and unanswered:
//     Trent        complete, answers every policy question
//     Achebe       complete on the five direct questions, four left blank at
//                  the end, and one answer transcribed as prose
//     Raghunathan  a partial reply, which the CMS treats as normal
//
// REPLACING IT
//   Swap candidateResponsesForWard for a fetch of published responses joined to
//   the ward's roster. Everything downstream takes CandidateSurveyResponse[] and
//   does not care where the array came from.

import type { CandidateSurveyResponse } from "./alignment";

import { CITY_PRIORITIES_SLUG } from "./survey";

/**
 * The ward these fixtures claim to be standing in. Only meaningful in that the
 * records need a ward at all — candidateResponsesForWard ignores it, so the
 * view can be exercised from any postal code.
 */
export const FIXTURE_WARD = "09";

const SURVEY = {
  surveySlug: CITY_PRIORITIES_SLUG,
  surveyVersion: "1",
  ward: FIXTURE_WARD,
} as const;

export const CANDIDATE_RESPONSES_FIXTURE: CandidateSurveyResponse[] = [
  {
    ...SURVEY,
    candidateName: "Marisol Trent",
    source: "form",
    enteredBy: "fixture",
    answers: {
      housing_as_of_right: "yes",
      encampment_removal: "yes",
      road_pricing: "yes",
      infrastructure_revenue: "yes",
      capital_transparency: "yes",
      housing_intervention: "permission",
      housing_city_role: "regulator_enabler",
      housing_density_location: "citywide",
      transit_funding_priority: "service",
      street_space_priority: "passenger_capacity",
      av_regulation_priority: "safety",
      safety_investment: "crisis_prevention",
      police_budget: "constant",
      surveillance_tech: "permit_strict",
      housing_cost_reduction: "lower_charges",
      capital_project_delays: "project_delivery",
      service_delivery_model: "direct",
      property_tax_growth: "with_inflation",
      revenue_source: "broad_recurring",
      infrastructure_backlog: "dedicated_revenue",
      provincial_approach: "partnership",
      cycling_network: "accelerate",
      protest_access: "maintain_access",
      technology_investment: "resident_services",
      budget_gap_first: "reduce_admin",
      business_climate: "reduce_delay",
      business_attraction: "citywide_fundamentals",
      construction_capacity: "workforce_supply",
      public_realm_priority: "basic_maintenance",
      arts_culture_support: "regulatory_reform",
      av_conditions: "data_disclosure",
    },
    explanations: {
      housing_as_of_right:
        "As-of-right permission is the only lever the city holds that costs nothing and works everywhere at once. I would apply it in all 25 wards, mine included.",
      road_pricing:
        "Only with the revenue locked to transit operations by bylaw. A congestion charge that funds general revenue is just a tax on drivers.",
      police_budget:
        "Held flat in real terms, with the growth that would have gone to the service redirected to crisis response teams.",
    },
  },
  {
    ...SURVEY,
    candidateName: "Devon Achebe",
    source: "email",
    enteredBy: "fixture",
    answers: {
      // Transcribed as given rather than forced into yes/no — the case
      // alignToCandidates reports as `unclear` instead of inventing a position.
      housing_as_of_right: "Yes, but phased in over three years",
      encampment_removal: "no",
      road_pricing: "no",
      infrastructure_revenue: "yes",
      capital_transparency: "yes",
      housing_intervention: "public_delivery",
      housing_city_role: "direct_provider",
      housing_density_location: "corridors_transit",
      transit_funding_priority: "expansion",
      street_space_priority: "general_traffic",
      av_regulation_priority: "public_obligations",
      safety_investment: "enforcement",
      police_budget: "increase",
      surveillance_tech: "permit_broad",
      housing_cost_reduction: "faster_approvals",
      capital_project_delays: "political_changes",
      service_delivery_model: "agencies",
      property_tax_growth: "below_inflation",
      revenue_source: "user_road",
      infrastructure_backlog: "delay_expansion",
      provincial_approach: "advocacy",
      cycling_network: "review_reverse",
      protest_access: "predetermined_limits",
      technology_investment: "internal_operations",
      budget_gap_first: "reduce_services",
      business_climate: "lower_costs",
      business_attraction: "targeted_incentives",
      // construction_capacity, public_realm_priority, arts_culture_support and
      // av_conditions left blank — a reply that ran out of steam at the end.
    },
    explanations: {
      housing_as_of_right:
        "I support the principle. I do not support doing it in one bylaw with no servicing plan, which is how the last attempt failed.",
      road_pricing:
        "Not before the transit service exists to absorb the trips it displaces. Ask me again when the Line 2 replacement is running.",
    },
  },
  {
    ...SURVEY,
    candidateName: "Priya Raghunathan",
    source: "phone",
    enteredBy: "fixture",
    answers: {
      housing_as_of_right: "yes",
      encampment_removal: "no",
      road_pricing: "yes",
      infrastructure_revenue: "Undecided pending the 2027 capital plan",
      capital_transparency: "yes",
      housing_intervention: "cost_and_speed",
      housing_city_role: "partner_financier",
      housing_density_location: "designated_centres",
      transit_funding_priority: "maintenance",
      police_budget: "decrease",
      // Everything after this went unanswered — the questionnaire was taken
      // over the phone and did not get through the later topics.
    },
    explanations: {
      infrastructure_revenue:
        "I will not commit to a new revenue tool before seeing which of the deferred projects the capital plan actually keeps.",
      encampment_removal:
        "Not while the indoor space on offer is a shelter mat. The question assumes a standard of accommodation the city does not currently meet.",
    },
  },
];

/**
 * Published candidate responses for one ward.
 *
 * Returns the same three fixtures for every ward on purpose: the view is being
 * built against them, and keying them to a single ward would mean only one
 * postal code in Toronto could see it. The real version filters by ward and
 * returns [] for a ward whose candidates have not answered — which most wards
 * will be for most of the campaign, so callers must handle the empty case.
 */
export function candidateResponsesForWard(
  ward: string | null,
): CandidateSurveyResponse[] {
  if (!ward) return [];
  return CANDIDATE_RESPONSES_FIXTURE.map((response) => ({ ...response, ward }));
}
