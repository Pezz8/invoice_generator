# Invoice Generation Automation

This project automates the process of generating customized invoices for different types of work orders (key orders, HVAC filter orders, regular work orders) based on an Excel sheet input. The program reads an Excel file containing work order information, selects the appropriate HTML template, and generates PDFs for each work order. 

## Features
- **Automated Invoice Generation**: Automatically creates PDF invoices from an Excel report with details like the unit number, invoice type, and work order date.
- **Multiple Invoice Types**: Generates different types of invoices (key order, HVAC filter, and work orders) based on the data in the Excel sheet.
- **File Skipping**: Checks if a PDF already exists for a given work order and skips generating it if the file is found, preventing duplicate files.
  
## How It Works
1. The program reads data from the Excel file (`report.xlsx`) that contains work orders, including information such as the unit number, type of work, and invoice number.
2. Based on the type of work (key order, filter order, or regular work order), the program selects the appropriate HTML template from the `invoices_templates` folder.
3. The program replaces placeholders in the template with dynamic data from the Excel file, such as the date, invoice number, and total amount.
4. Using Puppeteer, the HTML template is converted into a PDF file and saved in the `invoices` folder.
5. If a PDF for a specific work order already exists, the program skips creating a duplicate.

## Requirements
- Node.js
- `puppeteer`
- `read-excel-file`
- `moment`
- `fs`

## Setup and Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/invoice-automation.git
   cd invoice-automation

2. **Install dependencies**:
   ```bash
   npm install
   
3. **Place your Excel file and templates**:
   - Place your Excel file (`report.xlsx`) in the `resources` folder.
   - HTML templates for each type of invoice should be placed in `resources/invoices_templates`. The required templates are:
     - `work_order_temp.html` (for general work orders)
     - `key_order_temp.html` (for key-related work orders)
     - `filter_order_temp.html` (for HVAC filter-related work orders)

4. **Run the program**:
   ```bash
   node index.js

## Input Files

### Excel File (`report.xlsx`)
The Excel file should contain the following columns:
- **Column 1 (Unit Number)**: The unit number where the work was performed.
- **Column 2 (Date)**: The date the work was completed.
- **Column 3 (Invoice Number)**: The unique invoice number for the work order.
- **Column 4 (Parts Cost)**: The cost of the parts used.
- **Column 5 (Labor Cost)**: The labor cost for the work.
- **Column 6 (Type)**: The type of work (`K` for key orders, `F` for filter orders, or any other value for general work orders).

![Excel Screenshot](path_to_your_screenshot/report_screenshot.png)

### HTML Templates
Each invoice type uses a different HTML template, which includes placeholders for dynamic data. The templates should be structured as follows:

- **Work Order Template (`work_order_temp.html`)**
  - Contains placeholders such as `{{formattedToday}}`, `{{unitNumber}}`, `{{date}}`, `{{invoiceNumber}}`, and `{{totalAmount}}`.

- **Key Order Template (`key_order_temp.html`)**
  - Contains placeholders for key-related orders.

- **Filter Order Template (`filter_order_temp.html`)**
  - Contains placeholders for HVAC filter orders.

## Output

The program generates a PDF for each work order and saves it to the `invoices` folder. The naming convention for the PDF files is as follows:
- **Key Order PDF**: `Regatta {unitNumber} key order invoice {invoiceNumber}.pdf`
- **Filter Order PDF**: `Regatta {unitNumber} HVAC filter invoice {invoiceNumber}.pdf`
- **Work Order PDF**: `Regatta {unitNumber} work order invoice {invoiceNumber}.pdf`

Example output:

![PDF Screenshot](path_to_your_screenshot/pdf_output_screenshot.png)

## Folder Structure

invoice-automation/
│
├── resources/
│   ├── report.xlsx
│   └── invoices_templates/
│       ├── work_order_temp.html
│       ├── key_order_temp.html
│       └── filter_order_temp.html
├── invoices/
│   └── (Generated PDF files will be saved here)
├── index.js
├── package.json
└── README.md


## Dependencies

- [Puppeteer](https://pptr.dev/): Headless Chrome Node API for generating PDF files.
- [read-excel-file](https://www.npmjs.com/package/read-excel-file): Library for reading data from Excel files.
- [moment](https://momentjs.com/): JavaScript library for date formatting.
- Node's native `fs` module for file system operations.

## Example Use Case

1. The `report.xlsx` file is filled out with all work orders for the month.
2. The user runs the program, and the appropriate PDFs are automatically generated and saved in the `invoices` folder.
3. If an invoice already exists, the program skips that file, avoiding duplicate work.


