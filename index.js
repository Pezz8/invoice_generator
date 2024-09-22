const readXlsxFile = require("read-excel-file/node");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = `${__dirname}/resources/report.xlsx`;
const templatePath = `${__dirname}/resources/invoices_templates/work_order_temp.html`;
const today = new Date();

// Function to format a date object to MM-DD-YYYY format
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
}

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
    const template = readTemplate(templatePath);

    // Launch Puppeteer once for all invoices
    const browser = await puppeteer.launch();

    for (const row of results) {
      const formattedToday = formatDate(today);
      const unitNumber = row[0];
      let date = row[1];
      const invoiceNumber = row[2];
      const parts = row[3];
      const labor = row[4];

      if (date instanceof Date) {
        date.setDate(date.getDate() + 1);
        date = formatDate(date); // Format date as MM-DD-YYYY
      }

      const totalAmount = parts + labor;

      // Replace placeholders in the HTML template
      const invoiceHTML = replaceTemplatePlaceholders(template, {
        formattedToday,
        unitNumber,
        date,
        invoiceNumber,
        totalAmount,
      });

      // Create a new page in Puppeteer for each invoice
      const page = await browser.newPage();
      await page.setContent(invoiceHTML);

      // Save the PDF to file
      const pdfPath = `${__dirname}/invoices/Regatta ${unitNumber} work order invoice ${invoiceNumber}.pdf`;
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
