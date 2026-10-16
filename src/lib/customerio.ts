// Identifies people to Customer.io through the Track API's v2 entity endpoint.
//
// Authenticates as HTTP Basic with the workspace's site ID and Track API key.
// US workspaces post to track.customer.io, EU ones to track-eu.customer.io;
// set CUSTOMERIO_REGION=eu for the latter.

const ENTITY_URL = "https://track.customer.io/api/v2/entity";
const EU_ENTITY_URL = "https://track-eu.customer.io/api/v2/entity";

export type CustomerioAttributes = Record<
  string,
  string | number | boolean | undefined
>;

/**
 * Creates or updates the person with this email. Returns false without
 * sending when the credentials aren't configured, so callers can treat it as
 * best-effort.
 *
 * Identified by email rather than an ID: York Factory keys the profiles it
 * creates by subscriber ID, which we don't have here, and an email identifier
 * finds that same profile instead of creating a second one.
 */
export async function identifyToCustomerio(
  email: string,
  attributes: CustomerioAttributes,
): Promise<boolean> {
  const siteId = process.env.CUSTOMERIO_SITE_ID;
  const apiKey = process.env.CUSTOMERIO_API_KEY;
  if (!siteId || !apiKey) return false;

  const url =
    process.env.CUSTOMERIO_REGION?.toLowerCase() === "eu"
      ? EU_ENTITY_URL
      : ENTITY_URL;

  // Blank attributes are dropped rather than sent, so an omitted field never
  // clears what Customer.io already has for this person.
  const present = Object.fromEntries(
    Object.entries({ email, ...attributes }).filter(
      ([, v]) => v !== undefined && v !== "",
    ),
  );

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${siteId}:${apiKey}`).toString("base64")}`,
    },
    body: JSON.stringify({
      type: "person",
      identifiers: { email },
      action: "identify",
      attributes: present,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Customer.io identify failed: ${res.status} ${(await res.text()).slice(0, 300)}`,
    );
  }
  return true;
}
