import prisma from '../db/prismaClient.js';

export async function deleteInvoicePartByUUID(uuid) {
  return await prisma.invoice_parts.delete({
    where: { uuid },
  });
}
