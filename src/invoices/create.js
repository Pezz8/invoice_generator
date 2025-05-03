import { randomUUID } from 'crypto';
import prisma from '../db/prismaClient.js';

/**
 * Create a new invoice.
 * @param {Object} invoiceData - Required data: unit_uuid, assignment_uuid (optional), labor_hours, labor_cost, date_created, date_completed
 */
export async function createInvoice(
  unitUuid,
  laborHours,
  laborCost,
  totalCost,
  jobDate,
  invoiceParts
) {
  return await prisma.invoices.create({
    data: {
      uuid: randomUUID(),
      unitUuid,
      laborHours,
      laborCost,
      totalCost,
      jobDate,
      invoiceParts,
    },
  });
}
