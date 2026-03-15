import moment from 'moment';
import { normalizeUnit } from '../utils/normalizeData.js';

/**
 * Parse a single row from report.xlsx into a normalized invoice job object.
 *
 * Returns `null` if the row is missing required fields.
 */
export function parseReportRow(row) {
  const {
    'Unit Number': unitNumberRaw,
    'Order Date': dateRaw,
    'Invoice Number': invoiceNumberRaw,
    'Parts Cost': partsRaw,
    'Labor Cost': laborRaw,
    'Invoice Type': typeRaw,
  } = row || {};

  const unitNumber = normalizeUnit(unitNumberRaw);
  const invoiceNumber =
    invoiceNumberRaw != null ? String(invoiceNumberRaw).trim() : '';
  const type = typeRaw != null ? String(typeRaw).trim() : '';

  // Minimal required fields to generate an invoice
  if (!unitNumber || !invoiceNumber || !type) return null;

  const formattedDate = normalizeReportDate(dateRaw);

  // Ensure parts and labor are numbers, defaulting to 0 if they are not valid
  const partsCost = parseFloat(partsRaw) || 0;
  const laborCost = parseFloat(laborRaw) || 0;

  const totalAmount = partsCost + laborCost;

  return {
    unitNumber,
    invoiceNumber,
    type,
    formattedDate,
    partsCost,
    laborCost,
    totalAmount,
  };
}

function normalizeReportDate(date) {
  // Preserve existing behavior from index.js
  if (typeof date === 'number') {
    // Excel serial date -> JS Date
    return moment(new Date((date - (25567 + 1)) * 86400 * 1000)).format('L');
  }

  if (!date) return '';

  // If it's already a valid date, format it
  return moment(date).add(1, 'day').format('L');
}
