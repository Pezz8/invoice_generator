import fs from "fs";
import xlsx from "xlsx";
import { invoicePath, sheetName, reportPath } from "./my_config.js";

const getPath = (unitNumber, invoice, title) =>
  `${invoicePath}/${sheetName}/Regatta ${unitNumber} ${title} ${invoice}.pdf`;

const mkNewSheet = (workbook, sheetName) => {
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
};

// Function to replace placeholders in the HTML template with dynamic values
export function replaceTemplatePlaceholders(template, data) {
  return template
    .replace("{{formattedToday}}", data.formattedToday)
    .replace("{{unitNumber}}", data.unitNumber)
    .replace("{{date}}", data.date)
    .replace("{{invoiceNumber}}", data.invoiceNumber)
    .replace("{{totalAmount}}", data.totalAmount)
    .replace("{{title}}", data.fileName);
}

// Function to read the HTML template
export function readTemplate(templatePath) {
  return fs.readFileSync(templatePath, "utf-8");
}

// Make a new directory based on current month and year in MMM YY format
export function invoiceDirectory() {
  return fs.promises.mkdir(`${invoicePath}/${sheetName}`, { recursive: true });
}

export function getSheet(workbook, sheetName) {
  if (workbook.SheetNames.includes(sheetName)) {
    return workbook.Sheets[sheetName];
  } else {
    return mkNewSheet(workbook, sheetName);
  }
}

// Generate full invoice path
export function getInvoiceAndPath(type, unitNumber, invoice, templates) {
  const upperType = type.toUpperCase();
  // console.log(upperType);
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
