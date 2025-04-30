import prisma from '../db/prismaClient.js';

/**
 * Hard delete an electricity invoice by UUID.
 * @param {string} invoiceUuid
 */
export async function deleteElectricityInvoice(invoiceUuid) {
  return await prisma.electricityInvoices.delete({
    where: { uuid: invoiceUuid },
  });
}
