import prisma from '../db/prismaClient.js';

export async function updateInvoicePartByUUID(uuid, updates) {
  return await prisma.invoice_parts.update({
    where: { uuid },
    data: updates,
  });
}
