import prisma from '../db/prismaClient.js';

/**
 * Hard delete an invoice by UUID.
 * @param {string} invoiceUuid - UUID of the invoice
 */
export async function deleteInvoice(invoiceUuid) {
  return await prisma.invoices.delete({
    where: { uuid: invoiceUuid },
  });
}
