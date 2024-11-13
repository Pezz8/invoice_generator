# Invoice Generator and PDF Merger

This project automates the generation of invoices from an Excel file and merges them with corresponding work order PDFs. It uses Puppeteer for PDF generation, pdf-merger-js for merging PDFs, and command-line arguments to handle date-based configurations.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [Acknowledgements](#acknowledgements)

## Overview

The Invoice Generator automates the following tasks:

1. Reads data from an Excel file to generate invoice PDFs using HTML templates.
2. Merges each invoice PDF with its corresponding work order PDF, if available.
3. Deletes the work order PDF after merging to keep the directory clean.

## Installation

To run this project on your local machine, follow these steps:

1. **Clone the repository:**

   ```bash
    git clone https://github.com/Pezz8/invoice_generator.git
    cd invoice_generator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

This command will install all required Node.js packages, such as `xlsx`, `puppeteer`, `pdf-merger-js`, `moment`, `fs`, and `command-line-args`.

3. **Ensure you have Node.js and npm installed:**

   - You can check if Node.js and npm are installed by running:

     ```bash
       node -v
       npm -v
     ```

- If they are not installed, download and install them from [Node.js](https://nodejs.org/).

4. **Set up the directory structure:**
   - Make sure your directories for `invoices`, `reports`, and `work_orders` are correctly set up in your project directory. The structure should look like this:
     ```
     resources/
     ├── invoices_templates/
     │   ├── work_order_temp.html
     │   ├── key_order_temp.html
     │   └── filter_order_temp.html
     ├── report.xlsx
     └── work_orders/
     ```

## Usage

1.  **Run the Invoice Generator:**
    ```bash
       node index.js
    ```

This command generates invoices based on the data in `report.xlsx` and merges them with the corresponding work order PDFs.

2. **Using Command-Line Arguments:**

   - You can specify the month and year to customize the current sheet name using:

     ```bash
         node index.js -m Jan -y 24
     ```

- `-m` or `--month`: Specify the month (default: current month)
- `-y` or `--year`: Specify the year (default: current year)

## Configuration

The configuration settings for paths, date formatting, and command-line arguments are managed in `config.js`.

### config.js

- **Paths**: You can set paths for invoices, reports, work orders, and HTML templates in the configuration file.
- **Date Handling**: `moment.js` is used to handle and format dates.
- **Command-Line Arguments**: The `command-line-args` package is used to parse and handle arguments for specifying the month and year.

## Project Structure

```bash
.
├── config.js # Configuration file for paths and date settings
├── index.js # Main script for generating and merging PDFs
├── invoiceFunctions.js # Utility functions for handling invoices and templates
├── woMerger.js # Script for merging and deleting work order PDFs
├── resources/ # Directory containing templates and work order PDFs
│ ├── invoices_templates/ # HTML templates for generating invoices
│ └── work_orders/ # Directory for work order PDFs
└── package.json # Project metadata and dependencies
```

## Dependencies

The project uses the following Node.js packages:

- **xlsx**: For reading and writing Excel files.
- **puppeteer**: For generating PDFs from HTML templates.
- **pdf-merger-js**: For merging PDFs.
- **moment**: For date formatting and handling.
- **fs**: For file system operations.
- **command-line-args**: For handling command-line arguments.

## Acknowledgements

- [Node.js](https://nodejs.org/)
- [Puppeteer](https://github.com/puppeteer/puppeteer)
- [pdf-merger-js](https://www.npmjs.com/package/pdf-merger-js)
- [moment](https://momentjs.com/)
- [xlsx](https://github.com/SheetJS/sheetjs)

---
