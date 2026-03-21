/**
 * Generate a short part code based on the part name.
 * Example:
 *   "HVAC Filter 16x25x1" -> FIL001
 *   "Digital Thermostat" -> THE001
 */

const SKIP_WORDS = new Set([
  'HVAC',
  'DIGITAL',
  'STANDARD',
  'KIT',
  'SET',
  'PART',
  'ITEM',
  'THE',
  'AND',
  'FOR',
  'WITH',
]);

export function generatePartCode(partName, existingCodes = new Set()) {
  if (!partName) return null;

  const words = partName
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  // choose first meaningful word
  let baseWord = words.find((w) => !SKIP_WORDS.has(w)) || words[0];

  if (!baseWord) return null;

  const prefix = baseWord.slice(0, 3);

  // find next available number
  let counter = 1;
  let code;

  do {
    code = `${prefix}${String(counter).padStart(2, '0')}`;
    counter++;
  } while (existingCodes.has(code));

  existingCodes.add(code);

  return code;
}
