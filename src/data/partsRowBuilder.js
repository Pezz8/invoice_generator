/**
 * Build invoice-ready parts rows by combining parsed "Parts Used" entries
 * with the parts catalog lookup.
 *
 * Input example:
 *   parsedParts = [
 *     { code: 'FIL001', qty: 2 },
 *     { code: 'THE001', qty: 1 },
 *   ]
 *
 *   partsByCode = {
 *     FIL001: { code: 'FIL001', name: 'HVAC Filter 16x25x1', unitPrice: 12.5 },
 *     THE001: { code: 'THE001', name: 'Digital Thermostat', unitPrice: 85 },
 *   }
 *
 * Output example:
 *   {
 *     rows: [
 *       {
 *         code: 'FIL001',
 *         name: 'HVAC Filter 16x25x1',
 *         qty: 2,
 *         unitPrice: 12.5,
 *         lineTotal: 25,
 *       },
 *       {
 *         code: 'THE001',
 *         name: 'Digital Thermostat',
 *         qty: 1,
 *         unitPrice: 85,
 *         lineTotal: 85,
 *       },
 *     ],
 *     total: 110,
 *     missingCodes: [],
 *   }
 */
export function buildPartsRows(
  parsedParts = [],
  partsByCode = {},
  { strict = false } = {}
) {
  const rows = [];
  const missingCodes = [];
  let total = 0;

  for (const item of parsedParts) {
    const code = normalizePartCode(item?.code);
    const qty = Number(item?.qty);

    if (!code || !Number.isFinite(qty) || qty <= 0) {
      if (strict) {
        throw new Error(`Invalid parsed part item: ${JSON.stringify(item)}`);
      }
      continue;
    }

    const catalogItem = partsByCode[code];
    if (!catalogItem) {
      missingCodes.push(code);
      if (strict) {
        throw new Error(`Part code not found in catalog: ${code}`);
      }
      continue;
    }

    const unitPrice = Number(catalogItem.unitPrice) || 0;
    const lineTotal = roundMoney(qty * unitPrice);

    rows.push({
      code,
      name: catalogItem.name,
      qty,
      unitPrice,
      lineTotal,
    });

    total += lineTotal;
  }

  return {
    rows,
    total: roundMoney(total),
    missingCodes,
  };
}

function normalizePartCode(code) {
  return String(code ?? '')
    .trim()
    .replace(/\s+/g, '')
    .toUpperCase();
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}
