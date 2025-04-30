import prisma from '../db/prismaClient.js';
import { errorHandler } from '../db/errorHandler';

/**
 * Get all electricity invoices
 */
export async function getAllElectricityInvoices() {
  try {
    return await prisma.electricityInvoices.findMany();
  } catch (e) {
    return errorHandler(e);
  }
}

/**
 * Get an electricity invoice by UUID
 */
export async function getElectricityInvoiceByUUID(invoiceUuid) {
  try {
    return await prisma.electricityInvoices.findUnique({
      where: { uuid: invoiceUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}

/**
 * Get electricity invoices for a specific unit
 */
export async function getElectricityInvoicesByUnitUUID(unitUuid) {
  try {
    return await prisma.electricityInvoices.findMany({
      where: { unitUuid: unitUuid },
    });
  } catch (e) {
    return errorHandler(e);
  }
}
