import prisma from '../db/prismaClient.js';

/**
 * Update an electricity invoice by UUID.
 * @param {string} invoiceUuid
 * @param {Object} updates
 */
export async function updateElectricityInvoice(invoiceUuid, updates) {
  return await prisma.electricityInvoices.update({
    where: { uuid: invoiceUuid },
    data: updates,
  });
}
