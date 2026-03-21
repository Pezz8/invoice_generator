/**
 * Parse the raw "Parts Used" cell from report.xlsx.
 *
 * Expected format examples:
 *   FIL001:2, THE001:1
 *   FIL001:2
 *   fil001 : 2 , the001:1
 *
 * Returns:
 *   [
 *     { code: 'FIL001', qty: 2 },
 *     { code: 'THE001', qty: 1 },
 *   ]
 *
 * Behavior:
 * - Blank / empty values return []
 * - Codes are normalized to uppercase with internal spaces removed
 * - Quantity must be a positive number
 * - Invalid entries are skipped unless `strict=true`, in which case an Error is thrown
 */
export function parsePartsUsed(rawValue, { strict = false } = {}) {
  const value = String(rawValue ?? '').trim();
  if (!value) return [];

  const items = [];
  const segments = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const segment of segments) {
    const parsed = parsePartSegment(segment);

    if (!parsed) {
      if (strict) {
        throw new Error(`Invalid parts entry: "${segment}"`);
      }
      continue;
    }

    items.push(parsed);
  }

  return items;
}

function parsePartSegment(segment) {
  const parts = String(segment).split(':');
  if (parts.length !== 2) return null;

  const codeRaw = parts[0]?.trim();
  const qtyRaw = parts[1]?.trim();

  const code = normalizePartCode(codeRaw);
  if (!code) return null;

  const qty = Number(qtyRaw);
  if (!Number.isFinite(qty) || qty <= 0) return null;

  return {
    code,
    qty,
  };
}

function normalizePartCode(code) {
  return String(code ?? '')
    .trim()
    .replace(/\s+/g, '')
    .toUpperCase();
}
