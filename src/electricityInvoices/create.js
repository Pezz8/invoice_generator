import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient.js';

/**
 * Create a new electricity invoice.
 * @param {Object} invoiceData - { unitUuid, billingStart, billingEnd, totalUsage, supplyCharge, deliveryCharge, totalCharge }
 */
export async function createElectricityInvoice(invoiceData) {
  return await prisma.electricity_invoices.create({
    data: {
      uuid: randomUUID(),
      ...invoiceData,
    },
  });
}
