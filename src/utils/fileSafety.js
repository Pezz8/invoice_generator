import fs from 'fs';
import path from 'path';

/**
 * Check if Excel created a lock file (~$filename.xlsx).
 * If the lock file exists, it means the workbook is currently open in Excel.
 */
export function checkExcelLock(filePath) {
  const dir = path.dirname(filePath);
  const file = path.basename(filePath);
  const lockFile = path.join(dir, `~$${file}`);

  if (fs.existsSync(lockFile)) {
    throw new Error(
      `⚠ ${file} is currently open in Excel. Please close it before running the script.`
    );
  }
}

/**
 * Verify that a required file exists before attempting to read it.
 */
export function checkRequiredFile(filePath, label = 'Required file') {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found: ${filePath}`);
  }
}

/**
 * Combined safety check for Excel workbooks.
 * 1) File must exist
 * 2) File must not be locked by Excel
 */
export function checkExcelFileSafe(filePath, label = 'Excel file') {
  checkRequiredFile(filePath, label);
  checkExcelLock(filePath);
}
