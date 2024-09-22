const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = `${__dirname}/resources/report.xlsx`;
// const woTempPath = `${__dirname}/resources/invoices_templates/work_order_temp.html`;
const today = new Date();

// Function to format a date object to MM-DD-YYYY format
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0"); // Get day and pad with zero if needed
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed in JS, so add 1
  const year = date.getFullYear(); // Get full year

  return `${month}/${day}/${year}`; // Return formatted date
}

readXlsxFile(path, { sheet: "July 24", dateFormat: "MM/DD/YYYY" }).then(
  (rows) => {
    const results = rows.filter((row) => row[0] != null).toSpliced(0, 2);

    results.forEach(async (row, rowIndex) => {
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

      // Save the PDF to file
      const pdfPath = `${__dirname}/invoices/Regatta ${unitNumber} word order invoice ${invoiceNumber}.pdf`;

      const outputString = `

      12 Museum WAY
      Cambridge MA  617-722-4004

      ${formattedToday}

      Unit ${unitNumber}

      Dear Resident:

      Attached please find an invoice for a work order that was completed
      in your unit on ${date} in the amount of $ ${parts + labor}.00.

      Checks or money orders should be payable to Regatta Riverview and can be left at
      the front desk or mailed to the address above.
      We do not accept cash or debit/credit cards.

      Owners can also pay the invoice through their on-line CINC account as a one-time
      payment. The charge will be posted to your account at month end, if paying the
      invoice sooner the credit will be applied once the charge is posted.

      All invoices are posted to the owner's account.  Any charges that owners want
      to hold their tenants responsible for are between the owner and the tenant.

      Sincerely,
      Management Office
      Regatta Riverview Condominium`;

      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream(pdfPath));
      doc.fontSize(12).text(outputString);
      doc.end();

      console.log(`PDF generated: ${pdfPath}`);
    });
  }
);
