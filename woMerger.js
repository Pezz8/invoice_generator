import fs from "fs";
import pdfMerger from "pdf-merger-js";
import { workOrderPath } from "./config.js";

// Function to merge PDFs
async function mergePDFs(pdfPath, invoiceNumber) {
  const merger = new pdfMerger();

  // Construct the path to the work order PDF
  const file1Path = pdfPath;
  const file2Path = `${workOrderPath}/${invoiceNumber}.pdf`;

  // Check if the work order PDF exists
  if (!fs.existsSync(file2Path)) {
    console.log(`Work order PDF not found: ${file2Path}. Skipping merge.`);
    return;
  }

  try {
    // Add the generated invoice PDF and the work order PDF to the merger
    await merger.add(file1Path);
    await merger.add(file2Path);

    // Save the merged PDF, replacing the original invoice PDF
    await merger.save(file1Path);
    console.log(`Merged PDF saved: ${file1Path}`);

    // Delete the work order pdf after merging
    fs.unlinkSync(file2Path, (err) => {
      if (err) {
        console.error(`Failed to delete ${file2Path}: ${err}`);
      } else {
        console.log(`${file2Path} deleted successfully`);
      }
    });
  } catch (err) {
    console.error(`Error merging PDFs: ${err}`);
  }
}

export { mergePDFs };
