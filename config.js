import moment from "moment";

const __dirname = import.meta.dirname;

// Mac OneDrive directory path
export const invoicePath = `/Users/yourUserName/Library/CloudStorage/OneDrive-Personal/Documents/invoice_generator/invoices/`;
export const reportPath = `/Users/yourUserName/Library/CloudStorage/OneDrive-Personal/Documents/invoice_generator/reports/report.xlsx`;
/* Local directory path
const invoicePath = `${__dirname}/invoices`;
const reportPath = `${__dirname}/resources/report.xlsx`;
/* OneDrive Client for Linux directory path
const invoicePath = `/home/yourUserName/OneDrive/Documents/testing/invoices/`;
const reportPath = `/home/yourUserName/OneDrive/Documents/testing/reports/report.xlsx`;*/

// Templates path
export const woTemplatePath = `${__dirname}/resources/invoices_templates/work_order_temp.html`;
export const kTemplatePath = `${__dirname}/resources/invoices_templates/key_order_temp.html`;
export const fTemplatePath = `${__dirname}/resources/invoices_templates/filter_order_temp.html`;

// Current sheet
export const sheetName = moment().format("MMM YY");
// Current date in MMMM Do YYYY format
export const formattedToday = moment().format("MMMM Do YYYY");
