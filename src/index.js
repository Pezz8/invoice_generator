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

// Load env
// config();

// Main function
async function generateInvoices() {
  // Read or create the workbook
  const workbook = xlsx.readFile(reportPath);

  // Get or create the target sheet
  const worksheet = getSheet(workbook, sheetName);

  // Convert sheet data to JSON for processing
  const rows = xlsx.utils.sheet_to_json(worksheet);

  // Launch Puppeteer once for all invoices
  const browser = await puppeteer.launch();

  for (const row of rows) {
    const parsed = parseReportRow(row);
    if (!parsed) continue;

    const { unitNumber, invoiceNumber, type, formattedDate, totalAmount } =
      parsed;

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
