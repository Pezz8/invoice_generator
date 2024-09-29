const moment = require("moment");

// Mac OneDrive directory path
const invoicePath = `/Users/yourUserName/Library/CloudStorage/OneDrive-Personal/Documents/invoice_generator/invoices/`;
const reportPath = `/Users/yourUserName/Library/CloudStorage/OneDrive-Personal/Documents/invoice_generator/reports/report.xlsx`;
/* Local directory path
const invoicePath = `${__dirname}/invoices`;
const reportPath = `${__dirname}/resources/report.xlsx`;*/
/* OneDrive Client for Linux directory path
const invoicePath = `/home/yourUserName/OneDrive/Documents/testing/invoices/`;
const reportPath = `/home/yourUserName/OneDrive/Documents/testing/reports/report.xlsx`;*/

// Templates path
const woTemplatePath = `${__dirname}/resources/invoices_templates/work_order_temp.html`;
const kTemplatePath = `${__dirname}/resources/invoices_templates/key_order_temp.html`;
const fTemplatePath = `${__dirname}/resources/invoices_templates/filter_order_temp.html`;

// Current sheet
const sheetName = moment().format("MMM YY");
// Current date in MMMM Do YYYY format
const formattedToday = moment().format("MMMM Do YYYY");

// Export the paths so they can be used in other files
module.exports = {
  invoicePath,
  reportPath,
  woTemplatePath,
  kTemplatePath,
  fTemplatePath,
  sheetName,
  formattedToday,
};
