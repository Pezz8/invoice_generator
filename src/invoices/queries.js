import { errorHandler } from '../db/errorHandler';
import prisma from '../db/prismaClient';

// Get all invoices
export async function getAllInvoices() {
  try {
    return await prisma.invoices.findMany();
  } catch (e) {
    return errorHandler(e);
  }
}

// Find invoice by UUID
export async function getInvoiceByUUID(invoiceUuid) {
  try {
    return await prisma.invoices.findUnique({
      where: { uuid: invoiceUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// List all invoices for a specific unit
export async function getInvoicesByUnitUUID(unitUuid) {
  try {
    return await prisma.invoices.findMany({
      where: { unit_uuid: unitUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// List all invoices created within a date range (optional for reports)
export async function getInvoicesByDateRange(startDate, endDate) {
  try {
    return await prisma.invoices.findMany({
      where: {
        date_created: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  } catch (e) {
    return errorHandler(e);
  }
}
