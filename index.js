const readXlsxFile = require("read-excel-file/node");
const puppeteer = require("puppeteer");
const moment = require("moment");
const fs = require("fs");
const path = `${__dirname}/resources/report.xlsx`;
const woTemplatePath = `${__dirname}/resources/invoices_templates/work_order_temp.html`;
const kTemplatePath = `${__dirname}/resources/invoices_templates/key_order_temp.html`;
const fTemplatePath = `${__dirname}/resources/invoices_templates/filter_order_temp.html`;
const today = new Date();

// Function to replace placeholders in the HTML template with dynamic values
function replaceTemplatePlaceholders(template, data) {
  return template
    .replace("{{formattedToday}}", data.formattedToday)
    .replace("{{unitNumber}}", data.unitNumber)
    .replace("{{date}}", data.date)
    .replace("{{invoiceNumber}}", data.invoiceNumber)
    .replace("{{totalAmount}}", data.totalAmount);
}

// Function to check if a file already exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Function to read the HTML template
function readTemplate(templatePath) {
  return fs.readFileSync(templatePath, "utf-8");
}

function getInvoiceAndPath(type, unitNumber, invoiceNumber, templates) {
  if (type.toUpperCase() == "K") {
    return {
      template: templates.kTemplate,
      pdfPath: `${__dirname}/invoices/Regatta ${unitNumber} Key Order Invoice ${invoiceNumber}.pdf`,
    };
  } else if (type.toUpperCase() == "F") {
    return {
      template: templates.fTemplate,
      pdfPath: `${__dirname}/invoices/Regatta ${unitNumber} HVAC Filter Invoice ${invoiceNumber}.pdf`,
    };
  } else {
    return {
      template: templates.woTemplate,
      pdfPath: `${__dirname}/invoices/Regatta ${unitNumber} Work Order Invoice ${invoiceNumber}.pdf`,
    };
  }
}

readXlsxFile(path, { sheet: "July 24", dateFormat: "MM-DD-YYYY" }).then(
  async (rows) => {
    const results = rows.filter((row) => row[0] != null)?.toSpliced(0, 2);

    // Read the HTML template from file
    const woTemplate = readTemplate(woTemplatePath);
    const kTemplate = readTemplate(kTemplatePath);
    const fTemplate = readTemplate(fTemplatePath);
    const templates = { woTemplate, kTemplate, fTemplate };

    // Launch Puppeteer once for all invoices
    const browser = await puppeteer.launch();

    for (const row of results) {
      //const formattedToday = formatDate(today);
      const formattedToday = moment(today).format("MMMM Do YYYY");
      let [unitNumber, date, invoiceNumber, parts, labor, type] = row;

      // Reads date from xlsx file one day short. Adding a day.
      if (date instanceof Date) {
        date.setDate(date.getDate() + 1);
        date = moment(date).format("L"); // Format date as MM-DD-YYYY
      }

      const totalAmount = parts + labor;

      const { template, pdfPath } = getInvoiceAndPath(
        type,
        unitNumber,
        invoiceNumber,
        templates,
      );

      const invoiceHTML = replaceTemplatePlaceholders(template, {
        formattedToday,
        unitNumber,
        date,
        invoiceNumber,
        totalAmount,
      });

      // Check if the file already exists, and skip if it does
      if (fileExists(pdfPath)) {
        // console.log(
        //   `Invoice for Unit ${unitNumber} already exists. Skipping...`,
        // );
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
  },
);
