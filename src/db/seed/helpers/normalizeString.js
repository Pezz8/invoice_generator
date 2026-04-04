export default function normalizeString(value) {
  if (value === null || value === undefined) return null;

  const normalized = String(value).trim().replace(/\s+/g, ' ').toLowerCase();

  return normalized.length ? normalized : null;
}
