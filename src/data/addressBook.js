import { readSheetRows } from './excel.js';

/**
 * Address Book loader and helpers.
 *
 * Expected columns in the address book sheet:
 *  - Unit Number
 *  - Name
 *  - Occupant Type
 *  - Email Address
 */

/**
 * Normalize a unit number to a stable lookup key.
 *
 * Notes:
 * - Keeps alphanumerics and dashes.
 * - Trims whitespace.
 * - Uppercases.
 */
export function normalizeUnit(unitRaw) {
  return String(unitRaw ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[^A-Z0-9-]/g, '');
}

/**
 * Normalize occupant type values (e.g., "owner", "Owner ") into canonical strings.
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

/**
 * Load an address book from an XLSX sheet and return a lookup Map:
 *   Map<unitKey, Array<{ unitNumber, name, occupantType, email }>>
 */
export function loadAddressBook({
  filePath,
  sheetName,
  sheetToJsonOptions,
} = {}) {
  if (!filePath) throw new Error('loadAddressBook: filePath is required');
  if (!sheetName) throw new Error('loadAddressBook: sheetName is required');

  const rows = readSheetRows(filePath, sheetName, sheetToJsonOptions);
  const map = new Map();

  for (const row of rows) {
    const {
      'Unit Number': unitNumberRaw,
      Name: nameRaw,
      'Occupant Type': occupantTypeRaw,
      'Email Address': emailRaw,
    } = row || {};

    const unitKey = normalizeUnit(unitNumberRaw);
    const name = String(nameRaw ?? '').trim();
    const occupantType = normalizeOccupantType(occupantTypeRaw);
    const email = normalizeEmail(emailRaw);

    // Skip rows without the minimum required info
    if (!unitKey || !email) continue;

    const occupant = {
      unitNumber: unitKey,
      name,
      occupantType,
      email,
    };

    const existing = map.get(unitKey);
    if (existing) {
      existing.push(occupant);
    } else {
      map.set(unitKey, [occupant]);
    }
  }

  return map;
}

/**
 * Get occupants for a unit (empty array if none).
 */
export function getOccupantsForUnit(addressBookMap, unitNumber) {
  const key = normalizeUnit(unitNumber);
  return addressBookMap?.get(key) ?? [];
}

/**
 * Select recipients for a unit.
 *
 * types:
 *  - 'ALL' to include every occupant type
 *  - or an array like ['OWNER'] or ['OWNER','MANAGER']
 *
 * Returns:
 *  - { to: string|null, cc: string[], occupants: Array<...> }
 *
 * Default behavior for now (per your decision):
 *  - First email becomes `to`
 *  - Remaining emails become `cc`
 */
export function selectUnitRecipients(
  addressBookMap,
  unitNumber,
  { types = 'ALL' } = {}
) {
  const occupants = getOccupantsForUnit(addressBookMap, unitNumber);
  if (!occupants.length) return { to: null, cc: [], occupants: [] };

  const wanted = Array.isArray(types)
    ? new Set(types.map((t) => normalizeOccupantType(t)))
    : String(types).trim().toUpperCase() === 'ALL'
      ? null
      : new Set(
          String(types)
            .split(',')
            .map((t) => normalizeOccupantType(t))
            .filter(Boolean)
        );

  const filtered = wanted
    ? occupants.filter((o) => wanted.has(normalizeOccupantType(o.occupantType)))
    : occupants;

  // Deduplicate emails (keep first occurrence)
  const seen = new Set();
  const emails = [];
  const keptOccupants = [];
  for (const o of filtered) {
    const e = normalizeEmail(o.email);
    if (!e) continue;
    const key = e.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    emails.push(e);
    keptOccupants.push(o);
  }

  if (!emails.length) return { to: null, cc: [], occupants: [] };

  const [to, ...cc] = emails;
  return { to, cc, occupants: keptOccupants };
}
