// Toronto 2026 election — York Factory API access.
//
// The shared client lives in @/lib/api/elections; this module pins it to the
// toronto-2026 slug. Callers fall back to the hand-maintained data in
// ./candidates when the API is unreachable.

import { fetchElection } from "@/lib/api/elections";

export type {
  ApiSocialLink,
  ApiCandidate,
  ApiRace,
  ApiElection,
} from "@/lib/api/elections";

const ELECTION_SLUG = "toronto-2026";

/**
 * The toronto-2026 election with all races and candidates, or null when the
 * API is unreachable.
 */
export function fetchToronto2026() {
  return fetchElection(ELECTION_SLUG);
}
