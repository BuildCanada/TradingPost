// Canadian postal code handling shared by the public election form endpoints
// (pledge, survey). Lifted out of the pledge route when the survey route became
// the second caller, so the two can't drift on what counts as valid.

export const POSTAL_PATTERN = /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/;

/**
 * "M5V1A1" / "m5v 1a1" → "M5V 1A1". Anything malformed returns undefined
 * rather than being stored dirty — the caller decides whether that's an error
 * or just a field to drop.
 */
export function normalizePostalCode(raw: unknown): string | undefined {
  if (typeof raw !== "string" || !POSTAL_PATTERN.test(raw.trim())) {
    return undefined;
  }
  const compact = raw.trim().toUpperCase().replace(" ", "");
  return `${compact.slice(0, 3)} ${compact.slice(3)}`;
}
