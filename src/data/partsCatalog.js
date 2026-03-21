import * as xlsx from 'xlsx';
import fs from 'fs';

import { partsCatalogPath, partsCatalogSheet } from '../../config.js';
import { checkExcelFileSafe } from '../utils/fileSafety.js';

xlsx.set_fs(fs);

/**
 * Load Parts Catalog.xlsx and return a lookup map by part code.
 *
 * Output example:
 * {
 *   FIL01: { code: 'FIL01', name: 'HVAC Filter 16x25x1', unitPrice: 12.5 },
 *   THE01: { code: 'THE01', name: 'Digital Thermostat', unitPrice: 85 },
 * }
 */
export function loadPartsCatalog({
  filePath = partsCatalogPath,
  sheetName = partsCatalogSheet,
} = {}) {
  checkExcelFileSafe(filePath, 'Parts Catalog workbook');

  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`Sheet "${sheetName}" not found in ${filePath}`);
  }

  const rows = xlsx.utils.sheet_to_json(worksheet);
  const partsByCode = {};

  for (const row of rows) {
    const code = normalizePartCode(row['Part Code']);
    const name = String(row['Name'] ?? '').trim();
    const unitPrice = Number(row['Price'] ?? 0);

    if (!code || !name) continue;

    partsByCode[code] = {
      code,
      name,
      unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
    };
  }

  return partsByCode;
}

function normalizePartCode(code) {
  return String(code ?? '')
    .trim()
    .replace(/\s+/g, '')
    .toUpperCase();
}
