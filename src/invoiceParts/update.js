import prisma from '../../db/prismaClient.js';

export async function updateInvoicePart(uuid, updates) {
  return await prisma.invoiceParts.update({
    where: { uuid },
    data: updates,
  });
}
