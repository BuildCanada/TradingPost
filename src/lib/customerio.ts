// Identifies people to Customer.io through the CDP identify endpoint, the same
// API York Factory's CustomerioService uses for newsletter subscribers.
//
// The CDP write key authenticates as HTTP Basic with the key as the username
// and an empty password. US workspaces post to cdp.customer.io, EU ones to
// cdp-eu.customer.io; set CUSTOMERIO_REGION=eu for the latter.

const IDENTIFY_URL = "https://cdp.customer.io/v1/identify";
const EU_IDENTIFY_URL = "https://cdp-eu.customer.io/v1/identify";

export type CustomerioTraits = Record<
  string,
  string | number | boolean | undefined
>;

/**
 * Upserts a person's traits. Returns false without sending when no key is
 * configured (local development), so callers can treat it as best-effort.
 *
 * Keyed by email: unlike York Factory we have no row id to key on, and an
 * email-shaped userId matches the existing profile with that email.
 */
export async function identifyToCustomerio(
  email: string,
  traits: CustomerioTraits,
): Promise<boolean> {
  const key = process.env.CUSTOMERIO_API_KEY;
  if (!key) return false;

  const url =
    process.env.CUSTOMERIO_REGION?.toLowerCase() === "eu"
      ? EU_IDENTIFY_URL
      : IDENTIFY_URL;

  // Blank traits are dropped rather than sent, so an omitted field never
  // clears what Customer.io already has for this person.
  const present = Object.fromEntries(
    Object.entries({ email, ...traits }).filter(
      ([, v]) => v !== undefined && v !== "",
    ),
  );

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${key}:`).toString("base64")}`,
    },
    body: JSON.stringify({ userId: email, traits: present }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Customer.io identify failed: ${res.status} ${(await res.text()).slice(0, 300)}`,
    );
  }
  return true;
}
