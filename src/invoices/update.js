import prisma from '../db/prismaClient.js';

/**
 * Update an invoice by UUID.
 * @param {string} invoiceUuid - UUID of the invoice
 * @param {Object} updates - Fields to update (labor_cost, date_completed, etc.)
 */
export async function updateInvoice(invoiceUuid, updates) {
  return await prisma.invoices.update({
    where: { uuid: invoiceUuid },
    data: updates,
  });
}
