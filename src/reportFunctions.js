import xlsx from "xlsx";
import { reportPath } from "../config.js";

const mkNewSheet = (workbook, sheetName) => {
  const headers = [
    [
      "Unit Number",
      "Order Date",
      "Invoice Number",
      "Parts Cost",
      "Labor Cost",
      "Invoice Type",
    ],
  ];
  const newSheet = xlsx.utils.aoa_to_sheet(headers);
  xlsx.utils.book_append_sheet(workbook, newSheet, sheetName);
  xlsx.writeFile(workbook, reportPath);
  return newSheet;
};

export function getSheet(workbook, sheetName) {
  if (workbook.SheetNames.includes(sheetName)) {
    return workbook.Sheets[sheetName];
  } else {
    return mkNewSheet(workbook, sheetName);
  }
}
