// Postal code → ward lookup — shared types.
//
// Mirrors york_factory's GET /api/v1/geo/ward_lookup. See
// docs/WARD_LOOKUP_API_SPEC.md. The lookup is a best guess, not a fact: a
// postal code's stored point is the centroid of its delivery points, so a code
// straddling a ward line can resolve to the neighbouring ward. Present results
// as provisional and never auto-navigate on them.

export type WardLookupReason =
  | "resolved"
  | "malformed_postal_code"
  | "unknown_postal_code"
  | "outside_boundary"
  | "boundary_data_unavailable";

export type Ward = {
  /** internal id, "<csd_uid>-<ward>" — do not parse or route on it */
  geo_uid: string;
  /** the integer to route on; null only for named (school board) wards */
  ward_number: number | null;
  name_en: string;
  name_fr: string | null;
  boundary_type: "ward" | "school_board_ward";
  /** warehouse load tag, not the ward model's vintage — never display */
  census_year: number;
};

export type WardLookupResponse = {
  /** normalized to "M4C 1S9"; null when the input was malformed */
  postal_code: string | null;
  /** Canada Post's city label, uppercase — display only, never a jurisdiction */
  city: string | null;
  found: boolean;
  reason: WardLookupReason;
  /** true where we could not judge, as opposed to judging them outside */
  unverified: boolean;
  ward: Ward | null;
};
