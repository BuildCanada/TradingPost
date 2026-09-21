import type { Event, Place, Organization } from "schema-dts";

/**
 * An `Event` node for one voting period.
 *
 * Voting periods are genuinely events with a start, an end and a physical
 * location, which is what lets a search engine surface "advance voting, Oct
 * 6–11" as a dated thing rather than a sentence on a page. The instants passed
 * in must carry their UTC offset (see key-dates.ts) — a bare "2026-10-06T10:00"
 * would be read in the crawler's timezone, not Toronto's.
 */
export function generateVotingEventSchema({
  name,
  description,
  startDate,
  endDate,
  url,
  cityLabel,
  organizerName,
  organizerUrl,
}: {
  name: string;
  description: string;
  /** absolute ISO instant with offset, e.g. "2026-10-06T10:00:00-04:00" */
  startDate: string;
  endDate: string;
  /** the page describing this period */
  url: string;
  /** e.g. "Toronto" */
  cityLabel: string;
  /** the body running the election, e.g. "City of Toronto Elections" */
  organizerName: string;
  organizerUrl: string;
}): Event {
  const location: Place = {
    "@type": "Place",
    name: `${cityLabel}, Ontario`,
    address: {
      "@type": "PostalAddress",
      addressLocality: cityLabel,
      addressRegion: "ON",
      addressCountry: "CA",
    },
  };

  const organizer: Organization = {
    "@type": "GovernmentOrganization",
    name: organizerName,
    url: organizerUrl,
  };

  return {
    "@type": "Event",
    name,
    description,
    startDate,
    endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location,
    organizer,
    url,
    isAccessibleForFree: true,
  };
}
