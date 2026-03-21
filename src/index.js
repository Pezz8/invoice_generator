import * as xlsx from 'xlsx';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
xlsx.set_fs(fs);

// Import the paths from the configuration file
import {
  reportPath,
  woTemplatePath,
  kTemplatePath,
  fTemplatePath,
  vTemplatePath,
  sheetName,
  formattedToday,
  workOrderPath,
} from '../config.js';

import { getSheet } from './reportFunctions.js';

import { handleExistingPDF } from './invoiceFunctions.js';

import { parseReportRow } from './data/reportParser.js';

import { loadPartsCatalog } from './data/partsCatalog.js';
import { parsePartsUsed } from './data/partsCatalogParser.js';
import { buildPartsRows } from './data/partsRowBuilder.js';

import { checkExcelFileSafe } from './utils/fileSafety.js';

import {
  replaceTemplatePlaceholders,
  readTemplate,
  invoiceDirectory,
  getInvoiceAndPath,
} from './invoiceFunctions.js';
import { mergePDFs } from './woMerger.js';
// import { config } from 'dotenv';

// Loading templates
const woTemplate = readTemplate(woTemplatePath);
const kTemplate = readTemplate(kTemplatePath);
const fTemplate = readTemplate(fTemplatePath);
const vTemplate = readTemplate(vTemplatePath);
const templates = { woTemplate, kTemplate, fTemplate, vTemplate };

function buildPartsSectionHtml(partsRows = []) {
  if (!partsRows.length) {
    return '';
  }

  const rowsHtml = partsRows
    .map(
      (row) => `
        <tr>
          <td>${row.code}</td>
          <td>${row.name}</td>
          <td>${row.qty}</td>
          <td>$${Number(row.unitPrice).toFixed(2)}</td>
          <td>$${Number(row.lineTotal).toFixed(2)}</td>
        </tr>
      `
    )
    .join('');

  return `
    <div class="parts-section">
      <table>
        <thead>
          <tr>
            <th>Part Code</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

// Load env
// config();

// Main function
async function generateInvoices() {
  // Read or create the workbook
  checkExcelFileSafe(reportPath, 'Report workbook');
  const workbook = xlsx.readFile(reportPath);

  // Get or create the target sheet
  const worksheet = getSheet(workbook, sheetName);

  // Convert sheet data to JSON for processing
  const rows = xlsx.utils.sheet_to_json(worksheet);

  // Load parts catalog (used for itemized parts in invoices)
  const partsByCode = loadPartsCatalog();

  // Launch Puppeteer once for all invoices
  const browser = await puppeteer.launch();

  for (const row of rows) {
    const parsed = parseReportRow(row);
    if (!parsed) continue;

    // Parse and build parts rows if "Parts Used" is present
    let partsRows = [];
    if (parsed?.partsUsedRaw) {
      const parsedParts = parsePartsUsed(parsed.partsUsedRaw);
      const partsResult = buildPartsRows(parsedParts, partsByCode);
      partsRows = partsResult.rows;
    }

    const { unitNumber, invoiceNumber, type, formattedDate, totalAmount } =
      parsed;

    const partsSectionHtml = buildPartsSectionHtml(partsRows);

    const { template, pdfPath } = getInvoiceAndPath(
      type,
      unitNumber,
      invoiceNumber,
      templates
    );

    const fileName = path.basename(pdfPath);
    const invoiceHTML = replaceTemplatePlaceholders(template, {
      formattedToday,
      unitNumber,
      date: formattedDate,
      invoiceNumber,
      totalAmount,
      fileName,
      partsSectionHtml,
    });

    if (
      await handleExistingPDF(
        pdfPath,
        `${workOrderPath}/${invoiceNumber}.pdf`,
        invoiceNumber
      )
    ) {
      continue;
    }

    // Create a new page in Puppeteer for each invoice
    const page = await browser.newPage();
    await page.setContent(invoiceHTML);

    // Save the PDF to file
    await page.pdf({
      path: pdfPath,
      format: 'LETTER',
      printBackground: true,
    });

    console.log(`PDF generated: ${pdfPath}`);
    // Close the page after saving the PDF
    await page.close();
    // Calling merging function
    await mergePDFs(pdfPath, invoiceNumber);
  }

  // Close Puppeteer browser after all PDFs are generated
  await browser.close();
}

// Run the invoice generation process
invoiceDirectory().then(generateInvoices);
