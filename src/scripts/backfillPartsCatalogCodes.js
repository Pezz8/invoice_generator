import * as xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

import { checkExcelFileSafe } from '../utils/fileSafety.js';
import { generatePartCode } from '../data/partsCodeGenerator.js';
import { partsCatalogPath, partsCatalogSheet } from '../../config.js';

xlsx.set_fs(fs);

const PART_CODE_HEADER = 'Part Code';
const NAME_HEADER = 'Name';

function normalizeCode(code) {
  return String(code ?? '')
    .trim()
    .toUpperCase();
}

function getHeaderMap(worksheet) {
  const range = worksheet['!ref']
    ? xlsx.utils.decode_range(worksheet['!ref'])
    : { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } };

  const headers = new Map();
  const headerRow = range.s.r;

  for (let c = range.s.c; c <= range.e.c; c += 1) {
    const addr = xlsx.utils.encode_cell({ r: headerRow, c });
    const cell = worksheet[addr];
    const value = cell?.v != null ? String(cell.v).trim() : '';
    if (value) {
      headers.set(value, c);
    }
  }

  return { headers, range };
}

function getCellValue(worksheet, r, c) {
  const addr = xlsx.utils.encode_cell({ r, c });
  return worksheet[addr]?.v ?? '';
}

function setCellValue(worksheet, r, c, value) {
  const addr = xlsx.utils.encode_cell({ r, c });
  worksheet[addr] = { t: 's', v: String(value) };
}

async function main() {
  try {
    checkExcelFileSafe(partsCatalogPath, 'Parts Catalog workbook');

    const workbook = xlsx.readFile(partsCatalogPath);
    const worksheet = workbook.Sheets[partsCatalogSheet];

    if (!worksheet) {
      throw new Error(
        `Sheet "${partsCatalogSheet}" not found in ${partsCatalogPath}`
      );
    }

    const { headers, range } = getHeaderMap(worksheet);

    const partCodeCol = headers.get(PART_CODE_HEADER);
    const nameCol = headers.get(NAME_HEADER);

    if (partCodeCol == null) {
      throw new Error(
        `Column "${PART_CODE_HEADER}" not found in ${partsCatalogPath}`
      );
    }

    if (nameCol == null) {
      throw new Error(
        `Column "${NAME_HEADER}" not found in ${partsCatalogPath}`
      );
    }

    const existingCodes = new Set();

    // First pass: collect all existing codes so generated values are unique.
    for (let r = range.s.r + 1; r <= range.e.r; r += 1) {
      const code = normalizeCode(getCellValue(worksheet, r, partCodeCol));
      if (code) {
        existingCodes.add(code);
      }
    }

    const updates = [];

    // Second pass: fill missing codes.
    for (let r = range.s.r + 1; r <= range.e.r; r += 1) {
      const currentCode = normalizeCode(
        getCellValue(worksheet, r, partCodeCol)
      );
      if (currentCode) continue;

      const partName = String(getCellValue(worksheet, r, nameCol) ?? '').trim();
      if (!partName) continue;

      const newCode = generatePartCode(partName, existingCodes);
      if (!newCode) continue;

      setCellValue(worksheet, r, partCodeCol, newCode);
      updates.push({
        excelRow: r + 1,
        name: partName,
        code: newCode,
      });
    }

    if (!updates.length) {
      console.log('No missing Part Code values found. Nothing to update.');
      return;
    }

    xlsx.writeFile(workbook, partsCatalogPath);

    console.log(`Updated ${updates.length} missing Part Code value(s):\n`);
    for (const update of updates) {
      console.log(`Row ${update.excelRow}: ${update.name} -> ${update.code}`);
    }

    console.log(`\nSaved updated workbook: ${path.basename(partsCatalogPath)}`);
  } catch (err) {
    console.error('Failed to backfill part codes:', err);
    process.exitCode = 1;
  }
}

main();
