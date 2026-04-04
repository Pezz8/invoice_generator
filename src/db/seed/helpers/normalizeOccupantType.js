import normalizeString from './normalizeString.js';

export default function normalizeOccupantType(value) {
  const normalized = normalizeString(value);

  if (!normalized) return null;

  if (normalized === 'owner') return 'OWNER';
  if (normalized === 'tenant') return 'TENANT';
  if (normalized === 'manager') return 'MANAGER';

  return null;
}
