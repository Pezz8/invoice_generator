import xlsx from "xlsx";
import puppeteer from "puppeteer";
import moment from "moment";
import fs from "fs";
import path from "path";

// Import the paths from the configuration file
import {
  reportPath,
  woTemplatePath,
  kTemplatePath,
  fTemplatePath,
  sheetName,
  formattedToday,
} from "./config.js";

import {
  replaceTemplatePlaceholders,
  readTemplate,
  invoiceDirectory,
  getInvoiceAndPath,
  getSheet,
} from "./invoiceFunctions.js";

// Loading temmplates
const woTemplate = readTemplate(woTemplatePath);
const kTemplate = readTemplate(kTemplatePath);
const fTemplate = readTemplate(fTemplatePath);
const templates = { woTemplate, kTemplate, fTemplate };

// Update latest directory
invoiceDirectory();

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
    const {
      "Unit Number": unitNumber,
      "Order Date": date,
      "Invoice Number": invoiceNumber,
      "Parts Cost": parts,
      "Labor Cost": labor,
      "Invoice Type": type,
    } = row;

    // Format date as MM-DD-YYYY
    const formattedDate = moment(date).add(1, "day").format("L");

    // Ensure parts and labor are numbers, defaulting to 0 if they are not valid
    const partsCost = parseFloat(parts) || 0;
    const laborCost = parseFloat(labor) || 0;

    const totalAmount = partsCost + laborCost;

    const { template, pdfPath } = getInvoiceAndPath(
      type,
      unitNumber,
      invoiceNumber,
      templates,
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

    // Check if the file already exists, and skip if it does
    if (fs.existsSync(pdfPath)) {
      continue; // Skip to the next iteration if the file exists
    }

    // Create a new page in Puppeteer for each invoice
    const page = await browser.newPage();
    await page.setContent(invoiceHTML);

    // Save the PDF to file
    await page.pdf({
      path: pdfPath,
      format: "LETTER",
      printBackground: true,
    });

    console.log(`PDF generated: ${pdfPath}`);

    // Close the page after saving the PDF
    await page.close();
  }

  // Close Puppeteer browser after all PDFs are generated
  await browser.close();
}

// Run the invoice generation process
generateInvoices();
