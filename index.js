const xlsx = require("xlsx");
const puppeteer = require("puppeteer");
const moment = require("moment");
const fs = require("fs");
const pathFn = require("path");
const path = `/home/cristian/OneDrive/Documents/testing/report/report.xlsx`;
const woTemplatePath = `${__dirname}/resources/invoices_templates/work_order_temp.html`;
const kTemplatePath = `${__dirname}/resources/invoices_templates/key_order_temp.html`;
const fTemplatePath = `${__dirname}/resources/invoices_templates/filter_order_temp.html`;
const woTemplate = readTemplate(woTemplatePath);
const kTemplate = readTemplate(kTemplatePath);
const fTemplate = readTemplate(fTemplatePath);
const templates = { woTemplate, kTemplate, fTemplate };
const sheetName = moment().format("MMM YY");
const testPath = `/home/cristian/OneDrive/Documents/testing`;

// Function to replace placeholders in the HTML template with dynamic values
function replaceTemplatePlaceholders(template, data) {
  return template
    .replace("{{formattedToday}}", data.formattedToday)
    .replace("{{unitNumber}}", data.unitNumber)
    .replace("{{date}}", data.date)
    .replace("{{invoiceNumber}}", data.invoiceNumber)
    .replace("{{totalAmount}}", data.totalAmount)
    .replace("{{title}}", data.fileName);
}

// Function to read the HTML template
function readTemplate(templatePath) {
  return fs.readFileSync(templatePath, "utf-8");
}

// Generates the path for the PDF files
function getPath(unitNumber, invoice, title) {
  return `${testPath}/Regatta ${unitNumber} ${title} ${invoice}.pdf`;
  // return `${__dirname}/invoices/${sheetName}/Regatta ${unitNumber} ${title} ${invoice}.pdf`;
}

// Make a new directory based on current month and year in MMM YY format
function invoiceDirectory() {
  const folderName = `${__dirname}/invoices/${sheetName}`;
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
  } catch (err) {
    console.error(err);
  }
}

function getSheet(workbook, sheetName) {
  if (workbook.SheetNames.includes(sheetName)) {
    return workbook.Sheets[sheetName];
  } else {
    return mkNewSheet(workbook, sheetName);
  }
}

function mkNewSheet(workbook, sheetName) {
  const headers = [
    [
      "Unit Number",
      "Date",
      "Invoice Number",
      "Parts Cost",
      "Labor Cost",
      "Type",
    ],
  ];
  const newSheet = xlsx.utils.aoa_to_sheet(headers);
  xlsx.utils.book_append_sheet(workbook, newSheet, sheetName);
  xlsx.writeFile(workbook, path);
  return newSheet;
}

// Generate full invoice path
function getInvoiceAndPath(type, unitNumber, invoice, templates) {
  switch (type.toUpperCase()) {
    case "K":
      return {
        template: templates.kTemplate,
        pdfPath: getPath(unitNumber, invoice, "Key Order Invoice"),
      };

    case "F":
      return {
        template: templates.fTemplate,
        pdfPath: getPath(unitNumber, invoice, "HVAC Filter Invoice"),
      };

    default:
      return {
        template: templates.woTemplate,
        pdfPath: getPath(unitNumber, invoice, "Work Order Invoice"),
      };
  }
}

// Update latest directory
invoiceDirectory();

// Main function
async function generateInvoices() {
  // Read or create the workbook
  const workbook = xlsx.readFile(path);

  // Get or create the target sheet
  const worksheet = getSheet(workbook, sheetName);

  // Convert sheet data to JSON for processing
  const rows = xlsx.utils.sheet_to_json(worksheet);

  // Launch Puppeteer once for all invoices
  const browser = await puppeteer.launch();

  for (const row of rows) {
    const formattedToday = moment().format("MMMM Do YYYY");
    const [unitNumber, date, invoiceNumber, parts, labor, type] = [
      row["Unit Number"],
      row["Date"],
      row["Invoice Number"],
      row["Parts Cost"],
      row["Labor Cost"],
      row["Type"],
    ];
    const formattedDate = moment(date).add(1, "day").format("L"); // Format date as MM-DD-YYYY

    // Ensure parts and labor are numbers, defaulting to 0 if they are not valid
    const partsCost = parseFloat(parts) || 0;
    const laborCost = parseFloat(labor) || 0;

    const totalAmount = partsCost + laborCost;

    const { template, pdfPath } = getInvoiceAndPath(
      type,
      unitNumber,
      invoiceNumber,
      templates
    );

    const fileName = pathFn.basename(pdfPath);

    const invoiceHTML = replaceTemplatePlaceholders(template, {
      formattedToday,
      unitNumber,
      formattedDate,
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
