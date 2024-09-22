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

// Function to read the HTML template
function readTemplate(templatePath) {
  return fs.readFileSync(templatePath, "utf-8");
}

readXlsxFile(path, { sheet: "July 24", dateFormat: "MM-DD-YYYY" }).then(
  async (rows) => {
    const results = rows.filter((row) => row[0] != null).toSpliced(0, 2);

    // Read the HTML template from file
    const woTemplate = readTemplate(woTemplatePath);
    const kTemplate = readTemplate(kTemplatePath);
    const fTemplate = readTemplate(fTemplatePath);

    // Launch Puppeteer once for all invoices
    const browser = await puppeteer.launch();

    for (const row of results) {
      //const formattedToday = formatDate(today);
      let invoiceHTML = "";
      let pdfPath = "";
      const formattedToday = moment(today).format("MMMM Do YYYY");
      const unitNumber = row[0];
      let date = row[1];
      const invoiceNumber = row[2];
      const parts = row[3];
      const labor = row[4];
      const type = row[5];

      // Reads date from xlsx file one day short. Adding a day.
      if (date instanceof Date) {
        date.setDate(date.getDate() + 1);
        date = moment(date).format("L"); // Format date as MM-DD-YYYY
      }

      const totalAmount = parts + labor;

      if (type.toUpperCase() == "W") {
        // Replace placeholders in the HTML template
        invoiceHTML = replaceTemplatePlaceholders(woTemplate, {
          formattedToday,
          unitNumber,
          date,
          invoiceNumber,
          totalAmount,
        });
        pdfPath = `${__dirname}/invoices/Regatta ${unitNumber} work order invoice ${invoiceNumber}.pdf`;
      } else if (type.toUpperCase() == "K") {
        // Replace placeholders in the HTML template
        invoiceHTML = replaceTemplatePlaceholders(kTemplate, {
          formattedToday,
          unitNumber,
          date,
          invoiceNumber,
          totalAmount,
        });
        pdfPath = `${__dirname}/invoices/Regatta ${unitNumber} key order invoice ${invoiceNumber}.pdf`;
      } else if (type.toUpperCase() == "F") {
        // Replace placeholders in the HTML template
        invoiceHTML = replaceTemplatePlaceholders(fTemplate, {
          formattedToday,
          unitNumber,
          date,
          invoiceNumber,
          totalAmount,
        });
        pdfPath = `${__dirname}/invoices/Regatta ${unitNumber} HVAC filter invoice ${invoiceNumber}.pdf`;
      }

      // Create a new page in Puppeteer for each invoice
      const page = await browser.newPage();
      await page.setContent(invoiceHTML);

      // Save the PDF to file
      // pdfPath = `${__dirname}/invoices/Regatta ${unitNumber} work order invoice ${invoiceNumber}.pdf`;
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
