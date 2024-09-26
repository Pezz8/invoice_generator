const readXlsxFile = require("read-excel-file/node");
const puppeteer = require("puppeteer");
const moment = require("moment");
const fs = require("fs");
const path = `${__dirname}/resources/report.xlsx`;
const woTemplatePath = `${__dirname}/resources/invoices_templates/work_order_temp.html`;
const kTemplatePath = `${__dirname}/resources/invoices_templates/key_order_temp.html`;
const fTemplatePath = `${__dirname}/resources/invoices_templates/filter_order_temp.html`;
const woTemplate = readTemplate(woTemplatePath);
const kTemplate = readTemplate(kTemplatePath);
const fTemplate = readTemplate(fTemplatePath);
const templates = { woTemplate, kTemplate, fTemplate };

// Function to replace placeholders in the HTML template with dynamic values
function replaceTemplatePlaceholders(template, data) {
  return template
    .replace("{{formattedToday}}", data.formattedToday)
    .replace("{{unitNumber}}", data.unitNumber)
    .replace("{{date}}", data.date)
    .replace("{{invoiceNumber}}", data.invoiceNumber)
    .replace("{{totalAmount}}", data.totalAmount);
}

// Function to read the HTML template
function readTemplate(templatePath) {
  return fs.readFileSync(templatePath, "utf-8");
}

// Generates the path for the PDF files
function getPath(unitNumber, invoice, title) {
  return `${__dirname}/invoices/${moment().format(
    "MMM YY"
  )}/Regatta ${unitNumber} ${title} ${invoice}.pdf`;
}

// Make a new directory based on current month and year in MMM YY format
function invoiceDirectory() {
  const folderName = `${__dirname}/invoices/${moment().format("MMM YY")}`;
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
  } catch (err) {
    console.error(err);
  }
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

readXlsxFile(path, { sheet: "July 24", dateFormat: "MM-DD-YYYY" }).then(
  async (rows) => {
    const results = rows.filter((row) => row[0] != null)?.toSpliced(0, 2);

    // Launch Puppeteer once for all invoices
    const browser = await puppeteer.launch();

    for (const row of results) {
      const formattedToday = moment().format("MMMM Do YYYY");
      const [unitNumber, date, invoiceNumber, parts, labor, type] = row;
      const formattedDate = moment(date).add(1, "day").format("L"); // Format date as MM-DD-YYYY
      const totalAmount = parts + labor;

      const { template, pdfPath } = getInvoiceAndPath(
        type,
        unitNumber,
        invoiceNumber,
        templates
      );

      const invoiceHTML = replaceTemplatePlaceholders(template, {
        formattedToday,
        unitNumber,
        formattedDate,
        invoiceNumber,
        totalAmount,
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
);
