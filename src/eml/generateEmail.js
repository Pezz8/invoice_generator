import fs from 'fs/promises';
import path from 'path';
import nodemailer from 'nodemailer';

import { readSheetRows } from '../data/excel.js';
import { parseReportRow } from '../data/reportParser.js';
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

  // Draft mode uses Nodemailer as a MIME builder (no sending)
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
