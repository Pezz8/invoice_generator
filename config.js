import moment from 'moment';
import commandLineArgs from 'command-line-args';

const optionDefinitions = [
  {
    name: 'month',
    alias: 'm',
    type: String,
    defaultOption: moment().format('MMM'),
  },
  {
    name: 'year',
    alias: 'y',
    type: String,
    defaultOption: moment().format('YY'),
  },
];

const options = commandLineArgs(optionDefinitions);

const __dirname = import.meta.dirname;

// Use the provided month and year or default to the current date
const currentDate = moment();
const month = options.month || currentDate.format('MMM'); // Default to current month
const year = options.year || currentDate.format('YY'); // Default to current year

// Mac OneDrive directory path
// export const invoicePath = `/Users/yourUserName/Library/CloudStorage/OneDrive-Personal/Documents/invoice_generator/invoices/`;
// export const reportPath = `/Users/yourUserName/Library/CloudStorage/OneDrive-Personal/Documents/invoice_generator/reports/report.xlsx`;
/* Local directory path*/
export const invoicePath = `${__dirname}/invoices`;
export const reportPath = `${__dirname}/resources/report.xlsx`;
export const workOrderPath = `${__dirname}/resources/work_orders`;
export const unitListPath = `${__dirname}/resources/unitList.xlsx`;
/* OneDrive Client for Linux directory path
const invoicePath = `/home/yourUserName/OneDrive/Documents/testing/invoices/`;
const reportPath = `/home/yourUserName/OneDrive/Documents/testing/reports/report.xlsx`;*/

// Templates path
export const woTemplatePath = `${__dirname}/resources/invoices_templates/work_order_temp.html`;
export const kTemplatePath = `${__dirname}/resources/invoices_templates/key_order_temp.html`;
export const fTemplatePath = `${__dirname}/resources/invoices_templates/filter_order_temp.html`;

// Current sheet
// export const sheetName = moment().format("MMM YY");
export const sheetName = `${month} ${year}`;
// Current date in MMMM Do YYYY format
export const formattedToday = moment().format('MMMM Do YYYY');
