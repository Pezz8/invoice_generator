import prisma from '../db/prismaClient.js';

/**
 * Hard delete an electricity invoice by UUID.
 * @param {string} invoiceUuid
 */
export async function deleteElectricityInvoiceByUUID(invoiceUuid) {
  return await prisma.electricity_invoices.delete({
    where: { uuid: invoiceUuid },
  });
}
