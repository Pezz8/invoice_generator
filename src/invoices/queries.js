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

// Find an invoice by invoice number
export async function getInvoiceByNumber(invoiceNumber) {
  try {
    return await prisma.invoices.findUnique({
      where: { invoiceNumber },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// List all invoices for a specific unit UUID
export async function getInvoicesByUnitUUID(unitUuid) {
  try {
    return await prisma.invoices.findMany({
      where: { unitUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// List all invoices for a specific unit number
export async function getInvoicesByUnitNumber(unitNumber) {
  try {
    return await prisma.invoices.findMany({
      where: {
        units: {
          unitNumber: unitNumber,
        },
      },
      include: {
        units: true,
      },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

// List all invoices that are active
export async function getActiveInvoices() {
  try {
    return await prisma.invoices.findMany({
      where: {
        active: true,
      },
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
