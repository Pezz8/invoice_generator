import { readSheetRows } from './excel.js';
import {
  normalizeEmail,
  normalizeOccupantType,
  normalizeUnit,
} from '../utils/normalizeData.js';

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
      Unit: unitNumberRaw,
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
 *  - 'ALL' to include OWNER and MANAGER only
 *  - or an array like ['OWNER'] or ['OWNER','MANAGER']
 *
 * Returns:
 *  - { to: string|null, cc: string[], occupants: Array<...> }
 *
 * Default behavior:
 *  - First OWNER email becomes `to` when an owner exists
 *  - All remaining matching emails become `cc`
 *  - If no owner exists, the first matching email becomes `to`
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
      ? new Set(['OWNER', 'MANAGER'])
      : new Set(
          String(types)
            .split(',')
            .map((t) => normalizeOccupantType(t))
            .filter(Boolean)
        );

  const filtered = occupants.filter((o) =>
    wanted.has(normalizeOccupantType(o.occupantType))
  );

  // Deduplicate emails (keep first occurrence)
  const seen = new Set();
  const keptOccupants = [];
  for (const o of filtered) {
    const e = normalizeEmail(o.email);
    if (!e) continue;
    const key = e.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    keptOccupants.push({ ...o, email: e });
  }

  if (!keptOccupants.length) return { to: null, cc: [], occupants: [] };

  const owners = keptOccupants.filter(
    (o) => normalizeOccupantType(o.occupantType) === 'OWNER'
  );
  const nonOwners = keptOccupants.filter(
    (o) => normalizeOccupantType(o.occupantType) !== 'OWNER'
  );

  const orderedOccupants = owners.length
    ? [...owners, ...nonOwners]
    : keptOccupants;
  const [primaryRecipient, ...ccRecipients] = orderedOccupants;

  return {
    to: primaryRecipient?.email ?? null,
    cc: ccRecipients.map((o) => o.email),
    occupants: orderedOccupants,
  };
}
