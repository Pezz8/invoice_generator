import fs from 'fs/promises';
import path from 'path';
import nodemailer from 'nodemailer';

import { readSheetRows } from '../data/excel.js';
import { parseReportRow } from '../data/reportParser.js';
import { loadReportWorkbook } from '../data/reportWorkbook.js';
import { loadAddressBook, selectUnitRecipients } from '../data/addressBook.js';
import { getPathByInvoiceNumber } from '../invoiceFunctions.js';
import { sendGraphMail } from '../graph/graphMail.js';

import {
  reportPath,
  sheetName,
  draftEmailPath,
  addressBookPath,
  addressBookSheet,
  emailOccupantType,
  emailSubjectPrefix,
  invEmailPath,
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
  subjectPrefix = emailSubjectPrefix,

  // Mode: 'draft' | 'send'
  mode = 'draft',

  // Output (used in draft mode)
  outDir = draftEmailPath,
} = {}) {
  await fs.mkdir(outDir, { recursive: true });

  // Load email HTML template once
  const htmlTemplate = await fs.readFile(invEmailPath, 'utf8');

  // Load signature template only in send mode
  let signatureHtml = '';
  if (mode === 'send') {
    // Prefer signature_temp.html (as discussed), fallback to signature.html
    const templatesDir = path.dirname(invEmailPath);
    try {
      signatureHtml = await fs.readFile(
        path.join(templatesDir, 'signature_temp.html'),
        'utf8'
      );
    } catch {
      try {
        signatureHtml = await fs.readFile(
          path.join(templatesDir, 'signature.html'),
          'utf8'
        );
      } catch {
        signatureHtml = '';
      }
    }
  }

  const formatDateList = (dates) => {
    const clean = (dates || []).map((d) => String(d).trim()).filter(Boolean);
    const unique = Array.from(new Set(clean));
    if (unique.length === 0) return 'N/A';
    if (unique.length === 1) return unique[0];
    if (unique.length === 2) return `${unique[0]} and ${unique[1]}`;
    return `${unique.slice(0, -1).join(', ')}, and ${unique[unique.length - 1]}`;
  };

  // Load address book (recipients)
  const addressBook = await loadAddressBook({
    filePath: addressBookFilePath,
    sheetName: addressBookSheetName,
  });

  // Draft mode uses Nodemailer as a MIME builder (no sending)
  const transporter = nodemailer.createTransport({
    streamTransport: true,
    buffer: true,
    newline: 'windows', // CRLF for .eml / Outlook
  });

  const results = [];

  // Load invoice rows from report
  // - Draft mode: read-only
  // - Send mode: read with row metadata (for stamping) and ensure "Email Sent" column exists in-memory
  let reportWb = null;
  let reportRows = [];

  if (mode === 'send') {
    reportWb = loadReportWorkbook({ reportPath, sheetName });
    const metaRows = reportWb.readRows(); // [{ excelRowNumber, row, emailSent }]
    reportRows = metaRows;
  } else {
    reportRows = readSheetRows(reportPath, sheetName).map((row) => ({
      excelRowNumber: null,
      row,
      emailSent: '',
    }));
  }

  // Parse + group by unit
  const invoicesByUnit = new Map();
  for (const mr of reportRows) {
    const parsed = parseReportRow(mr.row);
    if (!parsed) continue;

    // Attach metadata for send-mode stamping/skip
    parsed._excelRowNumber = mr.excelRowNumber;
    parsed._emailSent = mr.emailSent;

    const arr = invoicesByUnit.get(parsed.unitNumber);
    if (arr) arr.push(parsed);
    else invoicesByUnit.set(parsed.unitNumber, [parsed]);
  }

  let stampedAny = false;

  for (const [unitNumber, allInvoices] of invoicesByUnit.entries()) {
    const invoices =
      mode === 'send'
        ? allInvoices.filter((i) => {
            const value = String(i._emailSent || '').trim();
            // Ignore 'manual send' values, regardless of whitespace/case
            if (value.replace(/\s+/g, '').toLowerCase() === 'manualsend')
              return false;
            return !value;
          })
        : allInvoices;

    if (mode === 'send' && invoices.length === 0) {
      results.push({
        unitNumber,
        status: 'skipped',
        reason: 'Already sent (Email Sent is stamped in report.xlsx)',
      });
      continue;
    }

    const { to, cc } = selectUnitRecipients(addressBook, unitNumber, {
      types: occupantTypes,
    });

    if (!to || (Array.isArray(to) && to.length === 0)) {
      results.push({
        unitNumber,
        status: 'skipped',
        reason: 'No recipients found in address book',
      });
      continue;
    }

    // Build attachments: one per invoice (lookup by invoice number only)
    // In send mode, also track which Excel rows should be stamped after a successful send.
    const attachments = [];
    const excelRowsToStamp = [];

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

      if (mode === 'send' && inv._excelRowNumber) {
        excelRowsToStamp.push(inv._excelRowNumber);
      }
    }

    if (!attachments.length) {
      results.push({
        unitNumber,
        status: 'skipped',
        reason: 'No invoice PDFs found to attach',
      });
      continue;
    }

    // Subject line
    // Desired format examples:
    //   Single:   Regatta 111 - Work Order Invoice 1111
    //   Multiple: Regatta 111 - Invoices
    let subject;

    const firstFilename = path.basename(attachments[0].path);
    const firstNameWithoutExt = firstFilename.replace(/\.pdf$/i, '').trim();

    const escapeRegExp = (s) =>
      String(s).replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');

    // Extract:
    //   unitLabel = {prefix before unitNumber}{unitNumber}
    //   remainder = {text after unitNumber}
    // Works for filenames like:
    //   "Regatta 111 Work Order Invoice 1111"
    //   "Regatta 111 - Work Order Invoice 1111"
    const unitNum = String(unitNumber).trim();
    const re = new RegExp(`^(.*?\\b)(${escapeRegExp(unitNum)})(\\b.*)$`, 'i');
    const m = firstNameWithoutExt.match(re);

    const rawPrefix = m ? (m[1] || '').trim() : '';
    const matchedUnit = m ? m[2] || unitNum : unitNum;
    let remainder = m ? (m[3] || '').trim() : '';

    // If remainder begins with a dash (common in some filenames), strip it.
    remainder = remainder.replace(/^[-–—]\s*/, '').trim();

    const unitLabel = rawPrefix ? `${rawPrefix} ${matchedUnit}` : matchedUnit;

    if (attachments.length === 1) {
      // If we can't derive a remainder, fall back to the full filename without extension.
      subject = remainder ? `${unitLabel} - ${remainder}` : firstNameWithoutExt;
    } else {
      subject = `${unitLabel} - Invoices`;
    }

    // Render HTML body from template (per unit)
    const invoiceWord = attachments.length === 1 ? 'invoice' : 'invoices';
    const invoiceDates = invoices
      .map((i) => i.formattedDate ?? i.date ?? i.Date)
      .filter(Boolean);
    const invoiceDatesText = formatDateList(invoiceDates);

    const htmlBody = htmlTemplate
      .replaceAll('{{INVOICE_WORD}}', invoiceWord)
      .replaceAll('{{INVOICE_DATES}}', invoiceDatesText)
      .replaceAll('{{SIGNATURE}}', signatureHtml);

    if (mode === 'send') {
      // Graph send
      // NOTE: Graph can embed inline images if your graphMail.js supports isInline + contentId.
      // We pass those fields for the logo so signature cid:managementLogo can render.
      const graphAttachments = [...attachments];

      // Add logo only in send mode (contentId must match signature template: cid:managementLogo)
      graphAttachments.push({
        filename: 'managementLogo.png',
        path: path.join(
          path.dirname(invEmailPath),
          '..',
          'images',
          'managementLogo.png'
        ),
        contentType: 'image/png',
        isInline: true,
        contentId: 'managementLogo',
      });

      await sendGraphMail({
        to: Array.isArray(to) ? to : [to],
        cc,
        subject,
        html: htmlBody,
        attachments: graphAttachments,
        saveToSentItems: true,
      });

      // Stamp "Email Sent" for the rows that were actually included in this email
      if (reportWb && excelRowsToStamp.length) {
        const iso = new Date().toISOString();
        reportWb.stampEmailSent(excelRowsToStamp, iso);
        // Save after each successful unit send to prevent duplicate sends on interruption
        reportWb.save();
        stampedAny = true;
      }

      results.push({
        unitNumber,
        status: 'ok',
        to,
        cc,
        attachments: attachments.length,
        messageId: '(graph)',
      });

      continue;
    }

    // Draft mode: build MIME and write .eml
    const mailOptions = {
      to,
      cc: cc.length ? cc : undefined,
      subject,
      html: htmlBody,
      attachments, // invoice PDFs only
    };

    const info = await transporter.sendMail(mailOptions);

    // Use subject-based filename for drafts (sanitized for filesystem)
    const sanitizeFileName = (name) =>
      String(name)
        .replace(/[\\/:*?"<>|]/g, '-')
        .replace(/\s+/g, ' ')
        .trim();

    const safeBaseName = sanitizeFileName(subject);
    const emlFileName = `${safeBaseName}_${Date.now()}.eml`;
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

  if (mode === 'send' && reportWb && stampedAny) {
    reportWb.save();
  }

  return results;
}

// Allow running as a script:
// node src/eml/generateEmail.js
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    // CLI args
    // Examples:
    //   node src/eml/generateEmail.js                -> draft (default)
    //   node src/eml/generateEmail.js --mode draft   -> draft
    //   node src/eml/generateEmail.js --mode send    -> send
    //   node src/eml/generateEmail.js --send         -> send
    //   node src/eml/generateEmail.js --draft        -> draft
    const args = process.argv.slice(2);

    let mode = 'draft';

    if (args.includes('--send')) mode = 'send';
    if (args.includes('--draft')) mode = 'draft';

    const modeIdx = args.indexOf('--mode');
    if (modeIdx !== -1 && args[modeIdx + 1]) {
      mode = String(args[modeIdx + 1]).toLowerCase();
    }

    if (!['draft', 'send'].includes(mode)) {
      throw new Error(
        `Invalid mode: ${mode}. Use --mode draft|send (or --draft/--send).`
      );
    }

    const res = await generateEmailDrafts({ mode });

    const ok = res.filter((r) => r.status === 'ok').length;
    const skipped = res.filter((r) => r.status === 'skipped').length;
    const warnings = res.filter((r) => r.status === 'warning').length;

    console.log(
      `${mode === 'send' ? 'Email send' : 'EML generation'} complete. ok=${ok} skipped=${skipped} warnings=${warnings}`
    );
    for (const r of res) {
      if (r.status === 'ok') {
        if (r.outPath) {
          // Draft mode
          console.log(
            `  [OK] Unit ${r.unitNumber} -> ${r.outPath} (to=${r.to}${r.cc?.length ? ` cc=${r.cc.join(',')}` : ''}) attachments=${r.attachments}`
          );
        } else {
          // Send mode
          console.log(
            `  [SENT] Unit ${r.unitNumber} messageId=${r.messageId} (to=${r.to}${r.cc?.length ? ` cc=${r.cc.join(',')}` : ''}) attachments=${r.attachments}`
          );
        }
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
