import xlsx from 'xlsx';

const EMAIL_SENT_HEADER = 'Email Sent';

/**
 * Load a report workbook + sheet, ensure the "Email Sent" column exists,
 * and provide helpers to read rows with Excel row indexes and stamp a sent timestamp.
 *
 * Notes:
 * - Uses ISO timestamps (e.g. 2026-02-28T18:12:00.123Z)
 * - Keeps Excel operations here (read/write), leaving parsing to reportParser.js
 */
export function loadReportWorkbook({ reportPath, sheetName }) {
  if (!reportPath)
    throw new Error('loadReportWorkbook: reportPath is required');
  if (!sheetName) throw new Error('loadReportWorkbook: sheetName is required');

  const workbook = xlsx.readFile(reportPath);
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error(
      `loadReportWorkbook: sheet "${sheetName}" not found in ${reportPath}`
    );
  }

  // Ensure we have a usable range (some sheets can be empty)
  const range = worksheet['!ref']
    ? xlsx.utils.decode_range(worksheet['!ref'])
    : { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } };

  // Read header row (row 1 in Excel => r=0)
  const headers = readHeaderRow(worksheet, range);

  // Ensure Email Sent column exists; may extend the worksheet range
  const { emailSentCol, updatedRange } = ensureEmailSentColumn(
    worksheet,
    range,
    headers
  );

  // Keep worksheet ref in sync if range changed
  if (updatedRange && worksheet['!ref']) {
    worksheet['!ref'] = xlsx.utils.encode_range(updatedRange);
  }

  return {
    workbook,
    worksheet,
    reportPath,
    sheetName,
    headers,
    emailSentCol,

    /**
     * Read all data rows as:
     * [{ excelRowNumber, row, emailSent }]
     * - excelRowNumber is 1-based (Excel UI row number)
     */
    readRows() {
      return readRowsWithMeta(
        worksheet,
        updatedRange || range,
        headers,
        emailSentCol
      );
    },

    /**
     * Stamp the given Excel row numbers (1-based) with an ISO timestamp.
     */
    stampEmailSent(excelRowNumbers, isoTimestamp = new Date().toISOString()) {
      stampEmailSent(worksheet, excelRowNumbers, emailSentCol, isoTimestamp);
    },

    /**
     * Persist changes back to disk.
     */
    save() {
      xlsx.writeFile(workbook, reportPath);
    },
  };
}

function readHeaderRow(worksheet, range) {
  const headers = [];
  const headerRow = range.s.r; // usually 0

  for (let c = range.s.c; c <= range.e.c; c += 1) {
    const addr = xlsx.utils.encode_cell({ r: headerRow, c });
    const cell = worksheet[addr];
    const value = cell?.v;
    headers[c] = value != null ? String(value).trim() : '';
  }

  return headers;
}

function ensureEmailSentColumn(worksheet, range, headers) {
  // Try to find existing Email Sent header
  let emailSentCol = headers.findIndex(
    (h) => (h || '').trim() === EMAIL_SENT_HEADER
  );

  // If found, nothing to do
  if (emailSentCol >= 0) {
    return { emailSentCol, updatedRange: range };
  }

  // Otherwise append a new column at the end
  emailSentCol = range.e.c + 1;

  // Write header cell in row 1 (r=0)
  const headerAddr = xlsx.utils.encode_cell({ r: range.s.r, c: emailSentCol });
  worksheet[headerAddr] = { t: 's', v: EMAIL_SENT_HEADER };

  // Update in-memory headers array so callers can rely on it
  headers[emailSentCol] = EMAIL_SENT_HEADER;

  // Extend sheet range to include new column
  const updatedRange = {
    s: { ...range.s },
    e: { r: range.e.r, c: emailSentCol },
  };

  // Update !ref even if it was missing
  worksheet['!ref'] = xlsx.utils.encode_range(updatedRange);

  return { emailSentCol, updatedRange };
}

function readRowsWithMeta(worksheet, range, headers, emailSentCol) {
  const rows = [];

  // Data starts at row 2 in Excel (r=1)
  const startRow = range.s.r + 1;

  for (let r = startRow; r <= range.e.r; r += 1) {
    const rowObj = {};

    // Build an object using header names as keys
    for (let c = range.s.c; c <= range.e.c; c += 1) {
      const header = headers[c];
      if (!header) continue;

      const addr = xlsx.utils.encode_cell({ r, c });
      const cell = worksheet[addr];

      // Preserve raw values (numbers stay numbers, dates often are Excel serial numbers)
      rowObj[header] = cell?.v ?? '';
    }

    const emailSentAddr = xlsx.utils.encode_cell({ r, c: emailSentCol });
    const emailSentCell = worksheet[emailSentAddr];
    const emailSent = emailSentCell?.v ? String(emailSentCell.v).trim() : '';

    // Skip completely empty rows (helps when the sheet has formatting past the data)
    const hasAnyData = Object.values(rowObj).some((v) => v !== '' && v != null);

    if (!hasAnyData) {
      continue;
    }

    rows.push({
      excelRowNumber: r + 1, // convert 0-based r to Excel 1-based
      row: rowObj,
      emailSent,
    });
  }

  return rows;
}

function stampEmailSent(
  worksheet,
  excelRowNumbers,
  emailSentCol,
  isoTimestamp
) {
  if (!Array.isArray(excelRowNumbers) || excelRowNumbers.length === 0) return;

  for (const excelRowNumber of excelRowNumbers) {
    // Convert Excel row number (1-based) to worksheet row (0-based)
    const r = Number(excelRowNumber) - 1;
    if (!Number.isFinite(r) || r < 1) continue; // never stamp header row

    const addr = xlsx.utils.encode_cell({ r, c: emailSentCol });
    worksheet[addr] = { t: 's', v: isoTimestamp };
  }
}

export const reportWorkbookConstants = {
  EMAIL_SENT_HEADER,
};
