import * as xlsx from 'xlsx';
import fs from 'fs';
import { getSheet } from './../reportFunctions.js';
xlsx.set_fs(fs);

// Read or create the workbook
export function readWorkbook(filePath) {
  return xlsx.readFile(filePath);
}

/**
 * Return rows (array of objects) from a given workbook + sheet name.
 * Uses getSheet() so existing behavior (get-or-create) stays consistent.
 */
export function sheetToRows(workbook, sheetName, options = undefined) {
  const worksheet = getSheet(workbook, sheetName);
  return xlsx.utils.sheet_to_json(worksheet, options);
}

/**
 * Convenience helper: read a workbook from disk and return rows from a sheet.
 */
export function readSheetRows(filePath, sheetName, options = undefined) {
  const workbook = readWorkbook(filePath);
  return sheetToRows(workbook, sheetName, options);
}
// // Get or create the target sheet
// const worksheet = getSheet(workbook, sheetName);

// // Convert sheet data to JSON for processing
// const rows = xlsx.utils.sheet_to_json(worksheet);
