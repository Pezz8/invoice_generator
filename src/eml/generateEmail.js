import fs from 'fs/promises';
import path from 'path';
import nodemailer from 'nodemailer';

import { readSheetRows } from '../data/excel.js';
import { parseReportRow } from '../data/reportParser.js';
import { loadAddressBook, selectUnitRecipients } from '../data/addressBook.js';
import { getPathByInvoiceNumber } from '../invoiceFunctions.js';

import {
  reportPath,
  sheetName,
  draftEmailPath,
  addressBookPath,
  addressBookSheet,
  emailOccupantType,
  emailFrom,
  emailSubjectPrefix,
} from '../../config.js';

/**
 * Generate one Outlook-importable .eml draft per unit.
 * - Reads invoices from report.xlsx
 * - Groups invoices by unit
 * - Loads recipients from addressBook.xlsx
 * - Creates .eml with multiple invoice PDFs attached
 */
export async function generateEmailDrafts({
  // Address book
  addressBookFilePath = addressBookPath,
  addressBookSheetName = addressBookSheet,

  // Recipient selection
  occupantTypes = emailOccupantType,

  // Email headers
  from = emailFrom,
  subjectPrefix = emailSubjectPrefix,

  // Output
  outDir = draftEmailPath,
} = {}) {
  await fs.mkdir(outDir, { recursive: true });

  // Load invoice rows from report
  const rows = readSheetRows(reportPath, sheetName);

  // Parse + group by unit
  const invoicesByUnit = new Map();
  for (const row of rows) {
    const parsed = parseReportRow(row);
    if (!parsed) continue;

    const arr = invoicesByUnit.get(parsed.unitNumber);
    if (arr) arr.push(parsed);
    else invoicesByUnit.set(parsed.unitNumber, [parsed]);
  }

  // Load address book
  const addressBook = loadAddressBook({
    filePath: addressBookFilePath,
    sheetName: addressBookSheetName,
  });

  // Nodemailer as MIME builder (no sending)
  const transporter = nodemailer.createTransport({
    streamTransport: true,
    buffer: true,
    newline: 'windows', // CRLF for .eml / Outlook
  });

  const results = [];

  for (const [unitNumber, invoices] of invoicesByUnit.entries()) {
    const { to, cc } = selectUnitRecipients(addressBook, unitNumber, {
      types: occupantTypes,
    });

    if (!to) {
      results.push({
        unitNumber,
        status: 'skipped',
        reason: 'No recipients found in address book',
      });
      continue;
    }

    // Build attachments: one per invoice (lookup by invoice number only)
    const attachments = [];
    for (const inv of invoices) {
      const { invoiceNumber } = inv;

      const pdfPath = getPathByInvoiceNumber(invoiceNumber);
      if (!pdfPath) {
        results.push({
          unitNumber,
          status: 'warning',
          reason: `Missing PDF for invoice ${invoiceNumber}`,
        });
        continue;
      }

      attachments.push({
        filename: path.basename(pdfPath),
        path: pdfPath,
      });
    }

    if (!attachments.length) {
      results.push({
        unitNumber,
        status: 'skipped',
        reason: 'No invoice PDFs found to attach',
      });
      continue;
    }

    // Subject line: keep simple but informative
    let subject;
    if (attachments.length === 1) {
      const filename = path.basename(attachments[0].path);
      const nameWithoutExt = filename.replace(/\.pdf$/i, '');
      const subjectLabel = nameWithoutExt.replace(
        new RegExp(`^Unit\\s+${unitNumber}\\s+`),
        ''
      );
      subject = `${subjectPrefix} ${unitNumber} - ${subjectLabel}`;
    } else {
      subject = `${subjectPrefix} ${unitNumber} - Invoices`;
    }

    const info = await transporter.sendMail({
      from,
      to,
      cc: cc.length ? cc : undefined,
      subject,
      text: '', // empty body for now
      attachments,
    });

    const emlFileName = `Unit_${unitNumber}_${Date.now()}.eml`;
    const outPath = path.join(outDir, emlFileName);
    await fs.writeFile(outPath, info.message);

    results.push({
      unitNumber,
      status: 'ok',
      outPath,
      to,
      cc,
      attachments: attachments.length,
    });
  }

  return results;
}

// Allow running as a script:
// node src/eml/generateEmail.js
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const res = await generateEmailDrafts();
    const ok = res.filter((r) => r.status === 'ok').length;
    const skipped = res.filter((r) => r.status === 'skipped').length;
    const warnings = res.filter((r) => r.status === 'warning').length;

    console.log(
      `EML generation complete. ok=${ok} skipped=${skipped} warnings=${warnings}`
    );
    for (const r of res) {
      if (r.status === 'ok') {
        console.log(
          `  [OK] Unit ${r.unitNumber} -> ${r.outPath} (to=${r.to}${r.cc?.length ? ` cc=${r.cc.join(',')}` : ''}) attachments=${r.attachments}`
        );
      } else {
        console.log(
          `  [${r.status.toUpperCase()}] Unit ${r.unitNumber}: ${r.reason}`
        );
      }
    }
  } catch (e) {
    console.error('Failed to generate EML drafts:', e);
    process.exitCode = 1;
  }
}
