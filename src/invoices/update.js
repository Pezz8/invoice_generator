import prisma from '../db/prismaClient.js';

export async function updateInvoiceByUUID(invoiceUuid, updates) {
  return await prisma.invoices.update({
    where: { uuid: invoiceUuid },
    data: updates,
  });
}
