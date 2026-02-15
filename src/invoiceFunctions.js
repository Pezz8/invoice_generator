import fs from 'fs';
import { invoicePath, sheetName, workOrderPath } from '../config.js';

const getPath = (unitNumber, invoice, title) =>
  `${invoicePath}/${sheetName}/Regatta ${unitNumber} ${title} ${invoice}.pdf`;

// Function to replace placeholders in the HTML template with dynamic values
export function replaceTemplatePlaceholders(template, data) {
  if (!template) {
    console.error('❌ ERROR: Template is undefined!');
    console.log('data:', data);
    throw new Error('Template is undefined in replaceTemplatePlaceholders');
  }
  return template
    .replace('{{formattedToday}}', data.formattedToday)
    .replace('{{unitNumber}}', data.unitNumber)
    .replace('{{date}}', data.date)
    .replace('{{invoiceNumber}}', data.invoiceNumber)
    .replace('{{totalAmount}}', data.totalAmount)
    .replace('{{title}}', data.fileName);
}

// Function to read the HTML template
export function readTemplate(templatePath) {
  return fs.readFileSync(templatePath, 'utf-8');
}

// Make a new directory based on current month and year in MMM YY format
export function invoiceDirectory() {
  return fs.promises.mkdir(`${invoicePath}/${sheetName}`, { recursive: true });
}

// Generate full invoice path
export function getInvoiceAndPath(type, unitNumber, invoice, templates) {
  const upperType = type.toUpperCase();
  // console.log(upperType);
  switch (upperType) {
    case 'K':
      return {
        template: templates.kTemplate,
        pdfPath: getPath(unitNumber, invoice, 'Key Order Invoice'),
      };

    case 'F':
      return {
        template: templates.fTemplate,
        pdfPath: getPath(unitNumber, invoice, 'HVAC Filter Invoice'),
      };

    case 'V':
      return {
        template: templates.vTemplate,
        pdfPath: getPath(unitNumber, invoice, 'Vent Cleaning Invoice'),
      };

    default:
      return {
        template: templates.woTemplate,
        pdfPath: getPath(unitNumber, invoice, 'Work Order Invoice'),
      };
  }
}

// Find a PDF by invoice number inside invoices/<sheetName>/
// Assumes invoice numbers are unique within that folder.
export function getPathByInvoiceNumber(invoiceNumber) {
  const folder = `${invoicePath}/${sheetName}`;

  if (!fs.existsSync(folder)) return null;

  const files = fs.readdirSync(folder);
  for (const file of files) {
    if (!file.toLowerCase().endsWith('.pdf')) continue;

    // Match files that end with " <invoiceNumber>.pdf"
    if (file.endsWith(` ${invoiceNumber}.pdf`)) {
      return `${folder}/${file}`;
    }
  }

  return null;
}

export async function handleExistingPDF(pdfPath, mergePath, invoiceNumber) {
  // Check if the file already exists, and skip if it does
  if (fs.existsSync(pdfPath)) {
    const mergePath = `${workOrderPath}/${invoiceNumber}.pdf`;
    if (fs.existsSync(mergePath)) {
      await mergePDFs(pdfPath, invoiceNumber);
    }
    return true; // File already exists
  }
  return false; // File does not exist
}
