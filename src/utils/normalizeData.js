/**
 * Shared normalization utilities.
 * Keep this file dependency-free (no xlsx/fs/moment) so it can be reused everywhere.
 */

/**
 * Normalize a unit number to a stable lookup key.
 *
 * Rules:
 * - Trim whitespace
 * - Uppercase
 * - Remove internal spaces
 * - Keep only A–Z, 0–9, and dashes
 * - Normalize commercial units:
 *     CU-1, CU1, CU-01  ->  CU-01
 */
export function normalizeUnit(unitRaw) {
  const cleaned = String(unitRaw ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[^A-Z0-9-]/g, '');

  if (!cleaned) return '';

  const cuMatch = cleaned.match(/^CU-?(\d+)$/);
  if (cuMatch) {
    const num = cuMatch[1].padStart(2, '0');
    return `CU-${num}`;
  }

  return cleaned;
}

/**
 * Normalize occupant type values into canonical strings.
 * Canonical values: OWNER, MANAGER, TENANT
 */
export function normalizeOccupantType(typeRaw) {
  const t = String(typeRaw ?? '')
    .trim()
    .toUpperCase();
  if (!t) return '';

  // Common synonyms / variants
  if (t === 'OWNER' || t === 'OWNERS') return 'OWNER';
  if (t === 'MANAGER' || t === 'PROPERTY MANAGER' || t === 'PM')
    return 'MANAGER';
  if (t === 'TENANT' || t === 'RENTER' || t === 'OCCUPANT') return 'TENANT';

  // Fall back to the normalized string so the caller can decide how strict to be.
  return t;
}

/**
 * Basic email cleanup (does not fully validate).
 */
export function normalizeEmail(emailRaw) {
  return String(emailRaw ?? '').trim();
}
