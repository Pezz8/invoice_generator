const fs = require("fs");
const xlsx = require("xlsx");

const { invoicePath, sheetName } = require("./config");

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
  // return `${testPath}/Regatta ${unitNumber} ${title} ${invoice}.pdf`;
  return `${invoicePath}/${sheetName}/Regatta ${unitNumber} ${title} ${invoice}.pdf`;
}

// Make a new directory based on current month and year in MMM YY format
function invoiceDirectory() {
  const folderName = `${invoicePath}/${sheetName}`;
  try {
    if (!fs.existsSync(invoicePath)) {
      fs.mkdirSync(invoicePath);
      fs.mkdirSync(folderName);
    } else if (!fs.existsSync(folderName)) {
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
      "Order Date",
      "Invoice Number",
      "Parts Cost",
      "Labor Cost",
      "Invoice Type",
    ],
  ];
  const newSheet = xlsx.utils.aoa_to_sheet(headers);
  xlsx.utils.book_append_sheet(workbook, newSheet, sheetName);
  xlsx.writeFile(workbook, reportPath);
  return newSheet;
}

// Generate full invoice path
function getInvoiceAndPath(type, unitNumber, invoice, templates) {
  const upperType = String(type).toUpperCase();
  switch (upperType) {
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

module.exports = {
  replaceTemplatePlaceholders,
  readTemplate,
  invoiceDirectory,
  invoiceDirectory,
  getInvoiceAndPath,
  getSheet,
};
