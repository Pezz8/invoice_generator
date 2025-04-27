import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient.js';

/**
 * Create a new electricity invoice.
 * @param {Object} invoiceData - { unit_uuid, billing_start, billing_end, total_usage, supply_charge, delivery_charge, total_charge }
 */
export async function createElectricityInvoice(invoiceData) {
  return await prisma.electricity_invoices.create({
    data: {
      uuid: randomUUID(),
      ...invoiceData,
    },
  });
}
